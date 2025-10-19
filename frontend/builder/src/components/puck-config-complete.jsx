import React from 'react';
import { cvComponents } from './puck-cv-components';
import { layoutComponents } from './puck-layout-components';
import ColorPicker from './ColorPicker';
import ImageUpload from './ImageUpload';

// Custom field renderers
const ColorField = ({ value, onChange, label }) => {
  return <ColorPicker value={value || '#000000'} onChange={onChange} label={label} />;
};

const ImageField = ({ value, onChange, label }) => {
  return <ImageUpload value={value || ''} onChange={onChange} label={label} />;
};

// ========== ADDITIONAL PORTFOLIO COMPONENTS ==========

const portfolioComponents = {
  // Timeline Component
  Timeline: {
    label: 'Timeline',
    fields: {
      heading: { type: 'text', label: 'Section Heading' },
      items: { type: 'textarea', label: 'Timeline Items (format: Year|Title|Description, one per line)' },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      lineWidth: { type: 'number', label: 'Line Width (px)', min: 2, max: 10 },
    },
    defaultProps: {
      heading: 'My Journey',
      items: '2024|Current Position|Working as a Senior Developer\n2023|Promotion|Promoted to Team Lead\n2022|New Role|Joined TechCorp as Developer\n2021|Graduation|Completed Bachelor\'s Degree',
      accentColor: '#667eea',
      bgColor: '#f8f9fa',
      textColor: '#333333',
      lineWidth: 4,
    },
    render: (props) => {
      const timelineItems = props.items
        .split('\n')
        .map(line => {
          const parts = line.split('|').map(s => s.trim());
          if (parts.length >= 3) {
            return { year: parts[0], title: parts[1], description: parts[2] };
          }
          return null;
        })
        .filter(Boolean);

      return (
        <div
          style={{
            backgroundColor: props.bgColor,
            padding: '60px 20px',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {props.heading && (
              <h2
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: props.textColor,
                  textAlign: 'center',
                  marginBottom: '60px',
                }}
              >
                {props.heading}
              </h2>
            )}

            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: `${props.lineWidth}px`,
                  backgroundColor: props.accentColor,
                  transform: 'translateX(-50%)',
                }}
              />

              {timelineItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: idx % 2 === 0 ? 'flex-start' : 'flex-end',
                    marginBottom: '60px',
                  }}
                >
                  <div
                    style={{
                      width: '45%',
                      textAlign: idx % 2 === 0 ? 'right' : 'left',
                      paddingRight: idx % 2 === 0 ? '40px' : '0',
                      paddingLeft: idx % 2 === 0 ? '0' : '40px',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: `2px solid ${props.accentColor}20`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: props.accentColor,
                          marginBottom: '8px',
                        }}
                      >
                        {item.year}
                      </div>
                      <h4
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: props.textColor,
                          marginBottom: '8px',
                          margin: '0 0 8px 0',
                        }}
                      >
                        {item.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '14px',
                          color: props.textColor + 'cc',
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Dot on line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '20px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: props.accentColor,
                      border: '4px solid #ffffff',
                      transform: 'translateX(-50%)',
                      zIndex: 2,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },

  // Testimonial/Quote
  Testimonial: {
    label: 'Testimonial',
    fields: {
      quote: { type: 'textarea', label: 'Quote' },
      author: { type: 'text', label: 'Author Name' },
      role: { type: 'text', label: 'Author Role/Title' },
      authorImage: { type: 'custom', label: 'Author Image', render: ImageField },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
    },
    defaultProps: {
      quote: 'Working with this developer was an absolute pleasure. Their attention to detail and problem-solving skills are exceptional.',
      author: 'Jane Doe',
      role: 'CEO, TechCorp',
      authorImage: '',
      bgColor: '#f8f9fa',
      textColor: '#333333',
      accentColor: '#667eea',
    },
    render: (props) => (
      <div
        style={{
          backgroundColor: props.bgColor,
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              color: props.accentColor,
              marginBottom: '20px',
              lineHeight: 1,
            }}
          >
            "
          </div>
          <p
            style={{
              fontSize: '20px',
              fontStyle: 'italic',
              color: props.textColor,
              lineHeight: 1.6,
              marginBottom: '30px',
            }}
          >
            {props.quote}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            {props.authorImage && (
              <img
                src={props.authorImage}
                alt={props.author}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            )}
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: props.textColor,
                }}
              >
                {props.author}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: props.textColor + '99',
                }}
              >
                {props.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // Stats/Metrics
  StatsSection: {
    label: 'Stats Section',
    fields: {
      heading: { type: 'text', label: 'Heading' },
      stats: { type: 'textarea', label: 'Stats (format: Number|Label, one per line)' },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      columns: { type: 'number', label: 'Columns', min: 2, max: 5 },
    },
    defaultProps: {
      heading: 'By the Numbers',
      stats: '50+|Projects Completed\n100%|Client Satisfaction\n5+|Years Experience\n20+|Technologies Mastered',
      bgColor: '#667eea',
      textColor: '#ffffff',
      accentColor: '#ffffff',
      columns: 4,
    },
    render: (props) => {
      const statsList = props.stats
        .split('\n')
        .map(line => {
          const [number, label] = line.split('|').map(s => s.trim());
          return number && label ? { number, label } : null;
        })
        .filter(Boolean);

      return (
        <div
          style={{
            backgroundColor: props.bgColor,
            color: props.textColor,
            padding: '60px 20px',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {props.heading && (
              <h2
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '50px',
                }}
              >
                {props.heading}
              </h2>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
                gap: '40px',
                textAlign: 'center',
              }}
            >
              {statsList.map((stat, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: props.accentColor,
                      marginBottom: '10px',
                    }}
                  >
                    {stat.number}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      color: props.textColor + 'dd',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },

  // CTA Section
  CTASection: {
    label: 'Call-to-Action',
    fields: {
      heading: { type: 'text', label: 'Heading' },
      description: { type: 'textarea', label: 'Description' },
      buttonText: { type: 'text', label: 'Button Text' },
      buttonLink: { type: 'text', label: 'Button Link' },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      buttonBgColor: { type: 'custom', label: 'Button Background', render: ColorField },
      buttonTextColor: { type: 'custom', label: 'Button Text Color', render: ColorField },
    },
    defaultProps: {
      heading: "Let's Work Together",
      description: 'Have a project in mind? Get in touch and let\'s create something amazing.',
      buttonText: 'Contact Me',
      buttonLink: '#contact',
      bgColor: '#667eea',
      bgImage: '',
      textColor: '#ffffff',
      buttonBgColor: '#ffffff',
      buttonTextColor: '#667eea',
    },
    render: (props) => (
      <div
        style={{
          backgroundColor: props.bgColor,
          backgroundImage: props.bgImage ? `url(${props.bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: props.textColor,
          padding: '80px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '42px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            {props.heading}
          </h2>
          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              marginBottom: '40px',
              opacity: 0.95,
            }}
          >
            {props.description}
          </p>
          <a
            href={props.buttonLink}
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: props.buttonBgColor,
              color: props.buttonTextColor,
              fontSize: '18px',
              fontWeight: 'bold',
              textDecoration: 'none',
              borderRadius: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
          >
            {props.buttonText}
          </a>
        </div>
      </div>
    ),
  },
};

// ========== COMBINED CONFIGURATION ==========

export const config = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['Section', 'Grid', 'FlexContainer', 'TwoColumn', 'Card', 'HeroSection', 'Navbar', 'Footer'],
    },
    cv: {
      title: 'CV Components',
      components: ['EducationCard', 'ExperienceCard', 'ProjectCard', 'SkillBadge', 'SkillsGrid', 'ContactInfo'],
    },
    portfolio: {
      title: 'Portfolio',
      components: ['Timeline', 'Testimonial', 'StatsSection', 'CTASection'],
    },
    basic: {
      title: 'Basic Elements',
      components: ['Heading', 'Paragraph', 'Button', 'Image', 'Box', 'Spacer', 'Divider'],
    },
  },
  components: {
    // Layout components
    ...layoutComponents,

    // CV components
    ...cvComponents,

    // Portfolio components
    ...portfolioComponents,

    // Basic elements from atomic config
    Heading: {
      label: 'Heading',
      fields: {
        text: { type: 'textarea', label: 'Text' },
        level: {
          type: 'select',
          label: 'Level',
          options: [
            { label: 'H1', value: 'h1' },
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
            { label: 'H4', value: 'h4' },
          ],
        },
        size: { type: 'number', label: 'Size (px)', min: 16, max: 120 },
        color: { type: 'custom', label: 'Color', render: ColorField },
        weight: {
          type: 'select',
          label: 'Weight',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Bold', value: 'bold' },
            { label: 'Light', value: '300' },
          ],
        },
        align: {
          type: 'select',
          label: 'Align',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        marginBottom: { type: 'number', label: 'Margin Bottom (px)', min: 0, max: 100 },
      },
      defaultProps: {
        text: 'Your Heading Here',
        level: 'h2',
        size: 48,
        color: '#000000',
        weight: 'bold',
        align: 'left',
        marginBottom: 20,
      },
      render: ({ text, level, size, color, weight, align, marginBottom }) => {
        const Tag = level;
        return (
          <Tag
            style={{
              fontSize: `${size}px`,
              color,
              fontWeight: weight,
              textAlign: align,
              marginBottom: `${marginBottom}px`,
              lineHeight: 1.2,
              margin: `0 0 ${marginBottom}px 0`,
            }}
          >
            {text}
          </Tag>
        );
      },
    },

    Paragraph: {
      label: 'Paragraph',
      fields: {
        text: { type: 'textarea', label: 'Text' },
        size: { type: 'number', label: 'Size (px)', min: 12, max: 32 },
        color: { type: 'custom', label: 'Color', render: ColorField },
        align: {
          type: 'select',
          label: 'Align',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
            { label: 'Justify', value: 'justify' },
          ],
        },
        lineHeight: { type: 'number', label: 'Line Height', min: 1, max: 3, step: 0.1 },
        marginBottom: { type: 'number', label: 'Margin Bottom (px)', min: 0, max: 100 },
      },
      defaultProps: {
        text: 'Your paragraph text goes here...',
        size: 16,
        color: '#333333',
        align: 'left',
        lineHeight: 1.6,
        marginBottom: 20,
      },
      render: ({ text, size, color, align, lineHeight, marginBottom }) => (
        <p
          style={{
            fontSize: `${size}px`,
            color,
            textAlign: align,
            lineHeight,
            marginBottom: `${marginBottom}px`,
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </p>
      ),
    },

    Button: {
      label: 'Button',
      fields: {
        text: { type: 'text', label: 'Text' },
        link: { type: 'text', label: 'Link URL' },
        bgColor: { type: 'custom', label: 'Background', render: ColorField },
        textColor: { type: 'custom', label: 'Text Color', render: ColorField },
        size: { type: 'number', label: 'Font Size (px)', min: 12, max: 24 },
        paddingX: { type: 'number', label: 'Padding Left/Right (px)', min: 10, max: 60 },
        paddingY: { type: 'number', label: 'Padding Top/Bottom (px)', min: 8, max: 30 },
        borderRadius: { type: 'number', label: 'Roundness (px)', min: 0, max: 50 },
        align: {
          type: 'select',
          label: 'Align',
          options: [
            { label: 'Left', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'flex-end' },
          ],
        },
      },
      defaultProps: {
        text: 'Click Me',
        link: '#',
        bgColor: '#667eea',
        textColor: '#ffffff',
        size: 16,
        paddingX: 30,
        paddingY: 12,
        borderRadius: 8,
        align: 'center',
      },
      render: ({ text, link, bgColor, textColor, size, paddingX, paddingY, borderRadius, align }) => (
        <div style={{ display: 'flex', justifyContent: align, margin: '20px 0' }}>
          <a
            href={link}
            style={{
              display: 'inline-block',
              padding: `${paddingY}px ${paddingX}px`,
              backgroundColor: bgColor,
              color: textColor,
              fontSize: `${size}px`,
              borderRadius: `${borderRadius}px`,
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {text}
          </a>
        </div>
      ),
    },

    Image: {
      label: 'Image',
      fields: {
        src: { type: 'custom', label: 'Image', render: ImageField },
        alt: { type: 'text', label: 'Alt Text' },
        width: { type: 'number', label: 'Width (%)', min: 10, max: 100 },
        height: { type: 'number', label: 'Height (px)', min: 50, max: 800 },
        objectFit: {
          type: 'select',
          label: 'Fit',
          options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
            { label: 'Fill', value: 'fill' },
          ],
        },
        borderRadius: { type: 'number', label: 'Roundness (px)', min: 0, max: 50 },
        align: {
          type: 'select',
          label: 'Align',
          options: [
            { label: 'Left', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'flex-end' },
          ],
        },
      },
      defaultProps: {
        src: 'https://images.unsplash.com/photo-1557683316-973673baf926',
        alt: 'Image',
        width: 100,
        height: 400,
        objectFit: 'cover',
        borderRadius: 0,
        align: 'center',
      },
      render: ({ src, alt, width, height, objectFit, borderRadius, align }) => (
        <div style={{ display: 'flex', justifyContent: align, margin: '20px 0' }}>
          <img
            src={src}
            alt={alt}
            style={{
              width: `${width}%`,
              height: `${height}px`,
              objectFit,
              borderRadius: `${borderRadius}px`,
              display: 'block',
            }}
          />
        </div>
      ),
    },

    Box: {
      label: 'Box',
      fields: {
        bgColor: { type: 'custom', label: 'Background', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
        padding: { type: 'number', label: 'Padding (px)', min: 0, max: 80 },
        borderRadius: { type: 'number', label: 'Roundness (px)', min: 0, max: 50 },
        minHeight: { type: 'number', label: 'Min Height (px)', min: 0, max: 800 },
      },
      defaultProps: {
        bgColor: '#f5f5f5',
        bgImage: '',
        padding: 20,
        borderRadius: 0,
        minHeight: 0,
      },
      render: ({ bgColor, bgImage, padding, borderRadius, minHeight }, { children }) => (
        <div
          style={{
            backgroundColor: bgColor,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: `${padding}px`,
            borderRadius: `${borderRadius}px`,
            minHeight: minHeight > 0 ? `${minHeight}px` : 'auto',
          }}
        >
          {children}
        </div>
      ),
    },

    Spacer: {
      label: 'Spacer',
      fields: {
        height: { type: 'number', label: 'Height (px)', min: 10, max: 200 },
      },
      defaultProps: {
        height: 40,
      },
      render: ({ height }) => <div style={{ height: `${height}px` }} />,
    },

    Divider: {
      label: 'Divider',
      fields: {
        color: { type: 'custom', label: 'Color', render: ColorField },
        thickness: { type: 'number', label: 'Thickness (px)', min: 1, max: 10 },
        width: { type: 'number', label: 'Width (%)', min: 10, max: 100 },
        marginTop: { type: 'number', label: 'Margin Top (px)', min: 0, max: 100 },
        marginBottom: { type: 'number', label: 'Margin Bottom (px)', min: 0, max: 100 },
      },
      defaultProps: {
        color: '#e0e0e0',
        thickness: 1,
        width: 100,
        marginTop: 20,
        marginBottom: 20,
      },
      render: ({ color, thickness, width, marginTop, marginBottom }) => (
        <div
          style={{
            margin: `${marginTop}px auto ${marginBottom}px auto`,
            width: `${width}%`,
            height: `${thickness}px`,
            backgroundColor: color,
          }}
        />
      ),
    },
  },
};

export default config;
