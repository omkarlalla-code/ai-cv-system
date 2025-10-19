import React from 'react';

// Define reusable component configurations for Puck
export const config = {
  components: {
    // Hero Section
    Hero: {
      fields: {
        title: { type: 'text' },
        subtitle: { type: 'textarea' },
        backgroundImage: { type: 'text' },
        buttonText: { type: 'text' },
        buttonLink: { type: 'text' },
      },
      defaultProps: {
        title: 'Welcome to My Portfolio',
        subtitle: 'Building amazing things',
        backgroundImage: '',
        buttonText: 'View My Work',
        buttonLink: '#projects',
      },
      render: ({ title, subtitle, backgroundImage, buttonText, buttonLink }) => (
        <section
          style={{
            padding: '100px 20px',
            textAlign: 'center',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            color: 'white',
          }}
        >
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>{title}</h1>
          <p style={{ fontSize: '20px', marginBottom: '30px' }}>{subtitle}</p>
          <a
            href={buttonLink}
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              backgroundColor: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
            }}
          >
            {buttonText}
          </a>
        </section>
      ),
    },

    // About Section
    About: {
      fields: {
        heading: { type: 'text' },
        content: { type: 'textarea' },
        imageUrl: { type: 'text' },
      },
      defaultProps: {
        heading: 'About Me',
        content: 'I am a passionate developer with experience in building web applications.',
        imageUrl: '',
      },
      render: ({ heading, content, imageUrl }) => (
        <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="About"
                style={{ width: '300px', borderRadius: '10px', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>{heading}</h2>
              <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#666' }}>{content}</p>
            </div>
          </div>
        </section>
      ),
    },

    // Skills Section
    Skills: {
      fields: {
        heading: { type: 'text' },
        skills: { type: 'textarea' },
      },
      defaultProps: {
        heading: 'Skills',
        skills: 'JavaScript, React, Node.js, Python, SQL',
      },
      render: ({ heading, skills }) => {
        const skillList = skills.split(',').map((s) => s.trim());
        return (
          <section style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '36px', marginBottom: '30px', textAlign: 'center' }}>
                {heading}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                {skillList.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '16px',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        );
      },
    },

    // Projects Section
    Projects: {
      fields: {
        heading: { type: 'text' },
        project1Title: { type: 'text' },
        project1Description: { type: 'textarea' },
        project1Image: { type: 'text' },
        project2Title: { type: 'text' },
        project2Description: { type: 'textarea' },
        project2Image: { type: 'text' },
      },
      defaultProps: {
        heading: 'My Projects',
        project1Title: 'Project One',
        project1Description: 'Description of project one',
        project1Image: '',
        project2Title: 'Project Two',
        project2Description: 'Description of project two',
        project2Image: '',
      },
      render: ({
        heading,
        project1Title,
        project1Description,
        project1Image,
        project2Title,
        project2Description,
        project2Image,
      }) => (
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
              {heading}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden' }}>
                {project1Image && (
                  <img src={project1Image} alt={project1Title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{project1Title}</h3>
                  <p style={{ color: '#666', lineHeight: '1.6' }}>{project1Description}</p>
                </div>
              </div>
              <div style={{ border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden' }}>
                {project2Image && (
                  <img src={project2Image} alt={project2Title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{project2Title}</h3>
                  <p style={{ color: '#666', lineHeight: '1.6' }}>{project2Description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ),
    },

    // Contact Section
    Contact: {
      fields: {
        heading: { type: 'text' },
        email: { type: 'text' },
        phone: { type: 'text' },
        linkedin: { type: 'text' },
        github: { type: 'text' },
      },
      defaultProps: {
        heading: 'Get In Touch',
        email: 'email@example.com',
        phone: '+1234567890',
        linkedin: 'linkedin.com/in/yourprofile',
        github: 'github.com/yourusername',
      },
      render: ({ heading, email, phone, linkedin, github }) => (
        <section style={{ padding: '60px 20px', backgroundColor: '#667eea', color: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '30px' }}>{heading}</h2>
            <div style={{ fontSize: '18px', lineHeight: '2' }}>
              {email && <p>Email: {email}</p>}
              {phone && <p>Phone: {phone}</p>}
              {linkedin && <p>LinkedIn: {linkedin}</p>}
              {github && <p>GitHub: {github}</p>}
            </div>
          </div>
        </section>
      ),
    },

    // Text Block
    TextBlock: {
      fields: {
        content: { type: 'textarea' },
        fontSize: { type: 'text' },
        textAlign: {
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        color: { type: 'text' },
      },
      defaultProps: {
        content: 'Add your text here',
        fontSize: '16px',
        textAlign: 'left',
        color: '#000000',
      },
      render: ({ content, fontSize, textAlign, color }) => (
        <div style={{ padding: '20px', fontSize, textAlign, color }}>
          <p>{content}</p>
        </div>
      ),
    },

    // Spacer
    Spacer: {
      fields: {
        height: { type: 'text' },
      },
      defaultProps: {
        height: '40px',
      },
      render: ({ height }) => <div style={{ height }} />,
    },
  },
};
