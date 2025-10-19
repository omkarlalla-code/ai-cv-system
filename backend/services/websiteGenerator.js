const Handlebars = require('handlebars');

class WebsiteGenerator {
    constructor() {
        this.setupHelpers();
    }

    setupHelpers() {
        // Register Handlebars helpers
        Handlebars.registerHelper('eq', function(a, b) {
            return a === b;
        });

        Handlebars.registerHelper('not', function(value) {
            return !value;
        });

        Handlebars.registerHelper('gt', function(a, b) {
            return a > b;
        });

        Handlebars.registerHelper('formatDate', function(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
        });

        Handlebars.registerHelper('formatYear', function(date) {
            if (!date) return '';
            return new Date(date).getFullYear();
        });

        Handlebars.registerHelper('json', function(context) {
            return JSON.stringify(context);
        });

        Handlebars.registerHelper('truncate', function(str, len) {
            if (!str) return '';
            if (str.length > len) {
                return str.substring(0, len) + '...';
            }
            return str;
        });
    }

    async generatePreview(template, cvData, options = {}) {
        try {
            const templateData = this.prepareCVData(cvData);
            const customizedTemplate = this.customizeTemplate(template, options);

            // Compile and render HTML
            const htmlTemplate = Handlebars.compile(customizedTemplate.html_content);
            const renderedHtml = htmlTemplate(templateData);

            // Inject custom CSS
            const finalHtml = this.injectStyles(renderedHtml, customizedTemplate.css_content);

            return finalHtml;

        } catch (error) {
            console.error('Preview generation error:', error);
            throw new Error(`Failed to generate preview: ${error.message}`);
        }
    }

    async generateWebsite(template, cvData, options = {}) {
        try {
            const templateData = this.prepareCVData(cvData);
            const customizedTemplate = this.customizeTemplate(template, options);

            // Compile templates
            const htmlTemplate = Handlebars.compile(customizedTemplate.html_content);
            const cssTemplate = Handlebars.compile(customizedTemplate.css_content);

            // Render files
            const renderedHtml = htmlTemplate(templateData);
            const renderedCss = cssTemplate(templateData);

            // Generate complete website files
            const websiteFiles = {
                'index.html': this.generateIndexHtml(renderedHtml, renderedCss, options),
                'style.css': renderedCss,
                'assets/favicon.ico': this.generateFavicon(),
                'assets/og-image.png': this.generateOGImage(templateData),
                '.gitignore': this.generateGitignore(),
                'README.md': this.generateReadme(templateData, options)
            };

            return websiteFiles;

        } catch (error) {
            console.error('Website generation error:', error);
            throw new Error(`Failed to generate website: ${error.message}`);
        }
    }

    prepareCVData(cvData) {
        // Parse JSON fields and prepare data for template
        const prepared = {
            personal: this.safeJSONParse(cvData.personal_info, {}),
            education: this.safeJSONParse(cvData.education, []),
            experience: this.safeJSONParse(cvData.experience, []),
            skills: this.safeJSONParse(cvData.skills, {}),
            projects: this.safeJSONParse(cvData.projects, []),
            certifications: this.safeJSONParse(cvData.certifications, []),
            languages: this.safeJSONParse(cvData.languages, []),
            interests: this.safeJSONParse(cvData.interests, [])
        };

        // Ensure personal info has required fields
        if (!prepared.personal.name) {
            prepared.personal.name = 'Your Name';
        }

        // Format dates in experience and education
        prepared.experience = prepared.experience.map(exp => ({
            ...exp,
            startDate: this.formatDate(exp.startDate),
            endDate: exp.endDate === 'Present' ? 'Present' : this.formatDate(exp.endDate)
        }));

        prepared.education = prepared.education.map(edu => ({
            ...edu,
            startYear: this.formatYear(edu.startYear),
            endYear: this.formatYear(edu.endYear)
        }));

        // Add computed fields
        prepared.hasExperience = prepared.experience.length > 0;
        prepared.hasEducation = prepared.education.length > 0;
        prepared.hasProjects = prepared.projects.length > 0;
        prepared.hasSkills = Object.keys(prepared.skills).length > 0;
        prepared.hasCertifications = prepared.certifications.length > 0;
        prepared.hasLanguages = prepared.languages.length > 0;
        prepared.hasInterests = prepared.interests.length > 0;

        return prepared;
    }

    customizeTemplate(template, options = {}) {
        let customizedHtml = template.html_content;
        let customizedCss = template.css_content;

        // Apply color customizations
        if (options.primaryColor) {
            customizedCss = customizedCss.replace(
                /var\(--primary-color\)|#2563eb/g,
                options.primaryColor
            );
        }

        // Apply title customizations
        if (options.siteTitle) {
            customizedHtml = customizedHtml.replace(
                /<title>.*?<\/title>/g,
                `<title>${options.siteTitle}</title>`
            );
        }

        return {
            html_content: customizedHtml,
            css_content: customizedCss
        };
    }

    injectStyles(html, css) {
        // Find the closing </head> tag and inject styles
        const styleTag = `<style>${css}</style>`;

        if (html.includes('</head>')) {
            return html.replace('</head>', `${styleTag}</head>`);
        } else {
            // If no head tag, wrap with basic HTML structure
            return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio</title>
    ${styleTag}
</head>
<body>
    ${html}
</body>
</html>`;
        }
    }

    generateIndexHtml(renderedHtml, renderedCss, options = {}) {
        // Generate complete HTML with meta tags, SEO, and analytics
        const metaTags = this.generateMetaTags(options);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${metaTags}
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="assets/favicon.ico">
</head>
<body>
    ${renderedHtml}

    <!-- Analytics -->
    <script>
        // Basic page view tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    </script>
</body>
</html>`;
    }

    generateMetaTags(options = {}) {
        const title = options.siteTitle || 'Portfolio';
        const description = options.description || 'Professional portfolio website';

        return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="portfolio, resume, CV, professional">
    <meta name="author" content="${options.authorName || ''}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${options.siteUrl || ''}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="assets/og-image.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${options.siteUrl || ''}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="assets/og-image.png">

    <!-- Additional meta tags -->
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="${options.primaryColor || '#2563eb'}">
    <link rel="canonical" href="${options.siteUrl || ''}">`;
    }

    generateFavicon() {
        // Return base64 encoded simple favicon
        return 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    }

    generateOGImage(templateData) {
        // Return placeholder for now - in production would generate actual image
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    generateGitignore() {
        return `# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Node modules (if any)
node_modules/

# Temporary files
*.tmp
*.temp`;
    }

    generateReadme(templateData, options = {}) {
        const name = templateData.personal?.name || 'Portfolio Owner';
        const siteUrl = options.siteUrl || 'https://yourname.bettercv.com';

        return `# ${name}'s Portfolio

This is a professional portfolio website generated with BetterCV.

## About

${templateData.personal?.summary || 'Professional portfolio showcasing skills, experience, and projects.'}

## Live Site

Visit the live portfolio at: [${siteUrl}](${siteUrl})

## Built With

- **BetterCV** - Professional portfolio generator
- **HTML5** - Markup language
- **CSS3** - Styling and layout
- **Handlebars** - Template engine

## Features

- Responsive design
- SEO optimized
- Fast loading
- Professional layout
- Mobile-friendly

## Contact

${templateData.personal?.email ? `- Email: ${templateData.personal.email}` : ''}
${templateData.personal?.linkedin ? `- LinkedIn: ${templateData.personal.linkedin}` : ''}
${templateData.personal?.github ? `- GitHub: ${templateData.personal.github}` : ''}

---

*Generated with ❤️ by BetterCV*`;
    }

    safeJSONParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            return defaultValue;
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
            });
        } catch (error) {
            return dateString;
        }
    }

    formatYear(dateString) {
        if (!dateString) return '';
        try {
            return new Date(dateString).getFullYear().toString();
        } catch (error) {
            return dateString;
        }
    }
}

module.exports = WebsiteGenerator;