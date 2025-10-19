import React, { useState } from 'react';

// Editable text component that opens properties on click
const EditableText = ({
  text,
  fontSize,
  color,
  fontWeight,
  style = {},
  onUpdate,
  className = ''
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsSelected(true);

    // Emit event that this element is selected
    window.dispatchEvent(new CustomEvent('element-selected', {
      detail: {
        type: 'text',
        props: { text, fontSize, color, fontWeight },
        onUpdate
      }
    }));
  };

  return (
    <div
      onClick={handleClick}
      className={`editable-element ${isSelected ? 'selected' : ''} ${className}`}
      style={{
        ...style,
        fontSize: `${fontSize}px`,
        color,
        fontWeight,
        cursor: 'pointer',
        outline: isSelected ? '2px solid #667eea' : 'none',
        outlineOffset: '4px',
        transition: 'outline 0.2s',
      }}
    >
      {text}
    </div>
  );
};

export default EditableText;
