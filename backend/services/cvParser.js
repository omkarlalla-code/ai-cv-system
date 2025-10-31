const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');

class CVParser {
  constructor() {
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.claudeApiUrl = 'https://api.anthropic.com/v1/messages';
  }

  /**
   * Main parsing function - routes to appropriate parser based on file type
   */
  async parseCV(filePath, fileType) {
    try {
      console.log(`Starting CV parsing for file: ${filePath}, type: ${fileType}`);

      let rawText = '';

      switch (fileType.toLowerCase()) {
        case 'pdf':
          rawText = await this.parsePDF(filePath);
          break;
        case 'docx':
        case 'doc':
          rawText = await this.parseWord(filePath);
          break;
        case 'txt':
          rawText = await this.parseText(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      console.log(`Extracted ${rawText.length} characters of text`);

      // Use Claude AI to structure the extracted text
      const structuredData = await this.extractStructuredData(rawText);

      return {
        success: true,
        data: structuredData,
        rawText: rawText.substring(0, 1000) // Store first 1000 chars for debugging
      };

    } catch (error) {
      console.error('CV parsing error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Parse PDF files
   */
  async parsePDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse Word documents
   */
  async parseWord(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Word document parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse text files
   */
  async parseText(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Text file parsing failed: ${error.message}`);
    }
  }

  /**
   * Use Claude AI to extract structured data from raw text
   */
  async extractStructuredData(rawText) {
    try {
      const prompt = `
You are an expert CV/Resume parser. Extract structured information from the following CV text and return it as a JSON object with the exact structure below. Be thorough and accurate.

Required JSON structure:
{
  "personal": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/profile",
    "github": "github.com/username",
    "website": "personal-website.com",
    "summary": "Professional summary or objective"
  },
  "education": [
    {
      "institution": "University/School Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startYear": "2020",
      "endYear": "2024",
      "grade": "GPA or Grade",
      "location": "City, Country",
      "description": "Additional details or achievements"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "location": "City, Country",
      "description": "Job responsibilities and achievements",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description and what it does",
      "technologies": ["Tech1", "Tech2"],
      "startDate": "Month Year",
      "endDate": "Month Year",
      "url": "project-url.com",
      "github": "github.com/repo"
    }
  ],
  "skills": {
    "programming": ["Python", "JavaScript"],
    "frameworks": ["React", "Node.js"],
    "tools": ["Git", "Docker"],
    "databases": ["PostgreSQL", "MongoDB"],
    "other": ["Other relevant skills"]
  },
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Month Year",
      "url": "certificate-url.com"
    }
  ],
  "languages": [
    {
      "name": "Language Name",
      "proficiency": "Native/Fluent/Intermediate/Basic"
    }
  ],
  "interests": ["Interest 1", "Interest 2", "Interest 3"]
}

Important guidelines:
1. Extract ALL available information accurately
2. If information is missing, use null or empty array []
3. Standardize date formats (use "Month Year" format)
4. Clean up and format text properly
5. Categorize skills appropriately
6. Extract URLs and links where available
7. Be consistent with formatting

CV Text to parse:
${rawText}

Return only the JSON object, no additional text or explanations.`;

      const response = await axios.post(this.claudeApiUrl, {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      const aiResponse = response.data.content[0].text;

      // Clean up the response and parse JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const structuredData = JSON.parse(jsonMatch[0]);

      // Validate the structure
      this.validateStructuredData(structuredData);

      return structuredData;

    } catch (error) {
      console.error('AI extraction error:', error);
      throw new Error(`Failed to extract structured data: ${error.message}`);
    }
  }

  /**
   * Validate the structured data format
   */
  validateStructuredData(data) {
    const requiredFields = ['personal', 'education', 'experience', 'projects', 'skills'];

    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate personal info has at least name
    if (!data.personal || !data.personal.name) {
      throw new Error('Personal information must include a name');
    }

    // Ensure arrays are arrays
    const arrayFields = ['education', 'experience', 'projects', 'certifications', 'languages', 'interests'];
    for (const field of arrayFields) {
      if (data[field] && !Array.isArray(data[field])) {
        data[field] = [data[field]]; // Convert to array if it's a single object
      }
    }

    return true;
  }

  /**
   * Clean and sanitize extracted text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }
}

module.exports = CVParser;