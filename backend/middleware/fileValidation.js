const { fileTypeFromBuffer } = require('file-type');
const fs = require('fs').promises;

/**
 * File Validation Middleware
 * Validates uploaded files based on actual content, not just MIME type
 */

const ALLOWED_FILE_TYPES = {
  // PDF files
  'application/pdf': {
    extensions: ['pdf'],
    signatures: ['pdf']
  },
  // Word documents
  'application/msword': {
    extensions: ['doc'],
    signatures: ['doc', 'ole']
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['docx'],
    signatures: ['docx', 'zip']
  },
  // Text files (no magic bytes, validated by extension only)
  'text/plain': {
    extensions: ['txt'],
    signatures: []
  }
};

/**
 * Validates file based on content (magic bytes)
 * @param {string} filePath - Path to uploaded file
 * @param {string} clientMimeType - MIME type provided by client
 * @returns {Promise<Object>} Validation result
 */
async function validateFileContent(filePath, clientMimeType) {
  try {
    // Read first 4KB of file for magic byte detection
    const buffer = Buffer.alloc(4100);
    const fileHandle = await fs.open(filePath, 'r');
    await fileHandle.read(buffer, 0, 4100, 0);
    await fileHandle.close();

    // Detect actual file type from content
    const detectedType = await fileTypeFromBuffer(buffer);

    // Special handling for text files (no magic bytes)
    if (!detectedType && clientMimeType === 'text/plain') {
      // Additional validation: check if file contains mostly text
      const isText = await isTextFile(filePath);
      if (isText) {
        return {
          valid: true,
          detectedType: 'text/plain',
          message: 'Valid text file'
        };
      }
      return {
        valid: false,
        detectedType: null,
        message: 'File does not appear to be a valid text file'
      };
    }

    // Check if detected type is allowed
    if (!detectedType) {
      return {
        valid: false,
        detectedType: null,
        message: 'Could not detect file type'
      };
    }

    // Map detected extension to MIME type
    const detectedMimeType = detectedType.mime;
    const allowedConfig = ALLOWED_FILE_TYPES[detectedMimeType];

    if (!allowedConfig) {
      return {
        valid: false,
        detectedType: detectedMimeType,
        message: `File type not allowed: ${detectedMimeType}`
      };
    }

    // Verify client MIME type matches detected type (or is compatible)
    const isCompatible = isCompatibleMimeType(clientMimeType, detectedMimeType);

    if (!isCompatible) {
      return {
        valid: false,
        detectedType: detectedMimeType,
        message: `File type mismatch. Client: ${clientMimeType}, Detected: ${detectedMimeType}`
      };
    }

    return {
      valid: true,
      detectedType: detectedMimeType,
      message: 'File validation successful'
    };

  } catch (error) {
    console.error('File validation error:', error);
    return {
      valid: false,
      detectedType: null,
      message: `Validation error: ${error.message}`
    };
  }
}

/**
 * Check if MIME types are compatible
 */
function isCompatibleMimeType(clientType, detectedType) {
  // Exact match
  if (clientType === detectedType) {
    return true;
  }

  // DOCX files are ZIP containers
  if (clientType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      && detectedType === 'application/zip') {
    return true;
  }

  // DOC files are OLE containers
  if (clientType === 'application/msword'
      && (detectedType === 'application/x-msdownload' || detectedType === 'application/x-msi')) {
    return true;
  }

  return false;
}

/**
 * Check if file contains mostly text (for .txt files)
 */
async function isTextFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    // Check if file is readable as UTF-8 and contains printable characters
    const printableRatio = (content.match(/[\x20-\x7E\r\n\t]/g) || []).length / content.length;

    // File should be at least 80% printable characters
    return printableRatio >= 0.8;
  } catch (error) {
    // If it can't be read as UTF-8, it's not a text file
    return false;
  }
}

/**
 * Express middleware for file validation
 */
const validateUploadedFile = async (req, res, next) => {
  // Skip if no file uploaded
  if (!req.file) {
    return next();
  }

  try {
    const validation = await validateFileContent(req.file.path, req.file.mimetype);

    if (!validation.valid) {
      // Delete invalid file
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting invalid file:', unlinkError);
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid file',
        details: validation.message
      });
    }

    // Add validation info to request
    req.fileValidation = validation;
    next();

  } catch (error) {
    console.error('File validation middleware error:', error);

    // Clean up file
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'File validation failed',
      details: error.message
    });
  }
};

module.exports = {
  validateFileContent,
  validateUploadedFile,
  ALLOWED_FILE_TYPES
};
