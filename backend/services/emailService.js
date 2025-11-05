/**
 * Email Service
 * Handles sending emails for notifications, verification, password reset, etc.
 */

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.from = process.env.SMTP_FROM || process.env.SMTP_USER;
        this.appName = 'BetterCV';
        this.appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        this.initializeTransporter();
    }

    /**
     * Initialize email transporter
     */
    initializeTransporter() {
        // Skip if SMTP is not configured
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.log('⚠️  Email service not configured (SMTP settings missing)');
            return;
        }

        try {
            this.transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            console.log('✓ Email service initialized');
        } catch (error) {
            console.error('Failed to initialize email service:', error);
        }
    }

    /**
     * Check if email service is available
     */
    isAvailable() {
        return this.transporter !== null;
    }

    /**
     * Send a generic email
     */
    async sendEmail({ to, subject, html, text }) {
        if (!this.isAvailable()) {
            console.log('Email not sent (service unavailable):', subject);
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"${this.appName}" <${this.from}>`,
                to,
                subject,
                text,
                html
            });

            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send welcome email to new users
     */
    async sendWelcomeEmail(user) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to ${this.appName}!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.username},</h2>
                        <p>Thank you for joining ${this.appName}! We're excited to help you create your professional portfolio website.</p>

                        <p><strong>What you can do:</strong></p>
                        <ul>
                            <li>Upload your CV and let AI parse your information</li>
                            <li>Choose from professional templates</li>
                            <li>Customize your website with our drag-and-drop builder</li>
                            <li>Publish to your own subdomain</li>
                            <li>Get AI-powered suggestions for your portfolio</li>
                        </ul>

                        <a href="${this.appUrl}/upload" class="button">Get Started</a>

                        <p>If you have any questions, feel free to reach out to our support team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
                        <p><a href="${this.appUrl}">Visit Website</a> | <a href="${this.appUrl}/help">Help Center</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Welcome to ${this.appName}!

Hi ${user.username},

Thank you for joining ${this.appName}! We're excited to help you create your professional portfolio website.

What you can do:
- Upload your CV and let AI parse your information
- Choose from professional templates
- Customize your website with our drag-and-drop builder
- Publish to your own subdomain
- Get AI-powered suggestions for your portfolio

Get started: ${this.appUrl}/upload

If you have any questions, feel free to reach out to our support team.

© ${new Date().getFullYear()} ${this.appName}. All rights reserved.
        `;

        return this.sendEmail({
            to: user.email,
            subject: `Welcome to ${this.appName}!`,
            html,
            text
        });
    }

    /**
     * Send email verification code
     */
    async sendVerificationEmail(user, verificationCode) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; text-align: center; }
                    .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #f5f5f5; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.username},</h2>
                        <p>Your verification code is:</p>

                        <div class="code">${verificationCode}</div>

                        <p>This code will expire in 15 minutes.</p>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Verify Your Email

Hi ${user.username},

Your verification code is: ${verificationCode}

This code will expire in 15 minutes.

If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} ${this.appName}. All rights reserved.
        `;

        return this.sendEmail({
            to: user.email,
            subject: `Verify your ${this.appName} email`,
            html,
            text
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.username},</h2>
                        <p>We received a request to reset your password for your ${this.appName} account.</p>

                        <p>Click the button below to reset your password:</p>

                        <a href="${resetUrl}" class="button">Reset Password</a>

                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request a password reset, you can safely ignore this email. Your password won't change.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Password Reset

Hi ${user.username},

We received a request to reset your password for your ${this.appName} account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password won't change.

© ${new Date().getFullYear()} ${this.appName}. All rights reserved.
        `;

        return this.sendEmail({
            to: user.email,
            subject: `Reset your ${this.appName} password`,
            html,
            text
        });
    }

    /**
     * Send website published notification
     */
    async sendWebsitePublishedEmail(user, website) {
        const websiteUrl = `https://${website.subdomain}.bettercv.com`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Your Website is Live!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.username},</h2>
                        <p>Congratulations! Your website "<strong>${website.site_title}</strong>" has been published successfully.</p>

                        <p>Your website is now live at:</p>
                        <p style="font-size: 18px; font-weight: bold; color: #000;">${websiteUrl}</p>

                        <a href="${websiteUrl}" class="button">View Your Website</a>

                        <p><strong>Next steps:</strong></p>
                        <ul>
                            <li>Share your website URL on social media</li>
                            <li>Add it to your resume and email signature</li>
                            <li>Continue to update and improve your portfolio</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
🎉 Your Website is Live!

Hi ${user.username},

Congratulations! Your website "${website.site_title}" has been published successfully.

Your website is now live at:
${websiteUrl}

Next steps:
- Share your website URL on social media
- Add it to your resume and email signature
- Continue to update and improve your portfolio

© ${new Date().getFullYear()} ${this.appName}. All rights reserved.
        `;

        return this.sendEmail({
            to: user.email,
            subject: `🎉 Your website is live!`,
            html,
            text
        });
    }

    /**
     * Send template published notification
     */
    async sendTemplatePublishedEmail(user, template) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Template Published!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${user.username},</h2>
                        <p>Great news! Your template "<strong>${template.name}</strong>" has been published to the template marketplace.</p>

                        <p>Other users can now discover and use your template to create their own websites.</p>

                        <p>We'll notify you when people start using your template!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Template Published!

Hi ${user.username},

Great news! Your template "${template.name}" has been published to the template marketplace.

Other users can now discover and use your template to create their own websites.

We'll notify you when people start using your template!

© ${new Date().getFullYear()} ${this.appName}. All rights reserved.
        `;

        return this.sendEmail({
            to: user.email,
            subject: `Your template has been published!`,
            html,
            text
        });
    }
}

// Export singleton instance
module.exports = new EmailService();
