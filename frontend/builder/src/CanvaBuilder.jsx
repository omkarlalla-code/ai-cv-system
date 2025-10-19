import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import './CanvaBuilder.css';

function CanvaBuilder() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [nextId, setNextId] = useState(1);

  const addText = () => {
    const newElement = {
      id: nextId,
      type: 'text',
      content: 'Double-click to edit',
      x: 100,
      y: 100,
      width: 300,
      height: 50,
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal',
      fontFamily: 'Arial',
    };
    setElements([...elements, newElement]);
    setNextId(nextId + 1);
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const newElement = {
        id: nextId,
        type: 'image',
        url,
        x: 100,
        y: 100,
        width: 300,
        height: 200,
      };
      setElements([...elements, newElement]);
      setNextId(nextId + 1);
    }
  };

  const addShape = (shape) => {
    const newElement = {
      id: nextId,
      type: 'shape',
      shape,
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      color: '#667eea',
    };
    setElements([...elements, newElement]);
    setNextId(nextId + 1);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleTextEdit = (id) => {
    const element = elements.find(el => el.id === id);
    const newContent = prompt('Edit text:', element.content);
    if (newContent !== null) {
      updateElement(id, { content: newContent });
    }
  };

  const exportDesign = async () => {
    const design = {
      elements,
      canvas: { width: 1440, height: 900 }
    };

    // Save as JSON
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.json';
    a.click();
    URL.revokeObjectURL(url);

    alert('Design exported! (Screenshot export will be added next)');
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="canva-builder">
      {/* Header */}
      <div className="builder-header">
        <h1>BetterCV - Visual Builder</h1>
        <div className="header-actions">
          <button onClick={exportDesign} className="btn btn-primary">
            💾 Export Design
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
            <button onClick={() => addShape('rectangle')} className="sidebar-btn-small">
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
                  <label>
                    Font Size:
                    <input
                      type="number"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })}
                    />
                  </label>

                  <label>
                    Color:
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => updateElement(selectedId, { color: e.target.value })}
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
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </label>
                </>
              )}

              {selectedElement.type === 'shape' && (
                <label>
                  Color:
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                  />
                </label>
              )}

              <button
                onClick={() => deleteElement(selectedId)}
                className="btn-delete"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="canvas-container">
          <div className="canvas" style={{ width: 1440, height: 900, background: 'white' }}>
            {elements.map((element) => (
              <Rnd
                key={element.id}
                size={{ width: element.width, height: element.height }}
                position={{ x: element.x, y: element.y }}
                onDragStop={(e, d) => updateElement(element.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateElement(element.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                  });
                }}
                onClick={() => setSelectedId(element.id)}
                className={selectedId === element.id ? 'element-selected' : ''}
              >
                {element.type === 'text' && (
                  <div
                    onDoubleClick={() => handleTextEdit(element.id)}
                    style={{
                      fontSize: element.fontSize,
                      color: element.color,
                      fontFamily: element.fontFamily,
                      fontWeight: element.fontWeight,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      cursor: 'text',
                      userSelect: 'none',
                    }}
                  >
                    {element.content}
                  </div>
                )}

                {element.type === 'image' && (
                  <img
                    src={element.url}
                    alt="User uploaded"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}

                {element.type === 'shape' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: element.color,
                      borderRadius: element.shape === 'circle' ? '50%' : '0',
                    }}
                  />
                )}
              </Rnd>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CanvaBuilder;
