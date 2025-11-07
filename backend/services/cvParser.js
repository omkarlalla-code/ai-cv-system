const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');

class CVParser {
  constructor() {
    // Check for API key (supports both ANTHROPIC_API_KEY and CLAUDE_API_KEY for backwards compatibility)
    this.claudeApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    this.claudeApiUrl = 'https://api.anthropic.com/v1/messages';
    this.demoMode = !this.claudeApiKey;

    if (this.demoMode) {
      console.warn('⚠️  DEMO MODE: No Anthropic API key found. Using mock CV parsing.');
      console.warn('   Set ANTHROPIC_API_KEY in your .env file for real AI parsing.');
      console.warn('   Get your key at: https://console.anthropic.com/');
    }
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
   * Falls back to demo data if no API key is configured
   */
  async extractStructuredData(rawText) {
    // If in demo mode, return realistic mock data
    if (this.demoMode) {
      console.log('🎭 Using demo mode: Returning mock CV data');
      return this.generateDemoData(rawText);
    }

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
   * Generate demo/mock data for testing without API key
   * Attempts to extract basic info from raw text, falls back to realistic defaults
   */
  generateDemoData(rawText) {
    // Try to extract name from first line (common in CVs)
    const lines = rawText.split('\n').filter(line => line.trim());
    const potentialName = lines[0]?.trim() || 'John Doe';

    // Try to find email with regex
    const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : 'demo@example.com';

    // Try to find phone number
    const phoneMatch = rawText.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);
    const phone = phoneMatch ? phoneMatch[0] : '+1 (555) 123-4567';

    console.log(`   Extracted: ${potentialName} <${email}>`);

    return {
      personal: {
        name: potentialName,
        email: email,
        phone: phone,
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/demo-user',
        github: 'github.com/demo-user',
        website: 'demo-portfolio.com',
        summary: 'Experienced professional with a strong background in software development and project management. Passionate about building innovative solutions and leading high-performing teams.'
      },
      education: [
        {
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startYear: '2016',
          endYear: '2020',
          grade: '3.8 GPA',
          location: 'Berkeley, CA',
          description: 'Focus on Software Engineering and Artificial Intelligence'
        },
        {
          institution: 'Stanford University',
          degree: 'Master of Science',
          field: 'Computer Science',
          startYear: '2020',
          endYear: '2022',
          grade: '3.9 GPA',
          location: 'Stanford, CA',
          description: 'Specialization in Machine Learning and Data Science'
        }
      ],
      experience: [
        {
          company: 'Tech Innovations Inc.',
          position: 'Senior Software Engineer',
          startDate: 'Jan 2022',
          endDate: 'Present',
          location: 'San Francisco, CA',
          description: 'Leading development of cloud-native applications using modern technologies. Architected and implemented microservices infrastructure serving 1M+ users. Mentored junior developers and conducted code reviews.',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes']
        },
        {
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: 'Jun 2020',
          endDate: 'Dec 2021',
          location: 'San Francisco, CA',
          description: 'Built and maintained full-stack web applications. Implemented RESTful APIs and responsive frontend interfaces. Collaborated with cross-functional teams in agile environment.',
          technologies: ['JavaScript', 'Python', 'MongoDB', 'Express.js', 'React']
        }
      ],
      projects: [
        {
          name: 'E-Commerce Platform',
          description: 'Developed a scalable e-commerce platform with payment integration, inventory management, and real-time analytics. Handled 10k+ daily active users.',
          technologies: ['React', 'Node.js', 'Stripe API', 'Redis', 'PostgreSQL'],
          startDate: 'Mar 2021',
          endDate: 'Dec 2021',
          url: 'demo-ecommerce.com',
          github: 'github.com/demo/ecommerce'
        },
        {
          name: 'AI Chatbot Service',
          description: 'Created an intelligent chatbot using natural language processing. Integrated with multiple messaging platforms and CRM systems.',
          technologies: ['Python', 'TensorFlow', 'FastAPI', 'Docker'],
          startDate: 'Jun 2022',
          endDate: 'Nov 2022',
          url: null,
          github: 'github.com/demo/ai-chatbot'
        }
      ],
      skills: {
        programming: ['JavaScript', 'Python', 'TypeScript', 'Java', 'Go'],
        frameworks: ['React', 'Node.js', 'Express', 'Django', 'FastAPI'],
        tools: ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
        databases: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'],
        other: ['AWS', 'Microservices', 'REST APIs', 'GraphQL', 'Agile/Scrum']
      },
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: 'Mar 2022',
          url: 'aws.amazon.com/certification'
        },
        {
          name: 'Certified Kubernetes Administrator',
          issuer: 'Cloud Native Computing Foundation',
          date: 'Jul 2023',
          url: null
        }
      ],
      languages: [
        {
          name: 'English',
          proficiency: 'Native'
        },
        {
          name: 'Spanish',
          proficiency: 'Intermediate'
        }
      ],
      interests: ['Open Source Contribution', 'Machine Learning', 'Cloud Architecture', 'Technical Writing', 'Mentoring']
    };
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