import React, { useState, useRef, useEffect } from 'react';

/**
 * InlineEditable - Click to edit text inline (PowerPoint-style)
 */
export const InlineEditable = ({
  value,
  onChange,
  as = 'p',
  style = {},
  placeholder = 'Click to edit...',
  multiline = false,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value || '');
  const inputRef = useRef(null);
  const Tag = as;

  useEffect(() => {
    setText(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text when entering edit mode
      if (multiline) {
        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleClick = (e) => {
    if (!isEditing) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onChange) {
      onChange(text);
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setText(value || '');
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  if (isEditing) {
    const commonStyles = {
      ...style,
      border: '2px solid #667eea',
      outline: 'none',
      background: 'rgba(102, 126, 234, 0.05)',
      width: '100%',
      fontFamily: style.fontFamily || 'inherit',
      fontSize: style.fontSize || 'inherit',
      fontWeight: style.fontWeight || 'inherit',
      color: style.color || 'inherit',
      textAlign: style.textAlign || 'inherit',
      lineHeight: style.lineHeight || 'inherit',
      padding: '8px',
      boxSizing: 'border-box',
    };

    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            ...commonStyles,
            resize: 'vertical',
            minHeight: style.minHeight || '100px',
          }}
          {...props}
        />
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={commonStyles}
        {...props}
      />
    );
  }

  return (
    <Tag
      onClick={handleClick}
      style={{
        ...style,
        cursor: 'text',
        position: 'relative',
        minHeight: style.minHeight || (multiline ? '100px' : 'auto'),
        border: '2px solid transparent',
        padding: '8px',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
      {...props}
    >
      {text || placeholder}
    </Tag>
  );
};

export default InlineEditable;
