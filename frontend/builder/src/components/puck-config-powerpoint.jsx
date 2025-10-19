import React from 'react';
import InlineEditable from './InlineEditable';
import ResizableBox from './ResizableBox';
import ColorPicker from './ColorPicker';
import ImageUpload from './ImageUpload';

// Custom field renderers
const ColorField = ({ value, onChange, label }) => {
  return <ColorPicker value={value || '#000000'} onChange={onChange} label={label} />;
};

const ImageField = ({ value, onChange, label }) => {
  return <ImageUpload value={value || ''} onChange={onChange} label={label} />;
};

// PowerPoint-style configuration with inline editing and resizing
export const config = {
  categories: {
    text: {
      title: 'Text',
      components: ['EditableHeading', 'EditableParagraph', 'EditableQuote'],
    },
    media: {
      title: 'Media',
      components: ['ResizableImage', 'ResizableVideo'],
    },
    layout: {
      title: 'Layout',
      components: ['ResizableBox', 'Section', 'TwoColumn'],
    },
    cv: {
      title: 'CV',
      components: ['EditableExperienceCard', 'EditableProjectCard', 'EditableSkillsGrid'],
    },
  },

  components: {
    // ========== EDITABLE TEXT COMPONENTS ==========

    EditableHeading: {
      label: '📝 Editable Heading',
      fields: {
        text: { type: 'text', label: 'Text (or click to edit inline)' },
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
            { label: 'Light', value: '300' },
            { label: 'Normal', value: 'normal' },
            { label: 'Bold', value: 'bold' },
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
      },
      defaultProps: {
        text: 'Click to edit heading',
        level: 'h2',
        size: 48,
        color: '#1a1a1a',
        weight: 'bold',
        align: 'left',
      },
      render: ({ text, level, size, color, weight, align, puck }) => (
        <InlineEditable
          value={text}
          onChange={(newText) => puck.setProps({ text: newText })}
          as={level}
          style={{
            fontSize: `${size}px`,
            color,
            fontWeight: weight,
            textAlign: align,
            lineHeight: 1.2,
            margin: 0,
          }}
          placeholder="Click to edit heading..."
        />
      ),
    },

    EditableParagraph: {
      label: '📄 Editable Paragraph',
      fields: {
        text: { type: 'textarea', label: 'Text (or click to edit inline)' },
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
      },
      defaultProps: {
        text: 'Click to edit paragraph text. You can type multiple lines here.',
        size: 16,
        color: '#333333',
        align: 'left',
        lineHeight: 1.6,
      },
      render: ({ text, size, color, align, lineHeight, puck }) => (
        <InlineEditable
          value={text}
          onChange={(newText) => puck.setProps({ text: newText })}
          as="p"
          multiline={true}
          style={{
            fontSize: `${size}px`,
            color,
            textAlign: align,
            lineHeight,
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
          placeholder="Click to edit paragraph..."
        />
      ),
    },

    EditableQuote: {
      label: '💬 Editable Quote',
      fields: {
        quote: { type: 'textarea', label: 'Quote' },
        author: { type: 'text', label: 'Author' },
        bgColor: { type: 'custom', label: 'Background Color', render: ColorField },
        textColor: { type: 'custom', label: 'Text Color', render: ColorField },
        accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      },
      defaultProps: {
        quote: 'Click to edit this inspiring quote.',
        author: 'Author Name',
        bgColor: '#f8f9fa',
        textColor: '#333333',
        accentColor: '#667eea',
      },
      render: ({ quote, author, bgColor, textColor, accentColor, puck }) => (
        <div
          style={{
            backgroundColor: bgColor,
            padding: '40px',
            borderRadius: '12px',
            borderLeft: `4px solid ${accentColor}`,
            margin: '20px 0',
          }}
        >
          <div style={{ fontSize: '48px', color: accentColor, marginBottom: '10px' }}>"</div>
          <InlineEditable
            value={quote}
            onChange={(newQuote) => puck.setProps({ quote: newQuote })}
            as="p"
            multiline={true}
            style={{
              fontSize: '20px',
              fontStyle: 'italic',
              color: textColor,
              lineHeight: 1.6,
              margin: '0 0 20px 0',
            }}
            placeholder="Click to edit quote..."
          />
          <InlineEditable
            value={author}
            onChange={(newAuthor) => puck.setProps({ author: newAuthor })}
            as="div"
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: accentColor,
              textAlign: 'right',
            }}
            placeholder="Click to edit author..."
          />
        </div>
      ),
    },

    // ========== RESIZABLE MEDIA COMPONENTS ==========

    ResizableImage: {
      label: '🖼️ Resizable Image',
      fields: {
        src: { type: 'custom', label: 'Image', render: ImageField },
        alt: { type: 'text', label: 'Alt Text' },
        width: { type: 'number', label: 'Initial Width (px)', min: 100, max: 1200 },
        height: { type: 'number', label: 'Initial Height (px)', min: 100, max: 800 },
        objectFit: {
          type: 'select',
          label: 'Fit',
          options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
            { label: 'Fill', value: 'fill' },
          ],
        },
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
        src: 'https://images.unsplash.com/photo-1557683316-973673baf926',
        alt: 'Image',
        width: 400,
        height: 300,
        objectFit: 'cover',
        borderRadius: 8,
        align: 'center',
      },
      render: ({ src, alt, width, height, objectFit, borderRadius, align, puck }) => (
        <div style={{ display: 'flex', justifyContent: align, margin: '20px 0' }}>
          <ResizableBox
            initialWidth={width}
            initialHeight={height}
            onResize={(dims) => puck.setProps({ width: dims.width, height: dims.height })}
            style={{
              border: '2px dashed transparent',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit,
                borderRadius: `${borderRadius}px`,
                display: 'block',
              }}
            />
          </ResizableBox>
        </div>
      ),
    },

    ResizableVideo: {
      label: '🎬 Resizable Video',
      fields: {
        url: { type: 'text', label: 'YouTube URL' },
        width: { type: 'number', label: 'Initial Width (px)', min: 200, max: 1200 },
        height: { type: 'number', label: 'Initial Height (px)', min: 150, max: 800 },
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
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        width: 560,
        height: 315,
        align: 'center',
      },
      render: ({ url, width, height, align, puck }) => {
        // Extract YouTube video ID
        const getYouTubeId = (url) => {
          const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
          return match ? match[1] : null;
        };

        const videoId = getYouTubeId(url);
        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;

        return (
          <div style={{ display: 'flex', justifyContent: align, margin: '20px 0' }}>
            <ResizableBox
              initialWidth={width}
              initialHeight={height}
              onResize={(dims) => puck.setProps({ width: dims.width, height: dims.height })}
              style={{
                border: '2px dashed transparent',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  borderRadius: '8px',
                }}
              />
            </ResizableBox>
          </div>
        );
      },
    },

    // ========== RESIZABLE LAYOUT COMPONENTS ==========

    ResizableBox: {
      label: '📦 Resizable Box',
      fields: {
        bgColor: { type: 'custom', label: 'Background', render: ColorField },
        bgImage: { type: 'custom', label: 'Background Image', render: ImageField },
        width: { type: 'number', label: 'Initial Width (px)', min: 100, max: 1200 },
        height: { type: 'number', label: 'Initial Height (px)', min: 50, max: 800 },
        padding: { type: 'number', label: 'Padding (px)', min: 0, max: 80 },
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
        bgColor: '#f5f5f5',
        bgImage: '',
        width: 400,
        height: 200,
        padding: 20,
        borderRadius: 8,
        align: 'center',
      },
      render: ({ bgColor, bgImage, width, height, padding, borderRadius, align, puck }, { children }) => (
        <div style={{ display: 'flex', justifyContent: align, margin: '20px 0' }}>
          <ResizableBox
            initialWidth={width}
            initialHeight={height}
            onResize={(dims) => puck.setProps({ width: dims.width, height: dims.height })}
            style={{
              backgroundColor: bgColor,
              backgroundImage: bgImage ? `url(${bgImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: `${padding}px`,
              borderRadius: `${borderRadius}px`,
              border: '2px dashed transparent',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            {children}
          </ResizableBox>
        </div>
      ),
    },

    // ========== EDITABLE CV COMPONENTS ==========

    EditableExperienceCard: {
      label: '💼 Editable Experience Card',
      fields: {
        company: { type: 'text', label: 'Company' },
        position: { type: 'text', label: 'Position' },
        startDate: { type: 'text', label: 'Start Date' },
        endDate: { type: 'text', label: 'End Date' },
        description: { type: 'textarea', label: 'Description' },
        accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      },
      defaultProps: {
        company: 'Company Name',
        position: 'Your Position',
        startDate: 'Jan 2023',
        endDate: 'Present',
        description: 'Click to edit your responsibilities and achievements...',
        accentColor: '#667eea',
      },
      render: ({ company, position, startDate, endDate, description, accentColor, puck }) => (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            borderLeft: `4px solid ${accentColor}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            margin: '20px 0',
          }}
        >
          <InlineEditable
            value={position}
            onChange={(val) => puck.setProps({ position: val })}
            as="h3"
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: '0 0 8px 0',
            }}
          />
          <InlineEditable
            value={company}
            onChange={(val) => puck.setProps({ company: val })}
            as="div"
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: accentColor,
              marginBottom: '8px',
            }}
          />
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            <InlineEditable
              value={startDate}
              onChange={(val) => puck.setProps({ startDate: val })}
              as="span"
              style={{ display: 'inline' }}
            />
            {' - '}
            <InlineEditable
              value={endDate}
              onChange={(val) => puck.setProps({ endDate: val })}
              as="span"
              style={{ display: 'inline' }}
            />
          </div>
          <InlineEditable
            value={description}
            onChange={(val) => puck.setProps({ description: val })}
            as="p"
            multiline={true}
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#333',
              margin: 0,
            }}
          />
        </div>
      ),
    },

    EditableProjectCard: {
      label: '🚀 Editable Project Card',
      fields: {
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
        image: { type: 'custom', label: 'Image', render: ImageField },
        imageHeight: { type: 'number', label: 'Image Height (px)', min: 100, max: 400 },
        accentColor: { type: 'custom', label: 'Accent Color', render: ColorField },
      },
      defaultProps: {
        title: 'Project Title',
        description: 'Click to edit project description...',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
        imageHeight: 200,
        accentColor: '#667eea',
      },
      render: ({ title, description, image, imageHeight, accentColor, puck }) => (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            margin: '20px',
            maxWidth: '400px',
          }}
        >
          {image && (
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                height: `${imageHeight}px`,
                objectFit: 'cover',
              }}
            />
          )}
          <div style={{ padding: '20px' }}>
            <InlineEditable
              value={title}
              onChange={(val) => puck.setProps({ title: val })}
              as="h3"
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                margin: '0 0 12px 0',
              }}
            />
            <InlineEditable
              value={description}
              onChange={(val) => puck.setProps({ description: val })}
              as="p"
              multiline={true}
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#666',
                margin: 0,
              }}
            />
          </div>
        </div>
      ),
    },

    EditableSkillsGrid: {
      label: '⚡ Editable Skills Grid',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        skills: { type: 'textarea', label: 'Skills (comma separated)' },
        columns: { type: 'number', label: 'Columns', min: 2, max: 6 },
        skillBgColor: { type: 'custom', label: 'Skill Badge Color', render: ColorField },
        headingColor: { type: 'custom', label: 'Heading Color', render: ColorField },
      },
      defaultProps: {
        heading: 'Skills',
        skills: 'JavaScript, React, Node.js, Python, PostgreSQL',
        columns: 3,
        skillBgColor: '#667eea',
        headingColor: '#1a1a1a',
      },
      render: ({ heading, skills, columns, skillBgColor, headingColor, puck }) => {
        const skillList = skills.split(',').map(s => s.trim()).filter(s => s);

        return (
          <div style={{ padding: '40px 20px' }}>
            <InlineEditable
              value={heading}
              onChange={(val) => puck.setProps({ heading: val })}
              as="h2"
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: headingColor,
                textAlign: 'center',
                marginBottom: '30px',
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '12px',
                justifyItems: 'center',
              }}
            >
              {skillList.map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: skillBgColor,
                    color: '#ffffff',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
  },
};

export default config;
