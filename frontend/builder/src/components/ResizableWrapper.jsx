import React from 'react';
import { Rnd } from 'react-rnd';

const ResizableWrapper = ({ children, width, height, onResize, minWidth = 50, minHeight = 30 }) => {
  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: width || 'auto',
        height: height || 'auto',
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      bounds="parent"
      onResizeStop={(e, direction, ref, delta, position) => {
        if (onResize) {
          onResize({
            width: ref.style.width,
            height: ref.style.height,
          });
        }
      }}
      enableResizing={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      disableDragging={true}
      style={{
        border: '1px dashed transparent',
      }}
      resizeHandleStyles={{
        right: {
          width: '10px',
          right: '-5px',
          cursor: 'ew-resize',
        },
        bottom: {
          height: '10px',
          bottom: '-5px',
          cursor: 'ns-resize',
        },
        bottomRight: {
          width: '20px',
          height: '20px',
          right: '-10px',
          bottom: '-10px',
          cursor: 'nwse-resize',
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px dashed #667eea';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px dashed transparent';
      }}
    >
      {children}
    </Rnd>
  );
};

export default ResizableWrapper;
