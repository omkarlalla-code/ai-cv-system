-- Sample templates for BetterCV system

INSERT INTO templates (id, name, description, html_content, css_content, category, is_public, is_featured) VALUES
(
    uuid_generate_v4(),
    'Professional',
    'Clean and modern design perfect for corporate roles',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{personal.name}} - Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">
                <h1>{{personal.name}}</h1>
            </div>
            <ul class="nav-menu">
                <li><a href="#about">About</a></li>
                {{#if hasExperience}}<li><a href="#experience">Experience</a></li>{{/if}}
                {{#if hasEducation}}<li><a href="#education">Education</a></li>{{/if}}
                {{#if hasSkills}}<li><a href="#skills">Skills</a></li>{{/if}}
                {{#if hasProjects}}<li><a href="#projects">Projects</a></li>{{/if}}
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="main">
        <section id="home" class="hero">
            <div class="container">
                <div class="hero-content">
                    <h2 class="hero-title">{{personal.name}}</h2>
                    {{#if personal.location}}<p class="hero-subtitle">{{personal.location}}</p>{{/if}}
                    {{#if personal.summary}}<p class="hero-description">{{personal.summary}}</p>{{/if}}
                    <div class="hero-actions">
                        {{#if hasProjects}}<a href="#projects" class="btn btn-primary">View Projects</a>{{/if}}
                        <a href="#contact" class="btn btn-secondary">Contact Me</a>
                    </div>
                </div>
            </div>
        </section>

        {{#if hasExperience}}
        <section id="experience" class="experience">
            <div class="container">
                <h2 class="section-title">Work Experience</h2>
                <div class="timeline">
                    {{#each experience}}
                    <div class="timeline-item">
                        <div class="timeline-content">
                            <h3>{{position}}</h3>
                            <h4>{{company}}</h4>
                            <p class="timeline-date">{{startDate}} - {{endDate}}</p>
                            {{#if location}}<p class="timeline-location">{{location}}</p>{{/if}}
                            {{#if description}}<p class="timeline-description">{{description}}</p>{{/if}}
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>
        </section>
        {{/if}}

        {{#if hasEducation}}
        <section id="education" class="education">
            <div class="container">
                <h2 class="section-title">Education</h2>
                <div class="education-grid">
                    {{#each education}}
                    <div class="education-card">
                        <h3>{{degree}}</h3>
                        {{#if field}}<h4>{{field}}</h4>{{/if}}
                        <p class="institution">{{institution}}</p>
                        <p class="education-date">{{startYear}} - {{endYear}}</p>
                        {{#if grade}}<p class="grade">{{grade}}</p>{{/if}}
                    </div>
                    {{/each}}
                </div>
            </div>
        </section>
        {{/if}}

        {{#if hasSkills}}
        <section id="skills" class="skills">
            <div class="container">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-grid">
                    {{#if skills.programming}}
                    <div class="skill-category">
                        <h3>Programming Languages</h3>
                        <div class="skill-tags">
                            {{#each skills.programming}}<span class="skill-tag">{{this}}</span>{{/each}}
                        </div>
                    </div>
                    {{/if}}
                </div>
            </div>
        </section>
        {{/if}}

        <section id="contact" class="contact">
            <div class="container">
                <h2 class="section-title">Contact Information</h2>
                <div class="contact-content">
                    {{#if personal.email}}<p>Email: <a href="mailto:{{personal.email}}">{{personal.email}}</a></p>{{/if}}
                    {{#if personal.phone}}<p>Phone: <a href="tel:{{personal.phone}}">{{personal.phone}}</a></p>{{/if}}
                    {{#if personal.linkedin}}<p>LinkedIn: <a href="https://{{personal.linkedin}}">{{personal.linkedin}}</a></p>{{/if}}
                </div>
            </div>
        </section>
    </main>
</body>
</html>',
    ':root {
        --primary-color: #2563eb;
        --text-primary: #0f172a;
        --text-secondary: #64748b;
        --background: #ffffff;
        --surface: #f8fafc;
        --border: #e2e8f0;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body { font-family: Inter, -apple-system, sans-serif; line-height: 1.6; color: var(--text-primary); }

    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

    .header { position: fixed; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 1rem 0; }

    .nav { display: flex; justify-content: space-between; align-items: center; }
    .nav-brand h1 { color: var(--primary-color); }
    .nav-menu { display: flex; list-style: none; gap: 2rem; }
    .nav-menu a { text-decoration: none; color: var(--text-secondary); }

    .hero { padding: 8rem 0 4rem; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 100vh; display: flex; align-items: center; }
    .hero-title { font-size: 3.5rem; font-weight: 700; margin-bottom: 1rem; }
    .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 1rem; }
    .hero-description { font-size: 1.125rem; color: var(--text-secondary); margin-bottom: 2rem; }

    .btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; transition: all 0.2s; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-secondary { background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color); }

    .section-title { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; }

    .experience, .education, .skills, .contact { padding: 6rem 0; }
    .experience:nth-child(even), .education:nth-child(even), .skills:nth-child(even) { background: var(--surface); }

    .timeline-item { margin-bottom: 2rem; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .timeline-item h3 { color: var(--primary-color); margin-bottom: 0.5rem; }
    .timeline-date { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; }

    .education-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .education-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

    .skills-grid { display: grid; gap: 2rem; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .skill-tag { background: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; }

    .contact-content { max-width: 600px; margin: 0 auto; text-align: center; }
    .contact-content p { margin-bottom: 1rem; }
    .contact-content a { color: var(--primary-color); text-decoration: none; }',
    'professional',
    true,
    true
),

(
    uuid_generate_v4(),
    'Creative',
    'Bold and colorful design for creative professionals',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{personal.name}} - Creative Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="creative-bg"></div>

    <header class="header">
        <div class="container">
            <h1 class="logo">{{personal.name}}</h1>
            <nav class="nav">
                <a href="#about">About</a>
                {{#if hasProjects}}<a href="#projects">Work</a>{{/if}}
                {{#if hasSkills}}<a href="#skills">Skills</a>{{/if}}
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </header>

    <main>
        <section id="about" class="hero">
            <div class="container">
                <div class="hero-content">
                    <h2 class="hero-title">{{personal.name}}</h2>
                    {{#if personal.summary}}<p class="hero-subtitle">{{personal.summary}}</p>{{/if}}
                    <div class="hero-buttons">
                        {{#if hasProjects}}<a href="#projects" class="btn btn-gradient">View My Work</a>{{/if}}
                        <a href="#contact" class="btn btn-outline">Get In Touch</a>
                    </div>
                </div>
            </div>
        </section>

        {{#if hasProjects}}
        <section id="projects" class="projects">
            <div class="container">
                <h2 class="section-title gradient-text">Featured Projects</h2>
                <div class="projects-grid">
                    {{#each projects}}
                    <div class="project-card">
                        <div class="project-header">
                            <h3>{{name}}</h3>
                            {{#if technologies}}<div class="project-tech">{{#each technologies}}<span>{{this}}</span>{{/each}}</div>{{/if}}
                        </div>
                        {{#if description}}<p>{{description}}</p>{{/if}}
                        <div class="project-links">
                            {{#if url}}<a href="{{url}}" target="_blank">Live Demo</a>{{/if}}
                            {{#if github}}<a href="{{github}}" target="_blank">Code</a>{{/if}}
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>
        </section>
        {{/if}}

        {{#if hasSkills}}
        <section id="skills" class="skills">
            <div class="container">
                <h2 class="section-title">Skills & Expertise</h2>
                <div class="skills-creative">
                    {{#if skills.programming}}
                    <div class="skill-group">
                        <h3>Programming</h3>
                        {{#each skills.programming}}<span class="skill-bubble">{{this}}</span>{{/each}}
                    </div>
                    {{/if}}
                    {{#if skills.frameworks}}
                    <div class="skill-group">
                        <h3>Frameworks</h3>
                        {{#each skills.frameworks}}<span class="skill-bubble">{{this}}</span>{{/each}}
                    </div>
                    {{/if}}
                </div>
            </div>
        </section>
        {{/if}}

        <section id="contact" class="contact">
            <div class="container">
                <h2 class="section-title gradient-text">Let''s Create Together</h2>
                <div class="contact-creative">
                    {{#if personal.email}}<a href="mailto:{{personal.email}}" class="contact-item">{{personal.email}}</a>{{/if}}
                    {{#if personal.linkedin}}<a href="https://{{personal.linkedin}}" class="contact-item">LinkedIn</a>{{/if}}
                    {{#if personal.github}}<a href="https://{{personal.github}}" class="contact-item">GitHub</a>{{/if}}
                </div>
            </div>
        </section>
    </main>
</body>
</html>',
    ':root {
        --primary: #ff6b6b;
        --secondary: #4ecdc4;
        --accent: #45b7d1;
        --text: #2c3e50;
        --text-light: #7f8c8d;
        --bg: #ffffff;
        --surface: #f8f9fa;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body { font-family: "Inter", sans-serif; color: var(--text); overflow-x: hidden; }

    .creative-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #ff6b6b11, #4ecdc411, #45b7d111); z-index: -1; }

    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

    .header { position: fixed; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); z-index: 1000; padding: 1rem 0; }
    .header .container { display: flex; justify-content: space-between; align-items: center; }
    .logo { background: linear-gradient(45deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 1.5rem; font-weight: 700; }
    .nav { display: flex; gap: 2rem; }
    .nav a { text-decoration: none; color: var(--text); font-weight: 500; transition: color 0.3s; }
    .nav a:hover { color: var(--primary); }

    .hero { padding: 8rem 0 4rem; min-height: 100vh; display: flex; align-items: center; }
    .hero-title { font-size: 4rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(45deg, var(--primary), var(--secondary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-subtitle { font-size: 1.5rem; color: var(--text-light); margin-bottom: 2rem; }
    .hero-buttons { display: flex; gap: 1rem; }

    .btn { display: inline-block; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s; }
    .btn-gradient { background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; }
    .btn-outline { border: 2px solid var(--primary); color: var(--primary); }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

    .section-title { text-align: center; font-size: 3rem; font-weight: 700; margin-bottom: 3rem; }
    .gradient-text { background: linear-gradient(45deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .projects { padding: 6rem 0; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
    .project-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
    .project-card:hover { transform: translateY(-5px); }
    .project-header h3 { color: var(--primary); margin-bottom: 1rem; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .project-tech span { background: linear-gradient(45deg, var(--secondary), var(--accent)); color: white; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; }

    .skills { padding: 6rem 0; background: var(--surface); }
    .skills-creative { display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; }
    .skill-group h3 { margin-bottom: 1rem; color: var(--primary); }
    .skill-bubble { display: inline-block; background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; padding: 0.5rem 1rem; margin: 0.25rem; border-radius: 25px; font-weight: 500; }

    .contact { padding: 6rem 0; }
    .contact-creative { display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; }
    .contact-item { display: inline-block; padding: 1rem 2rem; background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; transition: transform 0.3s; }
    .contact-item:hover { transform: scale(1.05); }',
    'creative',
    true,
    true
),

(
    uuid_generate_v4(),
    'Minimal',
    'Simple and elegant design focusing on content',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{personal.name}}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>{{personal.name}}</h1>
            {{#if personal.summary}}<p class="subtitle">{{personal.summary}}</p>{{/if}}
        </header>

        <nav class="nav">
            <a href="#about">About</a>
            {{#if hasExperience}}<a href="#experience">Experience</a>{{/if}}
            {{#if hasEducation}}<a href="#education">Education</a>{{/if}}
            {{#if hasProjects}}<a href="#projects">Projects</a>{{/if}}
            <a href="#contact">Contact</a>
        </nav>

        <main>
            <section id="about" class="section">
                {{#if personal.location}}<p><strong>Location:</strong> {{personal.location}}</p>{{/if}}
                {{#if personal.email}}<p><strong>Email:</strong> <a href="mailto:{{personal.email}}">{{personal.email}}</a></p>{{/if}}
                {{#if personal.phone}}<p><strong>Phone:</strong> <a href="tel:{{personal.phone}}">{{personal.phone}}</a></p>{{/if}}
            </section>

            {{#if hasExperience}}
            <section id="experience" class="section">
                <h2>Experience</h2>
                {{#each experience}}
                <div class="item">
                    <h3>{{position}} at {{company}}</h3>
                    <p class="meta">{{startDate}} — {{endDate}}{{#if location}} • {{location}}{{/if}}</p>
                    {{#if description}}<p>{{description}}</p>{{/if}}
                </div>
                {{/each}}
            </section>
            {{/if}}

            {{#if hasEducation}}
            <section id="education" class="section">
                <h2>Education</h2>
                {{#each education}}
                <div class="item">
                    <h3>{{degree}}{{#if field}} in {{field}}{{/if}}</h3>
                    <p class="meta">{{institution}} • {{startYear}}—{{endYear}}{{#if grade}} • {{grade}}{{/if}}</p>
                </div>
                {{/each}}
            </section>
            {{/if}}

            {{#if hasSkills}}
            <section id="skills" class="section">
                <h2>Skills</h2>
                {{#if skills.programming}}<p><strong>Programming:</strong> {{#each skills.programming}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</p>{{/if}}
                {{#if skills.frameworks}}<p><strong>Frameworks:</strong> {{#each skills.frameworks}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</p>{{/if}}
                {{#if skills.tools}}<p><strong>Tools:</strong> {{#each skills.tools}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</p>{{/if}}
            </section>
            {{/if}}

            {{#if hasProjects}}
            <section id="projects" class="section">
                <h2>Projects</h2>
                {{#each projects}}
                <div class="item">
                    <h3>{{name}}</h3>
                    {{#if description}}<p>{{description}}</p>{{/if}}
                    {{#if technologies}}<p class="meta">{{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</p>{{/if}}
                    {{#if url}}<p><a href="{{url}}" target="_blank">View Project</a></p>{{/if}}
                </div>
                {{/each}}
            </section>
            {{/if}}

            <section id="contact" class="section">
                <h2>Contact</h2>
                {{#if personal.email}}<p><a href="mailto:{{personal.email}}">{{personal.email}}</a></p>{{/if}}
                {{#if personal.linkedin}}<p><a href="https://{{personal.linkedin}}">LinkedIn</a></p>{{/if}}
                {{#if personal.github}}<p><a href="https://{{personal.github}}">GitHub</a></p>{{/if}}
            </section>
        </main>
    </div>
</body>
</html>',
    'body { font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }

    .header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
    .header h1 { font-size: 2.5rem; font-weight: normal; margin-bottom: 0.5rem; }
    .subtitle { font-size: 1.1rem; color: #666; font-style: italic; }

    .nav { text-align: center; margin-bottom: 3rem; }
    .nav a { color: #333; text-decoration: none; margin: 0 1rem; padding: 0.5rem; border-bottom: 2px solid transparent; transition: border-color 0.3s; }
    .nav a:hover { border-bottom-color: #333; }

    .section { margin-bottom: 3rem; }
    .section h2 { font-size: 1.5rem; font-weight: normal; margin-bottom: 1.5rem; color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }

    .item { margin-bottom: 2rem; }
    .item h3 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 0.5rem; }

    a { color: #333; }
    a:hover { text-decoration: none; }

    @media (max-width: 600px) { body { padding: 1rem; } .nav a { display: block; margin: 0.5rem 0; } }',
    'minimal',
    true,
    false
);

-- Update usage count for sample data
UPDATE templates SET usage_count = FLOOR(RANDOM() * 100) + 10 WHERE is_public = true;