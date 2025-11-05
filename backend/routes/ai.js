const express = require('express');
const { query } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * @route   POST /api/ai/brainstorm
 * @desc    AI brainstorming chat for portfolio ideas
 * @access  Private
 */
router.post('/ai/brainstorm', authMiddleware, [
    body('messages').isArray().withMessage('Messages must be an array'),
    body('messages.*.role').isIn(['user', 'assistant']).withMessage('Invalid message role'),
    body('messages.*.content').notEmpty().withMessage('Message content is required')
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

        const userId = req.user.id;
        const { messages } = req.body;

        // System prompt for brainstorming
        const systemPrompt = `You are a helpful AI assistant specializing in portfolio and personal website design.
Your role is to help users brainstorm ideas for their portfolio websites, including:
- Content suggestions (sections, projects, skills to highlight)
- Design and layout recommendations
- Personal branding advice
- Project descriptions and presentation ideas
- Career positioning and messaging

Be creative, constructive, and specific. Ask clarifying questions when needed.
Keep responses concise but valuable.`;

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages
        });

        const assistantMessage = response.content[0].text;

        // Log the brainstorm session
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'ai_brainstorm',
            JSON.stringify({
                messageCount: messages.length,
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            data: {
                response: assistantMessage,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens
                }
            }
        });

    } catch (error) {
        console.error('AI Brainstorm Error:', error);

        // Handle Anthropic API errors
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Please try again in a moment.'
            });
        }

        if (error.status === 401) {
            return res.status(500).json({
                success: false,
                message: 'AI service authentication failed. Please contact support.'
            });
        }

        next(error);
    }
});

/**
 * @route   POST /api/ai/suggestions
 * @desc    Get AI suggestions based on context
 * @access  Private
 */
router.post('/ai/suggestions', authMiddleware, [
    body('context').notEmpty().withMessage('Context is required'),
    body('type').optional().isIn(['content', 'design', 'career', 'general'])
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

        const userId = req.user.id;
        const { context, type = 'general' } = req.body;

        // Build system prompt based on suggestion type
        const systemPrompts = {
            content: 'You are an expert in portfolio content strategy. Provide specific, actionable suggestions for portfolio content.',
            design: 'You are an expert in web design and UX. Provide specific design and layout suggestions.',
            career: 'You are a career coach specializing in personal branding. Provide career positioning advice.',
            general: 'You are a helpful assistant for portfolio website creation. Provide helpful suggestions.'
        };

        const systemPrompt = systemPrompts[type];

        // Call Claude API for suggestions
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 512,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: `Based on this context: "${context}"\n\nProvide 3-5 specific, actionable suggestions. Format as a numbered list.`
            }]
        });

        const suggestions = response.content[0].text;

        // Parse suggestions into array (assuming numbered list format)
        const suggestionList = suggestions
            .split('\n')
            .filter(line => line.match(/^\d+\./))
            .map(line => line.replace(/^\d+\.\s*/, '').trim());

        // Log the suggestion request
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'ai_suggestions',
            JSON.stringify({
                type,
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            data: {
                suggestions: suggestionList,
                rawResponse: suggestions,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens
                }
            }
        });

    } catch (error) {
        console.error('AI Suggestions Error:', error);

        // Handle Anthropic API errors
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Please try again in a moment.'
            });
        }

        next(error);
    }
});

/**
 * @route   POST /api/ai/improve-text
 * @desc    Improve a piece of text (bio, project description, etc.)
 * @access  Private
 */
router.post('/ai/improve-text', authMiddleware, [
    body('text').notEmpty().withMessage('Text to improve is required'),
    body('purpose').optional().isIn(['bio', 'project', 'headline', 'general'])
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

        const userId = req.user.id;
        const { text, purpose = 'general' } = req.body;

        // Build prompt based on purpose
        const prompts = {
            bio: 'Improve this professional bio to be more engaging and impactful. Keep it concise and professional.',
            project: 'Improve this project description to better showcase the work and its value. Highlight key achievements.',
            headline: 'Improve this headline to be more attention-grabbing and professional. Keep it under 60 characters.',
            general: 'Improve this text to be clearer, more engaging, and professional.'
        };

        const improvePrompt = prompts[purpose];

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 512,
            messages: [{
                role: 'user',
                content: `${improvePrompt}\n\nOriginal text:\n"${text}"\n\nProvide only the improved version, without explanations.`
            }]
        });

        const improvedText = response.content[0].text.trim();

        // Log the improvement request
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'ai_improve_text',
            JSON.stringify({
                purpose,
                originalLength: text.length,
                improvedLength: improvedText.length,
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            data: {
                original: text,
                improved: improvedText,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens
                }
            }
        });

    } catch (error) {
        console.error('AI Improve Text Error:', error);

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Please try again in a moment.'
            });
        }

        next(error);
    }
});

module.exports = router;
