const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const { query, getClient } = require('../config/database');
const router = express.Router();

// Register endpoint
router.post('/register', [
    body('username')
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const userResult = await query(`
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
        `, [username, email, passwordHash]);

        const user = userResult.rows[0];

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await query(`
            INSERT INTO email_verifications (user_id, verification_code, expires_at)
            VALUES ($1, $2, $3)
        `, [user.id, verificationCode, expiresAt]);

        // TODO: Send verification email (implement email service)
        console.log(`Verification code for ${email}: ${verificationCode}`);

        res.status(201).json({
            success: true,
            message: 'User created successfully. Please check your email for verification code.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
});

// Login endpoint
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, twoFactorCode } = req.body;

        // Get user
        const userResult = await query(
            'SELECT id, username, email, password_hash, two_fa_secret, is_verified, is_active FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = userResult.rows[0];

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account deactivated'
            });
        }

        if (!user.is_verified) {
            return res.status(401).json({
                success: false,
                message: 'Email not verified'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check 2FA if enabled
        if (user.two_fa_secret) {
            if (!twoFactorCode) {
                return res.status(401).json({
                    success: false,
                    message: 'Two-factor authentication code required',
                    requiresTwoFactor: true
                });
            }

            const isValidToken = speakeasy.totp.verify({
                secret: user.two_fa_secret,
                encoding: 'base32',
                token: twoFactorCode,
                window: 2
            });

            if (!isValidToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid two-factor authentication code'
                });
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
            VALUES ($1, 'login', $2, $3)
        `, [user.id, req.ip, req.get('User-Agent')]);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
});

// Email verification endpoint
router.post('/verify-email', [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, code } = req.body;

        const client = await getClient();

        try {
            await client.query('BEGIN');

            // Get user and verification record
            const result = await client.query(`
                SELECT u.id, u.username, u.email, ev.verification_code, ev.expires_at, ev.is_used
                FROM users u
                JOIN email_verifications ev ON u.id = ev.user_id
                WHERE u.email = $1 AND ev.verification_code = $2 AND ev.is_used = false
                ORDER BY ev.created_at DESC
                LIMIT 1
            `, [email, code]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification code'
                });
            }

            const verification = result.rows[0];

            if (new Date() > new Date(verification.expires_at)) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Verification code expired'
                });
            }

            // Mark user as verified
            await client.query(
                'UPDATE users SET is_verified = true WHERE id = $1',
                [verification.id]
            );

            // Mark verification as used
            await client.query(
                'UPDATE email_verifications SET is_used = true WHERE user_id = $1 AND verification_code = $2',
                [verification.id, code]
            );

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Email verified successfully'
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        next(error);
    }
});

// Password reset request
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Valid email required'
            });
        }

        const { email } = req.body;

        const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);

        // Always return success to prevent email enumeration
        if (userResult.rows.length === 0) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        const user = userResult.rows[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await query(`
            INSERT INTO password_resets (user_id, reset_token, expires_at)
            VALUES ($1, $2, $3)
        `, [user.id, resetToken, expiresAt]);

        // TODO: Send reset email
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;