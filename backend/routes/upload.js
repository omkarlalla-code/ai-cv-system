const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { query } = require('../config/database');
const CVParser = require('../services/cvParser');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/cvs');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `cv-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, Word documents, and text files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: 1
    }
});

// CV Upload endpoint
router.post('/upload-cv', authMiddleware, upload.single('cv'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;
        const file = req.file;

        // Create file upload record
        const fileUploadResult = await query(`
            INSERT INTO file_uploads (
                user_id, filename, original_filename, file_path,
                file_size, file_type, upload_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'completed')
            RETURNING id
        `, [
            userId,
            file.filename,
            file.originalname,
            file.path,
            file.size,
            file.mimetype
        ]);

        const fileUploadId = fileUploadResult.rows[0].id;

        // Create initial CV data record
        const cvDataResult = await query(`
            INSERT INTO cv_data (
                user_id, original_filename, file_type, parsing_status
            )
            VALUES ($1, $2, $3, 'processing')
            RETURNING id
        `, [userId, file.originalname, path.extname(file.originalname).substring(1)]);

        const cvDataId = cvDataResult.rows[0].id;

        // Parse CV asynchronously
        parseCV(cvDataId, file.path, file.mimetype, userId, req.ip, req.get('User-Agent'))
            .catch(error => {
                console.error('CV parsing error:', error);
                // Update status to failed
                query(
                    'UPDATE cv_data SET parsing_status = $1 WHERE id = $2',
                    ['failed', cvDataId]
                );
            });

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'upload_cv', $2, $3, $4)
        `, [
            userId,
            JSON.stringify({
                filename: file.originalname,
                fileSize: file.size,
                cvDataId
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'CV uploaded successfully and is being processed',
            data: {
                cvDataId,
                filename: file.originalname,
                status: 'processing'
            }
        });

    } catch (error) {
        // Clean up uploaded file if there was an error
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        next(error);
    }
});

// CV parsing status endpoint
router.get('/cv-status/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cvDataId = req.params.id;

        const result = await query(`
            SELECT
                id,
                parsing_status,
                personal_info,
                created_at,
                updated_at
            FROM cv_data
            WHERE id = $1 AND user_id = $2
        `, [cvDataId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'CV data not found'
            });
        }

        const cvData = result.rows[0];

        res.json({
            success: true,
            data: {
                id: cvData.id,
                status: cvData.parsing_status,
                hasPersonalInfo: !!cvData.personal_info,
                createdAt: cvData.created_at,
                updatedAt: cvData.updated_at
            }
        });

    } catch (error) {
        next(error);
    }
});

// Reprocess CV endpoint (if parsing failed)
router.post('/reprocess-cv/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cvDataId = req.params.id;

        // Get CV data
        const cvResult = await query(`
            SELECT cd.*, fu.file_path, fu.file_type as mime_type
            FROM cv_data cd
            JOIN file_uploads fu ON cd.original_filename = fu.original_filename
                AND cd.user_id = fu.user_id
            WHERE cd.id = $1 AND cd.user_id = $2
            ORDER BY fu.created_at DESC
            LIMIT 1
        `, [cvDataId, userId]);

        if (cvResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'CV data not found'
            });
        }

        const cvData = cvResult.rows[0];

        if (cvData.parsing_status === 'processing') {
            return res.status(400).json({
                success: false,
                message: 'CV is currently being processed'
            });
        }

        if (cvData.parsing_status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'CV has already been successfully processed'
            });
        }

        // Check if file still exists
        try {
            await fs.access(cvData.file_path);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Original file no longer available'
            });
        }

        // Update status to processing
        await query(
            'UPDATE cv_data SET parsing_status = $1, updated_at = NOW() WHERE id = $2',
            ['processing', cvDataId]
        );

        // Reprocess CV
        parseCV(cvDataId, cvData.file_path, cvData.mime_type, userId, req.ip, req.get('User-Agent'))
            .catch(error => {
                console.error('CV reprocessing error:', error);
                query(
                    'UPDATE cv_data SET parsing_status = $1 WHERE id = $2',
                    ['failed', cvDataId]
                );
            });

        res.json({
            success: true,
            message: 'CV reprocessing started',
            data: {
                cvDataId,
                status: 'processing'
            }
        });

    } catch (error) {
        next(error);
    }
});

// Helper function to parse CV asynchronously
async function parseCV(cvDataId, filePath, mimeType, userId, ipAddress, userAgent) {
    try {
        console.log(`Starting CV parsing for CV ID: ${cvDataId}`);

        const parser = new CVParser();

        // Determine file type from mime type
        let fileType;
        switch (mimeType) {
            case 'application/pdf':
                fileType = 'pdf';
                break;
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                fileType = 'docx';
                break;
            case 'text/plain':
                fileType = 'txt';
                break;
            default:
                throw new Error(`Unsupported file type: ${mimeType}`);
        }

        // Parse the CV
        const parseResult = await parser.parseCV(filePath, fileType);

        if (!parseResult.success) {
            throw new Error(parseResult.error);
        }

        const structuredData = parseResult.data;

        // Update CV data with parsed information
        await query(`
            UPDATE cv_data SET
                personal_info = $1,
                education = $2,
                experience = $3,
                skills = $4,
                projects = $5,
                certifications = $6,
                languages = $7,
                interests = $8,
                parsing_status = 'completed',
                updated_at = NOW()
            WHERE id = $9
        `, [
            JSON.stringify(structuredData.personal || {}),
            JSON.stringify(structuredData.education || []),
            JSON.stringify(structuredData.experience || []),
            JSON.stringify(structuredData.skills || {}),
            JSON.stringify(structuredData.projects || []),
            JSON.stringify(structuredData.certifications || []),
            JSON.stringify(structuredData.languages || []),
            JSON.stringify(structuredData.interests || []),
            cvDataId
        ]);

        // Log successful parsing
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'cv_parsed', $2, $3, $4)
        `, [
            userId,
            JSON.stringify({
                cvDataId,
                parsedSections: Object.keys(structuredData),
                name: structuredData.personal?.name || 'Unknown'
            }),
            ipAddress,
            userAgent
        ]);

        console.log(`CV parsing completed successfully for CV ID: ${cvDataId}`);

    } catch (error) {
        console.error(`CV parsing failed for CV ID: ${cvDataId}`, error);

        // Update status to failed
        await query(
            'UPDATE cv_data SET parsing_status = $1, updated_at = NOW() WHERE id = $2',
            ['failed', cvDataId]
        );

        // Log parsing failure
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'cv_parse_failed', $2, $3, $4)
        `, [
            userId,
            JSON.stringify({
                cvDataId,
                error: error.message
            }),
            ipAddress,
            userAgent
        ]);
    }
}

// Get upload history
router.get('/upload-history', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const result = await query(`
            SELECT
                id,
                original_filename,
                file_size,
                file_type,
                upload_status,
                created_at
            FROM file_uploads
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                limit,
                offset,
                hasMore: result.rows.length === limit
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;