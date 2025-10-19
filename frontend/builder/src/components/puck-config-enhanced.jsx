import React from 'react';
import ColorPicker from './ColorPicker';
import ImageUpload from './ImageUpload';

// Custom field for color with dropdown picker
const ColorField = ({ value, onChange, name, label }) => {
  return <ColorPicker value={value || '#000000'} onChange={onChange} label={label} />;
};

// Custom field for image upload
const ImageField = ({ value, onChange, name, label }) => {
  return <ImageUpload value={value || ''} onChange={onChange} label={label} />;
};

// Enhanced Puck config with Canva-like customization
export const config = {
  components: {
    // Hero Section - Fully customizable with organized groups
    Hero: {
      fields: {
        // Title Group
        title: { type: 'text', label: '📝 Title Text' },
        titleSize: { type: 'number', label: '↕️ Title Size', min: 20, max: 120 },
        titleColor: { type: 'custom', label: '🎨 Title Color', render: ColorField },

        // Subtitle Group
        subtitle: { type: 'textarea', label: '📝 Subtitle Text' },
        subtitleSize: { type: 'number', label: '↕️ Subtitle Size', min: 12, max: 60 },
        subtitleColor: { type: 'custom', label: '🎨 Subtitle Color', render: ColorField },

        // Background Group
        backgroundColor: { type: 'custom', label: '🎨 Background Color', render: ColorField },
        backgroundImage: { type: 'custom', label: '🖼️ Background Image', render: ImageField },

        // Spacing Group
        paddingTop: { type: 'number', label: '⬆️ Padding Top', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: '⬇️ Padding Bottom', min: 0, max: 200 },
        textAlign: {
          type: 'select',
          label: 'Text Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        buttonText: { type: 'text', label: 'Button Text' },
        buttonBgColor: { type: 'custom', label: 'Button Background', render: ColorField },
        buttonTextColor: { type: 'custom', label: 'Button Text Color', render: ColorField },
        buttonLink: { type: 'text', label: 'Button Link' },
      },
      defaultProps: {
        title: 'Welcome to My Portfolio',
        titleSize: 48,
        titleColor: '#ffffff',
        subtitle: 'Building amazing things',
        subtitleSize: 20,
        subtitleColor: '#ffffff',
        backgroundColor: '#667eea',
        backgroundImage: '',
        paddingTop: 100,
        paddingBottom: 100,
        textAlign: 'center',
        buttonText: 'View My Work',
        buttonBgColor: '#ffffff',
        buttonTextColor: '#667eea',
        buttonLink: '#projects',
      },
      render: (props) => (
        <section
          style={{
            padding: `${props.paddingTop}px 20px ${props.paddingBottom}px 20px`,
            textAlign: props.textAlign,
            backgroundColor: props.backgroundColor,
            backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: props.titleColor,
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: props.textAlign === 'center' ? 'center' : props.textAlign === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          <h1 style={{ fontSize: `${props.titleSize}px`, marginBottom: '20px', color: props.titleColor, fontWeight: 'bold' }}>
            {props.title}
          </h1>
          <p style={{ fontSize: `${props.subtitleSize}px`, marginBottom: '30px', color: props.subtitleColor, maxWidth: '800px' }}>
            {props.subtitle}
          </p>
          {props.buttonText && (
            <a
              href={props.buttonLink}
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                backgroundColor: props.buttonBgColor,
                color: props.buttonTextColor,
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {props.buttonText}
            </a>
          )}
        </section>
      ),
    },

    // Text Block - Fully customizable
    TextBlock: {
      fields: {
        content: { type: 'textarea', label: 'Content' },
        fontSize: { type: 'number', label: 'Font Size (px)', min: 12, max: 72 },
        fontWeight: {
          type: 'select',
          label: 'Font Weight',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Bold', value: 'bold' },
            { label: 'Light', value: '300' },
          ],
        },
        color: { type: 'custom', label: 'Text Color', render: ColorField },
        backgroundColor: { type: 'custom', label: 'Background Color', render: ColorField },
        textAlign: {
          type: 'select',
          label: 'Text Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
            { label: 'Justify', value: 'justify' },
          ],
        },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 100 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 100 },
        paddingLeft: { type: 'number', label: 'Padding Left (px)', min: 0, max: 100 },
        paddingRight: { type: 'number', label: 'Padding Right (px)', min: 0, max: 100 },
        maxWidth: { type: 'number', label: 'Max Width (px)', min: 400, max: 1400 },
      },
      defaultProps: {
        content: 'Add your text here. You can customize font size, color, alignment, and more.',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#333333',
        backgroundColor: 'transparent',
        textAlign: 'left',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
        maxWidth: 1200,
      },
      render: (props) => (
        <div
          style={{
            padding: `${props.paddingTop}px ${props.paddingRight}px ${props.paddingBottom}px ${props.paddingLeft}px`,
            backgroundColor: props.backgroundColor,
            maxWidth: `${props.maxWidth}px`,
            margin: '0 auto',
          }}
        >
          <p
            style={{
              fontSize: `${props.fontSize}px`,
              fontWeight: props.fontWeight,
              color: props.color,
              textAlign: props.textAlign,
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}
          >
            {props.content}
          </p>
        </div>
      ),
    },

    // Image Block
    Image: {
      fields: {
        url: { type: 'custom', label: 'Image', render: ImageField },
        alt: { type: 'text', label: 'Alt Text' },
        width: { type: 'number', label: 'Width (%)', min: 10, max: 100 },
        height: { type: 'number', label: 'Height (px)', min: 100, max: 800 },
        borderRadius: { type: 'number', label: 'Border Radius (px)', min: 0, max: 50 },
        objectFit: {
          type: 'select',
          label: 'Object Fit',
          options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
            { label: 'Fill', value: 'fill' },
          ],
        },
        align: {
          type: 'select',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'flex-end' },
          ],
        },
      },
      defaultProps: {
        url: 'https://via.placeholder.com/800x400',
        alt: 'Image',
        width: 100,
        height: 400,
        borderRadius: 0,
        objectFit: 'cover',
        align: 'center',
      },
      render: (props) => (
        <div style={{ display: 'flex', justifyContent: props.align, padding: '20px' }}>
          <img
            src={props.url}
            alt={props.alt}
            style={{
              width: `${props.width}%`,
              height: `${props.height}px`,
              objectFit: props.objectFit,
              borderRadius: `${props.borderRadius}px`,
            }}
          />
        </div>
      ),
    },

    // Container/Box - For layout
    Container: {
      fields: {
        backgroundColor: { type: 'custom', label: 'Background Color', render: ColorField },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
        paddingLeft: { type: 'number', label: 'Padding Left (px)', min: 0, max: 200 },
        paddingRight: { type: 'number', label: 'Padding Right (px)', min: 0, max: 200 },
        borderRadius: { type: 'number', label: 'Border Radius (px)', min: 0, max: 50 },
        maxWidth: { type: 'number', label: 'Max Width (px)', min: 400, max: 1600 },
      },
      defaultProps: {
        backgroundColor: '#f5f5f5',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 0,
        maxWidth: 1200,
      },
      render: (props, { children }) => (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            padding: `${props.paddingTop}px ${props.paddingRight}px ${props.paddingBottom}px ${props.paddingLeft}px`,
            borderRadius: `${props.borderRadius}px`,
            maxWidth: `${props.maxWidth}px`,
            margin: '0 auto',
          }}
        >
          {children}
        </div>
      ),
    },

    // Button
    Button: {
      fields: {
        text: { type: 'text', label: 'Button Text' },
        link: { type: 'text', label: 'Link URL' },
        backgroundColor: { type: 'custom', label: 'Background Color', render: ColorField },
        textColor: { type: 'custom', label: 'Text Color', render: ColorField },
        fontSize: { type: 'number', label: 'Font Size (px)', min: 12, max: 32 },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 5, max: 30 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 5, max: 30 },
        paddingLeft: { type: 'number', label: 'Padding Left (px)', min: 10, max: 60 },
        paddingRight: { type: 'number', label: 'Padding Right (px)', min: 10, max: 60 },
        borderRadius: { type: 'number', label: 'Border Radius (px)', min: 0, max: 50 },
        align: {
          type: 'select',
          label: 'Alignment',
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
        backgroundColor: '#667eea',
        textColor: '#ffffff',
        fontSize: 16,
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 5,
        align: 'center',
      },
      render: (props) => (
        <div style={{ display: 'flex', justifyContent: props.align, padding: '20px' }}>
          <a
            href={props.link}
            style={{
              display: 'inline-block',
              backgroundColor: props.backgroundColor,
              color: props.textColor,
              fontSize: `${props.fontSize}px`,
              padding: `${props.paddingTop}px ${props.paddingRight}px ${props.paddingBottom}px ${props.paddingLeft}px`,
              borderRadius: `${props.borderRadius}px`,
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            {props.text}
          </a>
        </div>
      ),
    },

    // Spacer
    Spacer: {
      fields: {
        height: { type: 'number', label: 'Height (px)', min: 10, max: 200 },
      },
      defaultProps: {
        height: 40,
      },
      render: (props) => <div style={{ height: `${props.height}px` }} />,
    },

    // Columns - 2 column layout
    Columns: {
      fields: {
        gap: { type: 'number', label: 'Gap Between Columns (px)', min: 0, max: 100 },
        leftWidth: { type: 'number', label: 'Left Column Width (%)', min: 20, max: 80 },
      },
      defaultProps: {
        gap: 20,
        leftWidth: 50,
      },
      render: (props, { children }) => (
        <div
          style={{
            display: 'flex',
            gap: `${props.gap}px`,
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div style={{ flex: `0 0 ${props.leftWidth}%` }}>
            {children && children[0]}
          </div>
          <div style={{ flex: `0 0 ${100 - props.leftWidth}%` }}>
            {children && children[1]}
          </div>
        </div>
      ),
    },
  },
};
