import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import ColorPicker from './ColorPicker';
import ImageUpload from './ImageUpload';

// Custom fields
const ColorField = ({ value, onChange, label }) => {
  return <ColorPicker value={value || '#000000'} onChange={onChange} label={label} />;
};

const ImageField = ({ value, onChange, label }) => {
  return <ImageUpload value={value || ''} onChange={onChange} label={label} />;
};

// ATOMIC COMPONENTS - Each element is separate
export const config = {
  components: {
    // ========== TEXT ELEMENTS ==========

    // Heading
    Heading: {
      label: 'Heading',
      fields: {
        text: { type: 'textarea', label: 'Text' },
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
        width: { type: 'number', label: 'Width (px)', min: 100, max: 1200 },
        height: { type: 'number', label: 'Height (px)', min: 30, max: 500 },
        bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
        marginTop: { type: 'number', label: 'Margin Top (px)', min: 0, max: 100 },
        marginBottom: { type: 'number', label: 'Margin Bottom (px)', min: 0, max: 100 },
      },
      defaultProps: {
        text: 'Your Heading Here',
        size: 48,
        color: '#000000',
        weight: 'bold',
        align: 'left',
        width: 600,
        height: 60,
        bgColor: 'transparent',
        bgImage: '',
        marginTop: 0,
        marginBottom: 20,
      },
      render: ({ text, size, color, weight, align, width, height, bgColor, bgImage, marginTop, marginBottom, puck }) => {
        const [dimensions, setDimensions] = useState({ width, height });

        return (
          <Rnd
            size={{ width: dimensions.width, height: dimensions.height }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setDimensions({
                width: ref.style.width,
                height: ref.style.height,
              });
              if (puck?.onChange) {
                puck.onChange({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
              }
            }}
            minWidth={100}
            minHeight={30}
            disableDragging={true}
            enableResizing={{
              right: true,
              bottom: true,
              bottomRight: true,
            }}
            style={{
              border: '1px dashed transparent',
            }}
            resizeHandleStyles={{
              right: { width: '10px', right: '-5px', cursor: 'ew-resize', background: 'rgba(102, 126, 234, 0.3)' },
              bottom: { height: '10px', bottom: '-5px', cursor: 'ns-resize', background: 'rgba(102, 126, 234, 0.3)' },
              bottomRight: { width: '20px', height: '20px', right: '-10px', bottom: '-10px', cursor: 'nwse-resize', background: 'rgba(102, 126, 234, 0.5)', borderRadius: '50%' },
            }}
          >
            <h1
              style={{
                fontSize: `${size}px`,
                color,
                fontWeight: weight,
                textAlign: align,
                width: '100%',
                height: '100%',
                backgroundColor: bgColor,
                backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginTop: `${marginTop}px`,
                marginBottom: `${marginBottom}px`,
                lineHeight: 1.2,
                padding: bgImage || bgColor !== 'transparent' ? '10px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                margin: 0,
                boxSizing: 'border-box',
              }}
            >
              {text}
            </h1>
          </Rnd>
        );
      },
    },

    // Paragraph
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
        bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
        marginBottom: { type: 'number', label: 'Margin Bottom (px)', min: 0, max: 100 },
      },
      defaultProps: {
        text: 'Your paragraph text goes here...',
        size: 16,
        color: '#333333',
        align: 'left',
        lineHeight: 1.6,
        bgColor: 'transparent',
        bgImage: '',
        marginBottom: 20,
      },
      render: ({ text, size, color, align, lineHeight, bgColor, bgImage, marginBottom }) => (
        <p
          style={{
            fontSize: `${size}px`,
            color,
            textAlign: align,
            lineHeight,
            backgroundColor: bgColor,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginBottom: `${marginBottom}px`,
            whiteSpace: 'pre-wrap',
            padding: bgImage || bgColor !== 'transparent' ? '10px' : '0',
          }}
        >
          {text}
        </p>
      ),
    },

    // ========== BUTTON ELEMENT ==========

    Button: {
      label: 'Button',
      fields: {
        text: { type: 'text', label: 'Text' },
        link: { type: 'text', label: 'Link URL' },
        bgColor: { type: 'custom', label: 'Background', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
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
        bgImage: '',
        textColor: '#ffffff',
        size: 16,
        paddingX: 30,
        paddingY: 12,
        borderRadius: 8,
        align: 'center',
      },
      render: ({ text, link, bgColor, bgImage, textColor, size, paddingX, paddingY, borderRadius, align }) => (
        <div style={{ display: 'flex', justifyContent: align, margin: '20px 0' }}>
          <a
            href={link}
            style={{
              display: 'inline-block',
              padding: `${paddingY}px ${paddingX}px`,
              backgroundColor: bgColor,
              backgroundImage: bgImage ? `url(${bgImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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

    // ========== IMAGE ELEMENT ==========

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

    // ========== LAYOUT ELEMENTS ==========

    // Container/Box
    Box: {
      label: 'Box',
      fields: {
        bgColor: { type: 'custom', label: 'Background', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
        paddingX: { type: 'number', label: 'Padding Left/Right (px)', min: 0, max: 200 },
        borderRadius: { type: 'number', label: 'Roundness (px)', min: 0, max: 50 },
        minHeight: { type: 'number', label: 'Min Height (px)', min: 0, max: 800 },
      },
      defaultProps: {
        bgColor: '#f5f5f5',
        bgImage: '',
        paddingTop: 60,
        paddingBottom: 60,
        paddingX: 20,
        borderRadius: 0,
        minHeight: 0,
      },
      render: ({ bgColor, bgImage, paddingTop, paddingBottom, paddingX, borderRadius, minHeight }, { children }) => (
        <div
          style={{
            backgroundColor: bgColor,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px ${paddingX}px`,
            borderRadius: `${borderRadius}px`,
            minHeight: minHeight > 0 ? `${minHeight}px` : 'auto',
          }}
        >
          {children}
        </div>
      ),
    },

    // Spacer
    Spacer: {
      label: 'Spacer',
      fields: {
        height: { type: 'number', label: 'Height (px)', min: 10, max: 200 },
        bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
      },
      defaultProps: {
        height: 40,
        bgColor: 'transparent',
        bgImage: '',
      },
      render: ({ height, bgColor, bgImage }) => (
        <div
          style={{
            height: `${height}px`,
            backgroundColor: bgColor,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ),
    },

    // Divider Line
    Divider: {
      label: 'Divider',
      fields: {
        color: { type: 'custom', label: 'Color', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
        thickness: { type: 'number', label: 'Thickness (px)', min: 1, max: 50 },
        width: { type: 'number', label: 'Width (%)', min: 10, max: 100 },
        marginTop: { type: 'number', label: 'Margin Top (px)', min: 0, max: 100 },
        marginBottom: { type: 'number', label: 'Margin Bottom (px)', min: 0, max: 100 },
      },
      defaultProps: {
        color: '#e0e0e0',
        bgImage: '',
        thickness: 1,
        width: 100,
        marginTop: 20,
        marginBottom: 20,
      },
      render: ({ color, bgImage, thickness, width, marginTop, marginBottom }) => (
        <div
          style={{
            margin: `${marginTop}px auto ${marginBottom}px auto`,
            width: `${width}%`,
            height: `${thickness}px`,
            backgroundColor: color,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ),
    },
  },
};
