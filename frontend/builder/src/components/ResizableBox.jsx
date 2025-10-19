import React, { useState, useRef, useEffect } from 'react';

/**
 * ResizableBox - Drag corners to resize (PowerPoint-style)
 */
export const ResizableBox = ({
  children,
  initialWidth = 300,
  initialHeight = 200,
  minWidth = 100,
  minHeight = 50,
  maxWidth = 1200,
  maxHeight = 1000,
  onResize,
  style = {},
  className = '',
  ...props
}) => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const boxRef = useRef(null);

  useEffect(() => {
    if (onResize) {
      onResize(dimensions);
    }
  }, [dimensions, onResize]);

  const handleMouseDown = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDimensions({ ...dimensions });
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startDimensions.width;
      let newHeight = startDimensions.height;

      switch (resizeDirection) {
        case 'se': // Southeast (bottom-right)
          newWidth = startDimensions.width + deltaX;
          newHeight = startDimensions.height + deltaY;
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = startDimensions.width - deltaX;
          newHeight = startDimensions.height + deltaY;
          break;
        case 'ne': // Northeast (top-right)
          newWidth = startDimensions.width + deltaX;
          newHeight = startDimensions.height - deltaY;
          break;
        case 'nw': // Northwest (top-left)
          newWidth = startDimensions.width - deltaX;
          newHeight = startDimensions.height - deltaY;
          break;
        case 'e': // East (right)
          newWidth = startDimensions.width + deltaX;
          break;
        case 'w': // West (left)
          newWidth = startDimensions.width - deltaX;
          break;
        case 's': // South (bottom)
          newHeight = startDimensions.height + deltaY;
          break;
        case 'n': // North (top)
          newHeight = startDimensions.height - deltaY;
          break;
        default:
          break;
      }

      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, startPos, startDimensions, minWidth, minHeight, maxWidth, maxHeight]);

  const handleSize = 12;
  const handleStyles = {
    position: 'absolute',
    background: '#667eea',
    border: '2px solid #ffffff',
    borderRadius: '50%',
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    cursor: 'pointer',
    zIndex: 10,
    opacity: 0.8,
    transition: 'opacity 0.2s, transform 0.2s',
  };

  const handleHoverStyle = {
    opacity: 1,
    transform: 'scale(1.2)',
  };

  return (
    <div
      ref={boxRef}
      className={`resizable-box ${className}`}
      style={{
        position: 'relative',
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        ...style,
      }}
      {...props}
    >
      {children}

      {/* Corner Handles */}
      <div
        style={{
          ...handleStyles,
          top: `-${handleSize / 2}px`,
          left: `-${handleSize / 2}px`,
          cursor: 'nw-resize',
        }}
        onMouseDown={handleMouseDown('nw')}
        onMouseEnter={(e) => Object.assign(e.target.style, handleHoverStyle)}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'scale(1)';
        }}
      />
      <div
        style={{
          ...handleStyles,
          top: `-${handleSize / 2}px`,
          right: `-${handleSize / 2}px`,
          cursor: 'ne-resize',
        }}
        onMouseDown={handleMouseDown('ne')}
        onMouseEnter={(e) => Object.assign(e.target.style, handleHoverStyle)}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'scale(1)';
        }}
      />
      <div
        style={{
          ...handleStyles,
          bottom: `-${handleSize / 2}px`,
          left: `-${handleSize / 2}px`,
          cursor: 'sw-resize',
        }}
        onMouseDown={handleMouseDown('sw')}
        onMouseEnter={(e) => Object.assign(e.target.style, handleHoverStyle)}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'scale(1)';
        }}
      />
      <div
        style={{
          ...handleStyles,
          bottom: `-${handleSize / 2}px`,
          right: `-${handleSize / 2}px`,
          cursor: 'se-resize',
        }}
        onMouseDown={handleMouseDown('se')}
        onMouseEnter={(e) => Object.assign(e.target.style, handleHoverStyle)}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'scale(1)';
        }}
      />

      {/* Edge Handles */}
      <div
        style={{
          ...handleStyles,
          top: '50%',
          left: `-${handleSize / 2}px`,
          transform: 'translateY(-50%)',
          cursor: 'w-resize',
        }}
        onMouseDown={handleMouseDown('w')}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(-50%) scale(1.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      />
      <div
        style={{
          ...handleStyles,
          top: '50%',
          right: `-${handleSize / 2}px`,
          transform: 'translateY(-50%)',
          cursor: 'e-resize',
        }}
        onMouseDown={handleMouseDown('e')}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(-50%) scale(1.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      />
      <div
        style={{
          ...handleStyles,
          top: `-${handleSize / 2}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'n-resize',
        }}
        onMouseDown={handleMouseDown('n')}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateX(-50%) scale(1.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'translateX(-50%) scale(1)';
        }}
      />
      <div
        style={{
          ...handleStyles,
          bottom: `-${handleSize / 2}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 's-resize',
        }}
        onMouseDown={handleMouseDown('s')}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateX(-50%) scale(1.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.transform = 'translateX(-50%) scale(1)';
        }}
      />
    </div>
  );
};

export default ResizableBox;
