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

// ========== ADVANCED LAYOUT COMPONENTS ==========
export const layoutComponents = {

  // Section Container
  Section: {
    label: 'Section',
    fields: {
      sectionId: { type: 'text', label: 'Section ID (for navigation)' },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
      bgOverlay: { type: 'custom', label: 'Overlay Color', render: ColorField },
      overlayOpacity: { type: 'number', label: 'Overlay Opacity', min: 0, max: 100 },
      paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
      paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
      maxWidth: {
        type: 'select',
        label: 'Max Width',
        options: [
          { label: 'Full Width', value: 'none' },
          { label: 'Container (1200px)', value: '1200px' },
          { label: 'Narrow (900px)', value: '900px' },
          { label: 'Wide (1400px)', value: '1400px' },
        ],
      },
      minHeight: { type: 'number', label: 'Min Height (px)', min: 0, max: 1000 },
    },
    defaultProps: {
      sectionId: '',
      bgColor: '#ffffff',
      bgImage: '',
      bgOverlay: '#000000',
      overlayOpacity: 0,
      paddingTop: 80,
      paddingBottom: 80,
      maxWidth: '1200px',
      minHeight: 0,
    },
    render: (props, { children }) => (
      <section
        id={props.sectionId || undefined}
        style={{
          position: 'relative',
          backgroundColor: props.bgColor,
          backgroundImage: props.bgImage ? `url(${props.bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: `${props.paddingTop}px 20px ${props.paddingBottom}px 20px`,
          minHeight: props.minHeight > 0 ? `${props.minHeight}px` : 'auto',
        }}
      >
        {props.bgImage && props.overlayOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: props.bgOverlay,
              opacity: props.overlayOpacity / 100,
              pointerEvents: 'none',
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            maxWidth: props.maxWidth === 'none' ? '100%' : props.maxWidth,
            margin: '0 auto',
          }}
        >
          {children}
        </div>
      </section>
    ),
  },

  // Grid Layout
  Grid: {
    label: 'Grid Layout',
    fields: {
      columns: { type: 'number', label: 'Columns', min: 1, max: 6 },
      gap: { type: 'number', label: 'Gap (px)', min: 0, max: 60 },
      alignItems: {
        type: 'select',
        label: 'Align Items',
        options: [
          { label: 'Start', value: 'start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'end' },
          { label: 'Stretch', value: 'stretch' },
        ],
      },
      justifyItems: {
        type: 'select',
        label: 'Justify Items',
        options: [
          { label: 'Start', value: 'start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'end' },
          { label: 'Stretch', value: 'stretch' },
        ],
      },
      padding: { type: 'number', label: 'Padding (px)', min: 0, max: 60 },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
    },
    defaultProps: {
      columns: 3,
      gap: 20,
      alignItems: 'stretch',
      justifyItems: 'stretch',
      padding: 0,
      bgColor: 'transparent',
    },
    render: (props, { children }) => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
          gap: `${props.gap}px`,
          alignItems: props.alignItems,
          justifyItems: props.justifyItems,
          padding: `${props.padding}px`,
          backgroundColor: props.bgColor,
        }}
      >
        {children}
      </div>
    ),
  },

  // Flex Layout
  FlexContainer: {
    label: 'Flex Container',
    fields: {
      direction: {
        type: 'select',
        label: 'Direction',
        options: [
          { label: 'Row', value: 'row' },
          { label: 'Column', value: 'column' },
          { label: 'Row Reverse', value: 'row-reverse' },
          { label: 'Column Reverse', value: 'column-reverse' },
        ],
      },
      justifyContent: {
        type: 'select',
        label: 'Justify Content',
        options: [
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
          { label: 'Space Between', value: 'space-between' },
          { label: 'Space Around', value: 'space-around' },
          { label: 'Space Evenly', value: 'space-evenly' },
        ],
      },
      alignItems: {
        type: 'select',
        label: 'Align Items',
        options: [
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
          { label: 'Stretch', value: 'stretch' },
          { label: 'Baseline', value: 'baseline' },
        ],
      },
      wrap: {
        type: 'radio',
        label: 'Wrap',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
      },
      gap: { type: 'number', label: 'Gap (px)', min: 0, max: 60 },
      padding: { type: 'number', label: 'Padding (px)', min: 0, max: 60 },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
    },
    defaultProps: {
      direction: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      wrap: true,
      gap: 20,
      padding: 0,
      bgColor: 'transparent',
    },
    render: (props, { children }) => (
      <div
        style={{
          display: 'flex',
          flexDirection: props.direction,
          justifyContent: props.justifyContent,
          alignItems: props.alignItems,
          flexWrap: props.wrap ? 'wrap' : 'nowrap',
          gap: `${props.gap}px`,
          padding: `${props.padding}px`,
          backgroundColor: props.bgColor,
        }}
      >
        {children}
      </div>
    ),
  },

  // Two Column Layout
  TwoColumn: {
    label: 'Two Column',
    fields: {
      leftWidth: { type: 'number', label: 'Left Column Width (%)', min: 20, max: 80 },
      gap: { type: 'number', label: 'Gap (px)', min: 0, max: 60 },
      verticalAlign: {
        type: 'select',
        label: 'Vertical Align',
        options: [
          { label: 'Top', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'Bottom', value: 'flex-end' },
        ],
      },
      reverseOnMobile: {
        type: 'radio',
        label: 'Reverse on Mobile',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
      },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      padding: { type: 'number', label: 'Padding (px)', min: 0, max: 60 },
    },
    defaultProps: {
      leftWidth: 50,
      gap: 40,
      verticalAlign: 'center',
      reverseOnMobile: false,
      bgColor: 'transparent',
      padding: 20,
    },
    render: (props, { children }) => (
      <div
        style={{
          display: 'flex',
          gap: `${props.gap}px`,
          alignItems: props.verticalAlign,
          flexWrap: 'wrap',
          backgroundColor: props.bgColor,
          padding: `${props.padding}px`,
        }}
      >
        <div
          style={{
            flex: `0 0 calc(${props.leftWidth}% - ${props.gap / 2}px)`,
            minWidth: '300px',
          }}
        >
          {children && children[0]}
        </div>
        <div
          style={{
            flex: `0 0 calc(${100 - props.leftWidth}% - ${props.gap / 2}px)`,
            minWidth: '300px',
          }}
        >
          {children && children[1]}
        </div>
      </div>
    ),
  },

  // Card Container
  Card: {
    label: 'Card',
    fields: {
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
      borderRadius: { type: 'number', label: 'Border Radius (px)', min: 0, max: 40 },
      padding: { type: 'number', label: 'Padding (px)', min: 0, max: 80 },
      shadow: {
        type: 'select',
        label: 'Shadow',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: '0 2px 4px rgba(0,0,0,0.1)' },
          { label: 'Medium', value: '0 4px 12px rgba(0,0,0,0.1)' },
          { label: 'Large', value: '0 8px 24px rgba(0,0,0,0.15)' },
        ],
      },
      borderColor: { type: 'custom', label: 'Border Color', render: ColorField },
      borderWidth: { type: 'number', label: 'Border Width (px)', min: 0, max: 10 },
      maxWidth: { type: 'number', label: 'Max Width (px)', min: 300, max: 1400 },
    },
    defaultProps: {
      bgColor: '#ffffff',
      bgImage: '',
      borderRadius: 12,
      padding: 30,
      shadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderColor: '#e5e7eb',
      borderWidth: 0,
      maxWidth: 800,
    },
    render: (props, { children }) => (
      <div
        style={{
          backgroundColor: props.bgColor,
          backgroundImage: props.bgImage ? `url(${props.bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: `${props.borderRadius}px`,
          padding: `${props.padding}px`,
          boxShadow: props.shadow,
          border: props.borderWidth > 0 ? `${props.borderWidth}px solid ${props.borderColor}` : 'none',
          maxWidth: `${props.maxWidth}px`,
          margin: '20px auto',
        }}
      >
        {children}
      </div>
    ),
  },

  // Hero Section
  HeroSection: {
    label: 'Hero Section',
    fields: {
      title: { type: 'text', label: 'Title' },
      titleSize: { type: 'number', label: 'Title Size (px)', min: 32, max: 120 },
      subtitle: { type: 'textarea', label: 'Subtitle' },
      subtitleSize: { type: 'number', label: 'Subtitle Size (px)', min: 16, max: 48 },
      ctaText: { type: 'text', label: 'CTA Button Text' },
      ctaLink: { type: 'text', label: 'CTA Button Link' },

      // Background
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
      bgOverlay: { type: 'custom', label: 'Overlay Color', render: ColorField },
      overlayOpacity: { type: 'number', label: 'Overlay Opacity (%)', min: 0, max: 100 },

      // Colors
      titleColor: { type: 'custom', label: 'Title Color', render: ColorField },
      subtitleColor: { type: 'custom', label: 'Subtitle Color', render: ColorField },
      ctaBgColor: { type: 'custom', label: 'CTA Background', render: ColorField },
      ctaTextColor: { type: 'custom', label: 'CTA Text Color', render: ColorField },

      // Layout
      textAlign: {
        type: 'select',
        label: 'Text Alignment',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
      minHeight: { type: 'number', label: 'Min Height (px)', min: 300, max: 1000 },
      paddingTop: { type: 'number', label: 'Padding Top (px)', min: 40, max: 200 },
      paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 40, max: 200 },
    },
    defaultProps: {
      title: 'Welcome to My Portfolio',
      titleSize: 64,
      subtitle: 'I build amazing web experiences',
      subtitleSize: 24,
      ctaText: 'View My Work',
      ctaLink: '#projects',
      bgColor: '#667eea',
      bgImage: '',
      bgOverlay: '#000000',
      overlayOpacity: 0,
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
      ctaBgColor: '#ffffff',
      ctaTextColor: '#667eea',
      textAlign: 'center',
      minHeight: 600,
      paddingTop: 100,
      paddingBottom: 100,
    },
    render: (props) => (
      <section
        style={{
          position: 'relative',
          backgroundColor: props.bgColor,
          backgroundImage: props.bgImage ? `url(${props.bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: `${props.minHeight}px`,
          padding: `${props.paddingTop}px 20px ${props.paddingBottom}px 20px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {props.bgImage && props.overlayOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: props.bgOverlay,
              opacity: props.overlayOpacity / 100,
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            textAlign: props.textAlign,
            maxWidth: '900px',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: `${props.titleSize}px`,
              color: props.titleColor,
              fontWeight: 'bold',
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            {props.title}
          </h1>
          <p
            style={{
              fontSize: `${props.subtitleSize}px`,
              color: props.subtitleColor,
              marginBottom: '40px',
              lineHeight: 1.5,
            }}
          >
            {props.subtitle}
          </p>
          {props.ctaText && (
            <a
              href={props.ctaLink}
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                backgroundColor: props.ctaBgColor,
                color: props.ctaTextColor,
                fontSize: '18px',
                fontWeight: 'bold',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              {props.ctaText}
            </a>
          )}
        </div>
      </section>
    ),
  },

  // Navbar
  Navbar: {
    label: 'Navigation Bar',
    fields: {
      logo: { type: 'text', label: 'Logo Text' },
      logoImage: { type: 'custom', label: 'Logo Image', render: ImageField },
      links: { type: 'textarea', label: 'Links (format: Text|#url, one per line)' },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      sticky: {
        type: 'radio',
        label: 'Sticky Header',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
      },
    },
    defaultProps: {
      logo: 'Portfolio',
      logoImage: '',
      links: 'Home|#home\nAbout|#about\nProjects|#projects\nContact|#contact',
      bgColor: '#ffffff',
      textColor: '#1a1a1a',
      accentColor: '#667eea',
      sticky: true,
    },
    render: (props) => {
      const linksList = props.links
        .split('\n')
        .map(line => {
          const [text, url] = line.split('|').map(s => s.trim());
          return text && url ? { text, url } : null;
        })
        .filter(Boolean);

      return (
        <nav
          style={{
            position: props.sticky ? 'sticky' : 'relative',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: props.bgColor,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '16px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: props.textColor,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {props.logoImage && (
              <img
                src={props.logoImage}
                alt={props.logo}
                style={{ height: '40px', objectFit: 'contain' }}
              />
            )}
            {props.logo}
          </div>
          <div style={{ display: 'flex', gap: '30px' }}>
            {linksList.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                style={{
                  color: props.textColor,
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = props.accentColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = props.textColor;
                }}
              >
                {link.text}
              </a>
            ))}
          </div>
        </nav>
      );
    },
  },

  // Footer
  Footer: {
    label: 'Footer',
    fields: {
      text: { type: 'textarea', label: 'Footer Text' },
      socialLinks: { type: 'textarea', label: 'Social Links (format: Icon|URL, one per line)' },
      bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
      textColor: { type: 'custom', label: 'Text Color', render: ColorField },
      padding: { type: 'number', label: 'Padding (px)', min: 20, max: 100 },
    },
    defaultProps: {
      text: '© 2024 Your Name. All rights reserved.',
      socialLinks: '💼|https://linkedin.com/in/yourprofile\n💻|https://github.com/yourusername\n📧|mailto:hello@example.com',
      bgColor: '#1a1a1a',
      textColor: '#ffffff',
      padding: 40,
    },
    render: (props) => {
      const socialList = props.socialLinks
        .split('\n')
        .map(line => {
          const [icon, url] = line.split('|').map(s => s.trim());
          return icon && url ? { icon, url } : null;
        })
        .filter(Boolean);

      return (
        <footer
          style={{
            backgroundColor: props.bgColor,
            color: props.textColor,
            padding: `${props.padding}px 20px`,
            textAlign: 'center',
          }}
        >
          {socialList.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              {socialList.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '28px',
                    color: props.textColor,
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
          <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>
            {props.text}
          </p>
        </footer>
      );
    },
  },
};
