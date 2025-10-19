import React from 'react';
import ColorPicker from './ColorPicker';
import ImageUpload from './ImageUpload';

// Custom field renderers
const ColorField = ({ value, onChange, label }) => {
  return <ColorPicker value={value || '#000000'} onChange={onChange} label={label} />;
};

const ImageField = ({ value, onChange, label }) => {
  return <ImageUpload value={value || ''} onChange={onChange} label={label} />;
};

// ========== CV-SPECIFIC COMPONENTS ==========
export const cvComponents = {

  // Education Card
  EducationCard: {
    label: 'Education Card',
    fields: {
      institution: { type: 'text', label: 'Institution Name' },
      degree: { type: 'text', label: 'Degree' },
      field: { type: 'text', label: 'Field of Study' },
      startYear: { type: 'text', label: 'Start Year' },
      endYear: { type: 'text', label: 'End Year' },
      grade: { type: 'text', label: 'GPA/Grade' },
      description: { type: 'textarea', label: 'Description' },
      logo: { type: 'custom', label: 'Institution Logo', render: ImageField },

      // Styling
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      borderRadius: { type: 'number', label: 'Border Radius (px)', min: 0, max: 30 },
      padding: { type: 'number', label: 'Padding (px)', min: 10, max: 60 },
      showBorder: { type: 'radio', label: 'Show Border', options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ]},
    },
    defaultProps: {
      institution: 'University Name',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startYear: '2020',
      endYear: '2024',
      grade: '3.8 GPA',
      description: 'Relevant coursework and achievements',
      logo: '',
      bgColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#667eea',
      borderRadius: 12,
      padding: 24,
      showBorder: true,
    },
    render: (props) => (
      <div
        style={{
          backgroundColor: props.bgColor,
          color: props.textColor,
          borderRadius: `${props.borderRadius}px`,
          padding: `${props.padding}px`,
          border: props.showBorder ? `2px solid ${props.accentColor}20` : 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          margin: '20px auto',
          maxWidth: '800px',
          display: 'flex',
          gap: '20px',
        }}
      >
        {props.logo && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={props.logo}
              alt={props.institution}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                objectFit: 'contain',
              }}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '22px',
            fontWeight: 'bold',
            color: props.textColor,
          }}>
            {props.institution}
          </h3>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: props.accentColor,
            marginBottom: '4px',
          }}>
            {props.degree} in {props.field}
          </div>
          <div style={{
            fontSize: '14px',
            color: props.textColor + '99',
            marginBottom: '8px',
          }}>
            {props.startYear} - {props.endYear} • {props.grade}
          </div>
          {props.description && (
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0',
              color: props.textColor + 'dd',
            }}>
              {props.description}
            </p>
          )}
        </div>
      </div>
    ),
  },

  // Experience Card
  ExperienceCard: {
    label: 'Experience Card',
    fields: {
      company: { type: 'text', label: 'Company Name' },
      position: { type: 'text', label: 'Position' },
      location: { type: 'text', label: 'Location' },
      startDate: { type: 'text', label: 'Start Date' },
      endDate: { type: 'text', label: 'End Date (or "Present")' },
      description: { type: 'textarea', label: 'Description' },
      technologies: { type: 'text', label: 'Technologies (comma separated)' },
      companyLogo: { type: 'custom', label: 'Company Logo', render: ImageField },

      // Styling
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      borderRadius: { type: 'number', label: 'Border Radius (px)', min: 0, max: 30 },
      padding: { type: 'number', label: 'Padding (px)', min: 10, max: 60 },
    },
    defaultProps: {
      company: 'Company Name',
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Jan 2023',
      endDate: 'Present',
      description: 'Key responsibilities and achievements...',
      technologies: 'React, Node.js, PostgreSQL',
      companyLogo: '',
      bgColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#667eea',
      borderRadius: 12,
      padding: 24,
    },
    render: (props) => {
      const techList = props.technologies.split(',').map(t => t.trim()).filter(t => t);

      return (
        <div
          style={{
            backgroundColor: props.bgColor,
            color: props.textColor,
            borderRadius: `${props.borderRadius}px`,
            padding: `${props.padding}px`,
            borderLeft: `4px solid ${props.accentColor}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            margin: '20px auto',
            maxWidth: '800px',
          }}
        >
          <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
            {props.companyLogo && (
              <img
                src={props.companyLogo}
                alt={props.company}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: '0 0 4px 0',
                fontSize: '20px',
                fontWeight: 'bold',
              }}>
                {props.position}
              </h3>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: props.accentColor,
                marginBottom: '4px',
              }}>
                {props.company}
              </div>
              <div style={{
                fontSize: '14px',
                color: props.textColor + '99',
              }}>
                {props.location} • {props.startDate} - {props.endDate}
              </div>
            </div>
          </div>

          {props.description && (
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 12px 0',
              whiteSpace: 'pre-wrap',
            }}>
              {props.description}
            </p>
          )}

          {techList.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {techList.map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: props.accentColor + '15',
                    color: props.accentColor,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    },
  },

  // Project Card
  ProjectCard: {
    label: 'Project Card',
    fields: {
      title: { type: 'text', label: 'Project Title' },
      description: { type: 'textarea', label: 'Description' },
      technologies: { type: 'text', label: 'Technologies (comma separated)' },
      image: { type: 'custom', label: 'Project Image', render: ImageField },
      githubUrl: { type: 'text', label: 'GitHub URL' },
      liveUrl: { type: 'text', label: 'Live Demo URL' },
      date: { type: 'text', label: 'Date' },

      // Styling
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      borderRadius: { type: 'number', label: 'Border Radius (px)', min: 0, max: 30 },
      imageHeight: { type: 'number', label: 'Image Height (px)', min: 100, max: 400 },
    },
    defaultProps: {
      title: 'Project Name',
      description: 'Brief description of what this project does and the problem it solves.',
      technologies: 'React, Node.js, MongoDB',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      githubUrl: 'https://github.com/username/project',
      liveUrl: 'https://project-demo.com',
      date: '2024',
      bgColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#667eea',
      borderRadius: 12,
      imageHeight: 200,
    },
    render: (props) => {
      const techList = props.technologies.split(',').map(t => t.trim()).filter(t => t);

      return (
        <div
          style={{
            backgroundColor: props.bgColor,
            borderRadius: `${props.borderRadius}px`,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            margin: '20px',
            maxWidth: '400px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          {props.image && (
            <img
              src={props.image}
              alt={props.title}
              style={{
                width: '100%',
                height: `${props.imageHeight}px`,
                objectFit: 'cover',
              }}
            />
          )}

          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 'bold',
                color: props.textColor,
              }}>
                {props.title}
              </h3>
              {props.date && (
                <span style={{
                  fontSize: '14px',
                  color: props.textColor + '99',
                  whiteSpace: 'nowrap',
                }}>
                  {props.date}
                </span>
              )}
            </div>

            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: props.textColor + 'dd',
              marginBottom: '16px',
            }}>
              {props.description}
            </p>

            {techList.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '16px',
              }}>
                {techList.map((tech, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '3px 10px',
                      backgroundColor: props.accentColor + '15',
                      color: props.accentColor,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {props.githubUrl && (
                <a
                  href={props.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: props.textColor,
                    color: props.bgColor,
                    borderRadius: '6px',
                    fontSize: '14px',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  GitHub
                </a>
              )}
              {props.liveUrl && (
                <a
                  href={props.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: props.accentColor,
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      );
    },
  },

  // Skill Badge
  SkillBadge: {
    label: 'Skill Badge',
    fields: {
      skill: { type: 'text', label: 'Skill Name' },
      level: {
        type: 'select',
        label: 'Proficiency Level',
        options: [
          { label: 'Beginner', value: 'beginner' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Advanced', value: 'advanced' },
          { label: 'Expert', value: 'expert' },
        ],
      },
      icon: { type: 'text', label: 'Icon (emoji or URL)' },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      showLevel: { type: 'radio', label: 'Show Level', options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ]},
    },
    defaultProps: {
      skill: 'JavaScript',
      level: 'advanced',
      icon: '⚡',
      bgColor: '#667eea',
      textColor: '#ffffff',
      showLevel: true,
    },
    render: (props) => {
      const levelColors = {
        beginner: '#94a3b8',
        intermediate: '#60a5fa',
        advanced: '#8b5cf6',
        expert: '#ec4899',
      };

      return (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: props.bgColor,
            color: props.textColor,
            borderRadius: '24px',
            margin: '6px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          {props.icon && (
            <span style={{ fontSize: '18px' }}>
              {props.icon.startsWith('http') ? (
                <img src={props.icon} alt="" style={{ width: '20px', height: '20px' }} />
              ) : (
                props.icon
              )}
            </span>
          )}
          <span>{props.skill}</span>
          {props.showLevel && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: levelColors[props.level] || props.textColor,
              }}
            />
          )}
        </div>
      );
    },
  },

  // Skills Grid
  SkillsGrid: {
    label: 'Skills Grid',
    fields: {
      heading: { type: 'text', label: 'Section Heading' },
      skills: { type: 'textarea', label: 'Skills (one per line or comma separated)' },
      columns: { type: 'number', label: 'Columns', min: 2, max: 6 },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      skillBgColor: { type: 'custom', label: 'Skill Badge Color', render: ColorField },
      skillTextColor: { type: 'custom', label: 'Skill Text Color', render: ColorField },
      headingColor: { type: 'custom', label: 'Heading Color', render: ColorField },
    },
    defaultProps: {
      heading: 'Skills & Technologies',
      skills: 'JavaScript, React, Node.js, Python, PostgreSQL, Docker, Git, AWS, TypeScript, GraphQL',
      columns: 3,
      bgColor: '#f8f9fa',
      skillBgColor: '#667eea',
      skillTextColor: '#ffffff',
      headingColor: '#1a1a1a',
    },
    render: (props) => {
      const skillList = props.skills
        .split(/[\n,]/)
        .map(s => s.trim())
        .filter(s => s);

      return (
        <div
          style={{
            backgroundColor: props.bgColor,
            padding: '60px 20px',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: props.headingColor,
                textAlign: 'center',
                marginBottom: '40px',
              }}
            >
              {props.heading}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
                gap: '12px',
                justifyItems: 'center',
              }}
            >
              {skillList.map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: props.skillBgColor,
                    color: props.skillTextColor,
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '120px',
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },

  // Contact Info
  ContactInfo: {
    label: 'Contact Info',
    fields: {
      heading: { type: 'text', label: 'Heading' },
      email: { type: 'text', label: 'Email' },
      phone: { type: 'text', label: 'Phone' },
      linkedin: { type: 'text', label: 'LinkedIn URL' },
      github: { type: 'text', label: 'GitHub URL' },
      website: { type: 'text', label: 'Website URL' },
      layout: {
        type: 'select',
        label: 'Layout',
        options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Grid', value: 'grid' },
        ],
      },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
    },
    defaultProps: {
      heading: 'Get In Touch',
      email: 'hello@example.com',
      phone: '+1 (555) 123-4567',
      linkedin: 'linkedin.com/in/yourprofile',
      github: 'github.com/yourusername',
      website: 'yourwebsite.com',
      layout: 'vertical',
      bgColor: '#667eea',
      textColor: '#ffffff',
      accentColor: '#ffffff',
    },
    render: (props) => {
      const contacts = [
        { icon: '📧', label: 'Email', value: props.email, href: `mailto:${props.email}` },
        { icon: '📱', label: 'Phone', value: props.phone, href: `tel:${props.phone.replace(/\D/g, '')}` },
        { icon: '💼', label: 'LinkedIn', value: props.linkedin, href: `https://${props.linkedin}` },
        { icon: '💻', label: 'GitHub', value: props.github, href: `https://${props.github}` },
        { icon: '🌐', label: 'Website', value: props.website, href: `https://${props.website}` },
      ].filter(c => c.value);

      return (
        <div
          style={{
            backgroundColor: props.bgColor,
            color: props.textColor,
            padding: '60px 20px',
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '40px',
              }}
            >
              {props.heading}
            </h2>
            <div
              style={{
                display: props.layout === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: props.layout === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : undefined,
                flexDirection: props.layout === 'vertical' ? 'column' : 'row',
                flexWrap: props.layout === 'horizontal' ? 'wrap' : undefined,
                gap: '20px',
                justifyContent: 'center',
                alignItems: props.layout === 'vertical' ? 'center' : 'flex-start',
              }}
            >
              {contacts.map((contact, idx) => (
                <a
                  key={idx}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 24px',
                    backgroundColor: props.accentColor + '20',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: props.textColor,
                    fontSize: '16px',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = props.accentColor + '30';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = props.accentColor + '20';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{contact.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>{contact.label}</div>
                    <div style={{ fontWeight: '600' }}>{contact.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },
};
