import React, { useState, useRef } from 'react';
import { Stage, Layer, Text, Rect, Circle, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import './KonvaBuilder.css';

// Image component wrapper
const URLImage = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const [img] = useImage(shapeProps.url);
  const shapeRef = useRef();
  const trRef = useRef();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Image
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        image={img}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Shape component (Rectangle/Circle)
const Shape = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const ShapeComponent = shapeProps.type === 'rect' ? Rect : Circle;

  return (
    <>
      <ShapeComponent
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          if (shapeProps.type === 'rect') {
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            });
          } else {
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              radius: Math.max(5, node.radius() * scaleX),
            });
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Text component
const TextNode = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            fontSize: Math.max(5, shapeProps.fontSize * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

function KonvaBuilder() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const stageRef = useRef();

  const addText = () => {
    const id = `text-${Date.now()}`;
    const newText = {
      id,
      type: 'text',
      text: 'Double-click to edit',
      x: 100,
      y: 100,
      fontSize: 32,
      fill: '#000000',
      fontFamily: 'Arial',
      width: 300,
    };
    setElements([...elements, newText]);
    setSelectedId(id);
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const id = `image-${Date.now()}`;
      const newImage = {
        id,
        type: 'image',
        url,
        x: 100,
        y: 100,
        width: 300,
        height: 200,
      };
      setElements([...elements, newImage]);
      setSelectedId(id);
    }
  };

  const addShape = (shapeType) => {
    const id = `shape-${Date.now()}`;
    const newShape = {
      id,
      type: shapeType,
      x: 200,
      y: 200,
      fill: '#667eea',
      ...(shapeType === 'rect' ? { width: 150, height: 150 } : { radius: 75 }),
    };
    setElements([...elements, newShape]);
    setSelectedId(id);
  };

  const updateElement = (id, newAttrs) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...newAttrs } : el))
    );
  };

  const deleteElement = () => {
    if (selectedId) {
      setElements(elements.filter((el) => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleTextEdit = () => {
    if (selectedId) {
      const element = elements.find((el) => el.id === selectedId);
      if (element && element.type === 'text') {
        const newText = prompt('Edit text:', element.text);
        if (newText !== null) {
          updateElement(selectedId, { text: newText });
        }
      }
    }
  };

  const exportToImage = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'design.png';
      link.href = uri;
      link.click();
    }
  };

  const saveVersion = async () => {
    const designData = {
      elements,
      canvas: { width: 1440, height: 900 },
      timestamp: new Date().toISOString(),
    };

    // Export screenshot
    const screenshot = stageRef.current.toDataURL();

    // Save to history
    setHistory([...history, { data: designData, screenshot }]);

    // Save to localStorage (will move to DB)
    localStorage.setItem('konva-design', JSON.stringify(designData));
    localStorage.setItem('konva-history', JSON.stringify([...history, { data: designData, screenshot }]));

    alert('Version saved! 💾');
  };

  const generateWebsite = async () => {
    if (!stageRef.current) return;

    // Get screenshot
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

    // Convert to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Prepare form data
    const formData = new FormData();
    formData.append('screenshot', blob, 'design.png');
    formData.append('data', JSON.stringify({ elements }));

    try {
      const result = await fetch('/api/builder/generate-code', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) throw new Error('Failed to generate');

      const data = await result.json();

      // Download HTML
      const htmlBlob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'portfolio.html';
      link.click();
      URL.revokeObjectURL(url);

      alert('Website generated! 🚀');
    } catch (error) {
      console.error(error);
      alert('Failed to generate website. Ensure backend is running with API key.');
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="konva-builder">
      {/* Header */}
      <div className="builder-header">
        <h1>BetterCV - Visual Builder (Konva)</h1>
        <div className="header-actions">
          <button onClick={saveVersion} className="btn btn-secondary">
            💾 Save Version
          </button>
          <button onClick={exportToImage} className="btn btn-secondary">
            📸 Export PNG
          </button>
          <button onClick={generateWebsite} className="btn btn-primary">
            🚀 Generate Website
          </button>
        </div>
      </div>

      <div className="builder-main">
        {/* Sidebar */}
        <div className="sidebar">
          <h3>Elements</h3>

          <button onClick={addText} className="sidebar-btn">
            📝 Add Text
          </button>

          <button onClick={addImage} className="sidebar-btn">
            🖼️ Add Image
          </button>

          <div className="sidebar-section">
            <p>Shapes</p>
            <button onClick={() => addShape('rect')} className="sidebar-btn-small">
              ▭ Rectangle
            </button>
            <button onClick={() => addShape('circle')} className="sidebar-btn-small">
              ● Circle
            </button>
          </div>

          {selectedElement && (
            <div className="properties-panel">
              <h4>Properties</h4>

              {selectedElement.type === 'text' && (
                <>
                  <button onClick={handleTextEdit} className="sidebar-btn">
                    ✏️ Edit Text
                  </button>

                  <label>
                    Font Size: {selectedElement.fontSize}px
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={selectedElement.fontSize}
                      onChange={(e) =>
                        updateElement(selectedId, { fontSize: parseInt(e.target.value) })
                      }
                    />
                  </label>

                  <label>
                    Color:
                    <input
                      type="color"
                      value={selectedElement.fill}
                      onChange={(e) => updateElement(selectedId, { fill: e.target.value })}
                    />
                  </label>

                  <label>
                    Font:
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times</option>
                      <option value="Courier New">Courier</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </label>
                </>
              )}

              {(selectedElement.type === 'rect' || selectedElement.type === 'circle') && (
                <label>
                  Fill Color:
                  <input
                    type="color"
                    value={selectedElement.fill}
                    onChange={(e) => updateElement(selectedId, { fill: e.target.value })}
                  />
                </label>
              )}

              <button onClick={deleteElement} className="btn-delete">
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="canvas-container">
          <Stage
            width={1440}
            height={900}
            ref={stageRef}
            onMouseDown={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                setSelectedId(null);
              }
            }}
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            <Layer>
              {elements.map((el) => {
                if (el.type === 'text') {
                  return (
                    <TextNode
                      key={el.id}
                      shapeProps={el}
                      isSelected={el.id === selectedId}
                      onSelect={() => setSelectedId(el.id)}
                      onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                    />
                  );
                } else if (el.type === 'image') {
                  return (
                    <URLImage
                      key={el.id}
                      shapeProps={el}
                      isSelected={el.id === selectedId}
                      onSelect={() => setSelectedId(el.id)}
                      onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                    />
                  );
                } else {
                  return (
                    <Shape
                      key={el.id}
                      shapeProps={el}
                      isSelected={el.id === selectedId}
                      onSelect={() => setSelectedId(el.id)}
                      onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                    />
                  );
                }
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

export default KonvaBuilder;
