import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import './ColorPicker.css';

const ColorPicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Common color presets
  const presets = [
    '#000000', '#ffffff', '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3',
    '#ff9ff3', '#feca57', '#48dbfb', '#1dd1a1', '#ee5a6f', '#c44569',
  ];

  return (
    <div className="color-picker-wrapper" ref={pickerRef}>
      <div className="color-picker-label">{label}</div>
      <div className="color-picker-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="color-preview" style={{ backgroundColor: value }}></div>
        <span className="color-value">{value}</span>
        <span className="color-dropdown-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="color-picker-dropdown">
          {/* Hex Color Picker */}
          <HexColorPicker color={value} onChange={onChange} />

          {/* Hex Input */}
          <div className="color-input-wrapper">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="color-hex-input"
              placeholder="#000000"
            />
          </div>

          {/* Preset Colors */}
          <div className="color-presets">
            <div className="preset-label">Presets:</div>
            <div className="preset-grid">
              {presets.map((preset) => (
                <div
                  key={preset}
                  className="preset-color"
                  style={{ backgroundColor: preset }}
                  onClick={() => {
                    onChange(preset);
                    setIsOpen(false);
                  }}
                  title={preset}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
