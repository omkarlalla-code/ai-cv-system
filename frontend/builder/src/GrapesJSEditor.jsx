import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import './GrapesJSFix.css';

const GrapesJSEditor = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: 'auto',
      fromElement: false,

      // Storage
      storageManager: false,

      // Device Manager (responsive)
      deviceManager: {
        devices: [{
          name: 'Desktop',
          width: '',
        }, {
          name: 'Tablet',
          width: '768px',
        }, {
          name: 'Mobile',
          width: '375px',
        }]
      },

      // Panels
      panels: {
        defaults: []
      },

      // Put blocks in our custom sidebar
      blockManager: {
        appendTo: '#blocks'
      },

      // Put other panels in the right sidebar
      layerManager: {
        appendTo: '.layers-container'
      },
      selectorManager: {
        appendTo: '.styles-container'
      },
      styleManager: {
        appendTo: '.styles-container',
        sectors: [{
          name: 'General',
          open: false,
          buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
        }, {
          name: 'Dimension',
          open: false,
          buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
        }, {
          name: 'Typography',
          open: false,
          buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
        }, {
          name: 'Decorations',
          open: false,
          buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
        }, {
          name: 'Extra',
          open: false,
          buildProps: ['transition', 'perspective', 'transform'],
        }]
      },
      traitManager: {
        appendTo: '.traits-container'
      }
    });

    // Auto-save functionality
    const AUTOSAVE_KEY = 'bettercv-autosave';
    const AUTOSAVE_INTERVAL = 5000; // Save every 5 seconds

    // Load saved design on init
    const savedDesign = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDesign) {
      try {
        const data = JSON.parse(savedDesign);
        editor.setComponents(data.html);
        editor.setStyle(data.css);
        console.log('Loaded saved design from', new Date(data.timestamp).toLocaleString());
      } catch (e) {
        console.error('Failed to load autosave:', e);
        // Add initial content if load fails
        editor.addComponents(`
          <div style="padding: 40px; text-align: center; color: #999; min-height: 300px;">
            <h2>Drag components here to start building</h2>
            <p>Your work is automatically saved every 5 seconds</p>
          </div>
        `);
      }
    } else {
      // Add initial content if no saved design
      editor.addComponents(`
        <div style="padding: 40px; text-align: center; color: #999; min-height: 300px;">
          <h2>Drag components here to start building</h2>
          <p>Your work is automatically saved every 5 seconds</p>
        </div>
      `);
    }

    // Auto-save on changes
    let saveTimeout;
    editor.on('update', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const design = {
          html: editor.getHtml(),
          css: editor.getCss(),
          timestamp: Date.now()
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(design));
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      }, AUTOSAVE_INTERVAL);
    });

    // Keyboard shortcuts
    let copiedComponent = null;

    document.addEventListener('keydown', (e) => {
      const selected = editor.getSelected();

      // Delete - Remove selected component
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected && !e.target.matches('input, textarea')) {
          e.preventDefault();
          selected.remove();
        }
      }

      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editor.UndoManager.undo();
      }

      // Ctrl+Y / Cmd+Shift+Z - Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        editor.UndoManager.redo();
      }

      // Ctrl+C / Cmd+C - Copy component
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selected && !e.target.matches('input, textarea')) {
          e.preventDefault();
          copiedComponent = selected.clone();
          console.log('Component copied');
        }
      }

      // Ctrl+V / Cmd+V - Paste component
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (copiedComponent && !e.target.matches('input, textarea')) {
          e.preventDefault();
          const parent = selected ? selected.parent() : editor.getWrapper();
          const pasted = copiedComponent.clone();
          parent.append(pasted);
          editor.select(pasted);
          console.log('Component pasted');
        }
      }

      // Ctrl+D / Cmd+D - Duplicate selected component
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (selected && !e.target.matches('input, textarea')) {
          e.preventDefault();
          const clone = selected.clone();
          selected.parent().append(clone);
          editor.select(clone);
          console.log('Component duplicated');
        }
      }
    });

    // Add right-click context menu
    editor.on('component:selected', (component) => {
      // Remove any existing context menu
      const existingMenu = document.getElementById('custom-context-menu');
      if (existingMenu) existingMenu.remove();
    });

    // Enable text editing on all text elements
    editor.on('component:add', (component) => {
      enableTextEditing(component, editor);
    });

    // Enable editing on initial components
    editor.getWrapper().onAll(component => {
      enableTextEditing(component, editor);
    });

    // Function to enable text editing
    function enableTextEditing(component, editor) {
      const el = component.getEl();
      if (el && (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' ||
                 el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'P' ||
                 el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'A')) {

        component.set('editable', true);

        el.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          const currentText = el.innerText;
          const newText = prompt('Edit text:', currentText);
          if (newText !== null && newText !== currentText) {
            component.components(newText);
            editor.trigger('change:canvasOffset');
          }
        });
      }
    }

    // Listen for right-click on canvas
    editor.on('load', () => {
      setTimeout(() => {
        const canvas = editor.Canvas.getFrameEl();
        const canvasDoc = canvas.contentDocument || canvas.contentWindow.document;

        canvasDoc.addEventListener('contextmenu', (e) => {
          e.preventDefault();

          const target = e.target;
          const component = editor.getWrapper().find(target)[0];

          if (component) {
            editor.select(component);
            showContextMenu(e, component, editor);
          }
        });
      }, 100);
    });

    // Show context menu function
    function showContextMenu(e, component, editor) {
      // Remove existing menu
      const existingMenu = document.getElementById('custom-context-menu');
      if (existingMenu) existingMenu.remove();

      // Create menu
      const menu = document.createElement('div');
      menu.id = 'custom-context-menu';
      menu.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 180px;
        padding: 8px 0;
      `;

      const menuItems = [
        {
          label: 'Delete',
          icon: '🗑️',
          action: () => {
            component.remove();
            menu.remove();
          }
        },
        {
          label: 'Duplicate',
          icon: '📋',
          action: () => {
            const clone = component.clone();
            component.parent().append(clone);
            menu.remove();
          }
        },
        {
          label: 'Move Up',
          icon: '⬆️',
          action: () => {
            const parent = component.parent();
            const index = component.index();
            if (index > 0) {
              parent.append(component, { at: index - 1 });
            }
            menu.remove();
          }
        },
        {
          label: 'Move Down',
          icon: '⬇️',
          action: () => {
            const parent = component.parent();
            const index = component.index();
            const siblings = parent.components();
            if (index < siblings.length - 1) {
              parent.append(component, { at: index + 2 });
            }
            menu.remove();
          }
        },
        {
          label: 'Change Background',
          icon: '🎨',
          action: () => {
            const color = prompt('Enter background color (e.g., #667eea, white, rgb(255,0,0))');
            if (color) {
              component.addStyle({ 'background-color': color });
            }
            menu.remove();
          }
        },
        {
          label: 'Edit Text',
          icon: '✏️',
          action: () => {
            const text = prompt('Enter new text', component.view.el.innerText);
            if (text !== null) {
              component.components(text);
            }
            menu.remove();
          }
        }
      ];

      menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.style.cssText = `
          padding: 10px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #1a1a1a;
          transition: background-color 0.2s;
        `;
        menuItem.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;

        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.backgroundColor = '#f8f9fa';
        });

        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.backgroundColor = 'transparent';
        });

        menuItem.addEventListener('click', item.action);
        menu.appendChild(menuItem);
      });

      document.body.appendChild(menu);

      // Close menu on click outside
      setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        });
      }, 100);
    }

    // Image upload functionality
    editor.on('asset:open', () => {
      const assetManager = editor.AssetManager;

      // Add custom upload button
      const uploadContainer = document.createElement('div');
      uploadContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; border: 2px dashed #e1e4e8; border-radius: 8px; margin: 10px;">
          <input type="file" id="image-upload-input" accept="image/*" style="display: none;" multiple />
          <button id="upload-btn" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
            Upload Images
          </button>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;">or drag and drop images here</p>
        </div>
      `;

      const modalContent = document.querySelector('.gjs-am-assets-cont');
      if (modalContent && !document.getElementById('upload-btn')) {
        modalContent.insertBefore(uploadContainer, modalContent.firstChild);

        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('image-upload-input');

        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
          const files = Array.from(e.target.files);
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
              assetManager.add({
                src: event.target.result,
                name: file.name,
                type: 'image'
              });
            };
            reader.readAsDataURL(file);
          });
        });

        // Drag and drop
        uploadContainer.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadContainer.style.borderColor = '#667eea';
          uploadContainer.style.backgroundColor = '#f8f9fa';
        });

        uploadContainer.addEventListener('dragleave', () => {
          uploadContainer.style.borderColor = '#e1e4e8';
          uploadContainer.style.backgroundColor = 'transparent';
        });

        uploadContainer.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadContainer.style.borderColor = '#e1e4e8';
          uploadContainer.style.backgroundColor = 'transparent';

          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
              assetManager.add({
                src: event.target.result,
                name: file.name,
                type: 'image'
              });
            };
            reader.readAsDataURL(file);
          });
        });
      }
    });

    // Add image block that opens asset manager
    editor.BlockManager.add('image-upload', {
      label: 'Image',
      category: 'Basic',
      content: {
        type: 'image',
        activeOnRender: 1
      },
      attributes: { class: 'fa fa-image' }
    });

    // Custom blocks for CV
    editor.BlockManager.add('cv-hero', {
      label: 'Hero Section',
      category: 'CV Components',
      content: `
        <section style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h1 style="font-size: 48px; margin-bottom: 20px;">Your Name</h1>
          <p style="font-size: 20px; margin-bottom: 30px;">Your Title / Role</p>
          <a href="#contact" style="padding: 15px 30px; background: white; color: #667eea; text-decoration: none; border-radius: 5px; font-weight: bold;">Get In Touch</a>
        </section>
      `,
      attributes: { class: 'fa fa-header' }
    });

    editor.BlockManager.add('cv-experience', {
      label: 'Experience Card',
      category: 'CV Components',
      content: `
        <div style="padding: 24px; background: white; border-left: 4px solid #667eea; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 8px 0; font-size: 20px;">Position Title</h3>
          <div style="color: #667eea; font-weight: 600; margin-bottom: 8px;">Company Name</div>
          <div style="color: #666; font-size: 14px; margin-bottom: 12px;">Jan 2023 - Present</div>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">Description of your role and achievements...</p>
        </div>
      `,
      attributes: { class: 'fa fa-briefcase' }
    });

    editor.BlockManager.add('cv-project', {
      label: 'Project Card',
      category: 'CV Components',
      content: `
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px; max-width: 400px;">
          <img src="https://via.placeholder.com/400x200" style="width: 100%; height: 200px; object-fit: cover;" />
          <div style="padding: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 20px;">Project Name</h3>
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px;">Project description goes here...</p>
            <div style="display: flex; gap: 12px;">
              <a href="#" style="padding: 8px 16px; background: #333; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">GitHub</a>
              <a href="#" style="padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">Live Demo</a>
            </div>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-rocket' }
    });

    editor.BlockManager.add('cv-skills', {
      label: 'Skills Grid',
      category: 'CV Components',
      content: `
        <section style="padding: 60px 20px; background: #f8f9fa;">
          <h2 style="font-size: 32px; text-align: center; margin-bottom: 30px;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; max-width: 1000px; margin: 0 auto;">
            <span style="padding: 10px 20px; background: #667eea; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">JavaScript</span>
            <span style="padding: 10px 20px; background: #667eea; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">React</span>
            <span style="padding: 10px 20px; background: #667eea; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">Node.js</span>
            <span style="padding: 10px 20px; background: #667eea; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">Python</span>
            <span style="padding: 10px 20px; background: #667eea; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">SQL</span>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-star' }
    });

    editor.BlockManager.add('cv-contact', {
      label: 'Contact Section',
      category: 'CV Components',
      content: `
        <section style="padding: 80px 20px; background: #1a1a1a; color: white;">
          <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 36px; margin-bottom: 20px;">Get In Touch</h2>
            <p style="font-size: 18px; margin-bottom: 40px; color: #ccc;">Let's work together on your next project</p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
              <a href="mailto:you@email.com" style="padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">📧 Email</a>
              <a href="https://linkedin.com" style="padding: 12px 24px; background: #0077b5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">💼 LinkedIn</a>
              <a href="https://github.com" style="padding: 12px 24px; background: #333; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">💻 GitHub</a>
            </div>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-envelope' }
    });

    editor.BlockManager.add('cv-education', {
      label: 'Education Card',
      category: 'CV Components',
      content: `
        <div style="padding: 24px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #1a1a1a;">Degree Name</h3>
          <div style="color: #667eea; font-weight: 600; margin-bottom: 8px;">University Name</div>
          <div style="color: #666; font-size: 14px; margin-bottom: 12px;">2019 - 2023</div>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">Major or relevant coursework...</p>
        </div>
      `,
      attributes: { class: 'fa fa-graduation-cap' }
    });

    // Export command
    editor.Commands.add('export-template', {
      run(editor) {
        const html = editor.getHtml();
        const css = editor.getCss();
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'portfolio.html';
        link.click();
        URL.revokeObjectURL(url);
      }
    });

    // Store editor instance for access from App.jsx
    window.grapesJSEditor = editor;

    return () => {
      editor.destroy();
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', background: '#fafbfc' }}>
      {/* Left Sidebar - Blocks */}
      <div style={{
        width: '300px',
        background: '#ffffff',
        borderRight: '1px solid #e1e4e8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #e1e4e8',
          background: '#ffffff'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#0f172a',
            letterSpacing: '-0.02em'
          }}>
            Components
          </h3>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#64748b',
            lineHeight: '1.5'
          }}>
            Drag components to build your design
          </p>
        </div>
        <div id="blocks" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#ffffff'
        }}></div>
      </div>

      {/* Main Editor */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#fafbfc'
      }}>
        <div className="panel__basic-actions" style={{
          padding: '12px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e1e4e8',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center'
        }}></div>
        <div style={{
          flex: 1,
          padding: '24px',
          overflow: 'auto'
        }}>
          <div ref={editorRef} style={{
            height: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}></div>
        </div>
      </div>

      {/* Right Sidebar - Layers, Styles, Traits */}
      <div style={{
        width: '320px',
        background: '#ffffff',
        borderLeft: '1px solid #e1e4e8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Layers */}
        <div style={{
          borderBottom: '1px solid #e1e4e8',
          maxHeight: '35%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '200px'
        }}>
          <div style={{
            padding: '18px 20px',
            background: '#ffffff',
            fontWeight: '600',
            fontSize: '15px',
            color: '#0f172a',
            borderBottom: '1px solid #e1e4e8'
          }}>
            Layers
          </div>
          <div className="layers-container" style={{
            flex: 1,
            overflowY: 'auto',
            background: '#fafbfc'
          }}></div>
        </div>

        {/* Styles */}
        <div style={{
          borderBottom: '1px solid #e1e4e8',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: '250px'
        }}>
          <div style={{
            padding: '18px 20px',
            background: '#ffffff',
            fontWeight: '600',
            fontSize: '15px',
            color: '#0f172a',
            borderBottom: '1px solid #e1e4e8'
          }}>
            Styles
          </div>
          <div className="styles-container" style={{
            flex: 1,
            overflowY: 'auto',
            background: '#fafbfc'
          }}></div>
        </div>

        {/* Traits */}
        <div style={{
          maxHeight: '30%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '150px'
        }}>
          <div style={{
            padding: '18px 20px',
            background: '#ffffff',
            fontWeight: '600',
            fontSize: '15px',
            color: '#0f172a',
            borderBottom: '1px solid #e1e4e8'
          }}>
            Settings
          </div>
          <div className="traits-container" style={{
            flex: 1,
            overflowY: 'auto',
            background: '#fafbfc'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default GrapesJSEditor;
