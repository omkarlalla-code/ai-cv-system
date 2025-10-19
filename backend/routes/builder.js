const express = require('express');
const router = express.Router();
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/builder/generate-code
 * Generate HTML/CSS code from a screenshot of the visual design
 */
router.post('/generate-code', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Screenshot file is required' });
    }

    // Convert image buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    // Get the design data (optional, for context)
    const designData = req.body.data ? JSON.parse(req.body.data) : null;

    // Construct the prompt for Claude
    const prompt = `You are an expert web developer specializing in converting visual designs into clean, semantic HTML and CSS code.

Analyze the provided screenshot of a portfolio/CV website design and generate production-ready HTML and CSS code that accurately recreates the visual design.

Requirements:
1. Generate a single, complete HTML file with embedded CSS in a <style> tag
2. Use semantic HTML5 elements (header, nav, section, article, footer, etc.)
3. Ensure the design is fully responsive (mobile-first approach)
4. Use modern CSS features (Flexbox, Grid where appropriate)
5. Include appropriate meta tags for SEO and responsiveness
6. Use a clean, consistent color scheme that matches the design
7. Ensure proper spacing, typography, and visual hierarchy
8. Make all interactive elements (buttons, links) functional
9. Add smooth scroll behavior and hover effects where appropriate
10. Ensure accessibility (proper heading hierarchy, alt text placeholders, ARIA labels)

CSS Guidelines:
- Use CSS custom properties (CSS variables) for colors and common values
- Keep CSS organized with clear sections (reset, typography, layout, components)
- Use meaningful class names following BEM or similar convention
- Ensure cross-browser compatibility

Structure Guidelines:
- Include a proper DOCTYPE and HTML structure
- Add a professional font from Google Fonts or use system fonts
- Include sections commonly found in portfolios: Hero, About, Skills, Projects/Experience, Contact
- Make sure the layout adapts gracefully from mobile (320px) to desktop (1920px+)

Output ONLY the complete HTML code with embedded CSS. Do not include any explanations or markdown formatting. Start directly with <!DOCTYPE html>.`;

    // Call Claude API with vision
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the generated HTML from Claude's response
    const generatedHTML = message.content[0].text;

    // Optional: Save to a temporary file or database
    const timestamp = Date.now();
    const outputDir = path.join(__dirname, '../uploads/generated');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }

    const outputPath = path.join(outputDir, `portfolio_${timestamp}.html`);
    await fs.writeFile(outputPath, generatedHTML, 'utf8');

    // Return the generated code
    res.json({
      success: true,
      html: generatedHTML,
      filePath: outputPath,
      message: 'HTML/CSS code generated successfully',
    });

  } catch (error) {
    console.error('Error generating code:', error);

    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Claude API key not configured. Please set ANTHROPIC_API_KEY in environment variables.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate code from screenshot',
      details: error.message
    });
  }
});

/**
 * POST /api/builder/refine-code
 * Refine existing HTML/CSS based on user feedback
 */
router.post('/refine-code', async (req, res) => {
  try {
    const { html, feedback } = req.body;

    if (!html || !feedback) {
      return res.status(400).json({ error: 'HTML and feedback are required' });
    }

    const prompt = `You are an expert web developer. The user has provided HTML/CSS code and wants you to refine it based on their feedback.

Current HTML/CSS:
${html}

User Feedback:
${feedback}

Please modify the HTML/CSS code to address the user's feedback while maintaining the overall structure and design. Output ONLY the complete updated HTML code. Do not include explanations.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const refinedHTML = message.content[0].text;

    res.json({
      success: true,
      html: refinedHTML,
      message: 'Code refined successfully',
    });

  } catch (error) {
    console.error('Error refining code:', error);
    res.status(500).json({
      error: 'Failed to refine code',
      details: error.message
    });
  }
});

module.exports = router;
