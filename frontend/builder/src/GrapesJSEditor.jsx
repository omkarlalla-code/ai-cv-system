import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import './GrapesJSEditor.css';

/**
 * GrapeJS Editor - Official Demo Style (Dark Mode)
 * Mimics https://grapesjs.com/demo.html exactly
 */
const GrapesJSEditor = ({ projectId, initialData, onSave }) => {
  const editorRef = useRef(null);
  const editorInstance = useRef(null);

  useEffect(() => {
    if (!editorRef.current || editorInstance.current) return;

    // Initialize GrapeJS with official demo configuration
    const editor = grapesjs.init({
      container: editorRef.current,
      height: '100vh',
      width: 'auto',

      // Use official webpage preset
      plugins: [gjsPresetWebpage],
      pluginsOpts: {
        'gjs-preset-webpage': {
          modalImportTitle: 'Import Template',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
          modalImportContent: function(editor) {
            return editor.getHtml() + '<style>'+editor.getCss()+'</style>'
          },
        }
      },

      // Storage - will integrate with your backend
      storageManager: {
        type: 'remote',
        stepsBeforeSave: 3,
        autosave: true,
        autoload: true,

        // Custom storage handlers
        urlStore: `/api/builder/projects/${projectId}/save`,
        urlLoad: `/api/builder/projects/${projectId}/load`,

        // Headers for auth
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },

        // Custom store/load logic
        async store(data) {
          if (onSave) {
            await onSave(data);
          }
          return data;
        },

        async load() {
          return initialData || {};
        }
      },

      // Canvas settings
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ],
        scripts: []
      },

      // Device manager for responsive preview
      deviceManager: {
        devices: [{
          name: 'Desktop',
          width: '',
        }, {
          name: 'Tablet',
          width: '768px',
          widthMedia: '992px',
        }, {
          name: 'Mobile',
          width: '320px',
          widthMedia: '480px',
        }]
      },

      // Block manager with CV-specific blocks
      blockManager: {
        blocks: [
          {
            id: 'section',
            label: '<div><svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"></path></svg><div>Section</div></div>',
            category: 'Basic',
            content: '<section style="padding:50px 20px;"><h1>Insert your title here</h1><p>Insert your text here</p></section>'
          },
          {
            id: 'text',
            label: '<div><svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"></path></svg><div>Text</div></div>',
            category: 'Basic',
            content: '<div style="padding:10px;">Insert your text here</div>'
          },
          {
            id: 'image',
            label: '<div><svg viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z"></path></svg><div>Image</div></div>',
            category: 'Basic',
            activate: true,
            content: { type: 'image' }
          },
          {
            id: 'video',
            label: '<div><svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"></path></svg><div>Video</div></div>',
            category: 'Basic',
            content: { type: 'video' }
          },
          {
            id: 'map',
            label: '<div><svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z"></path></svg><div>Map</div></div>',
            category: 'Basic',
            content: { type: 'map' }
          },
          {
            id: 'link',
            label: '<div><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"></path></svg><div>Link</div></div>',
            category: 'Basic',
            content: { type: 'link', content: 'Link' }
          },
        ]
      },

      // Layer manager
      layerManager: {
        appendTo: '#layers-container'
      },

      // Panels configuration (official demo style)
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15,21H9V18H15M12,2A9,9 0 0,0 3,11A9,9 0 0,0 12,20A9,9 0 0,0 21,11A9,9 0 0,0 12,2M12,4A7,7 0 0,1 19,11A7,7 0 0,1 12,18A7,7 0 0,1 5,11A7,7 0 0,1 12,4Z"></path></svg>',
                command: 'sw-visibility',
                context: 'sw-visibility',
                attributes: { title: 'View components' },
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z"></path></svg>',
                command: 'export-template',
                attributes: { title: 'View code' },
              },
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z"></path></svg>',
                context: 'show-json',
                command(editor) {
                  editor.Modal.setTitle('Components JSON')
                    .setContent(`<textarea style="width:100%; height: 250px;">
                      ${JSON.stringify(editor.getComponents())}
                    </textarea>`)
                    .open();
                },
                attributes: { title: 'Show JSON' },
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"></path></svg>',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-tablet',
                label: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z"></path></svg>',
                command: 'set-device-tablet',
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"></path></svg>',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
        ],
      },

      // Style manager
      styleManager: {
        appendTo: '#styles-container',
        sectors: [
          {
            name: 'General',
            open: false,
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
          },
          {
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
          },
          {
            name: 'Decorations',
            open: false,
            buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'],
          },
          {
            name: 'Extra',
            open: false,
            buildProps: ['transition', 'perspective', 'transform'],
          }
        ]
      },

      // Trait manager
      traitManager: {
        appendTo: '#traits-container'
      },
    });

    // Commands
    editor.Commands.add('set-device-desktop', {
      run: editor => editor.setDevice('Desktop')
    });
    editor.Commands.add('set-device-tablet', {
      run: editor => editor.setDevice('Tablet')
    });
    editor.Commands.add('set-device-mobile', {
      run: editor => editor.setDevice('Mobile')
    });

    // Export template command
    editor.Commands.add('export-template', {
      run(editor, sender) {
        sender && sender.set('active', 0);
        const html = editor.getHtml();
        const css = editor.getCss();
        editor.Modal.setTitle('Code Export')
          .setContent(`
            <div style="padding: 20px;">
              <h3 style="margin-top:0">HTML</h3>
              <textarea readonly style="width:100%; height: 200px; font-family: monospace; font-size: 12px; padding: 10px; background: #282828; color: #f8f8f2; border: 1px solid #444;">${html}</textarea>
              <h3 style="margin-top:20px">CSS</h3>
              <textarea readonly style="width:100%; height: 200px; font-family: monospace; font-size: 12px; padding: 10px; background: #282828; color: #f8f8f2; border: 1px solid #444;">${css}</textarea>
            </div>
          `)
          .open();
      }
    });

    // Load initial data if provided
    if (initialData) {
      if (initialData.html) editor.setComponents(initialData.html);
      if (initialData.css) editor.setStyle(initialData.css);
    }

    // Store editor instance
    editorInstance.current = editor;
    window.grapesjsEditor = editor; // For external access

    // Cleanup
    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [projectId, initialData, onSave]);

  return (
    <div className="grapesjs-editor-wrapper">
      {/* Top Bar */}
      <div className="grapesjs-topbar">
        <div className="panel__basic-actions"></div>
        <div className="panel__devices"></div>
      </div>

      {/* Main Editor Area */}
      <div className="grapesjs-main">
        {/* Left Sidebar - Blocks */}
        <div className="grapesjs-sidebar grapesjs-sidebar-left">
          <div className="grapesjs-sidebar-header">
            <div className="grapesjs-sidebar-title">Blocks</div>
          </div>
          <div id="blocks" className="grapesjs-blocks-container"></div>
        </div>

        {/* Canvas */}
        <div className="grapesjs-canvas-wrapper">
          <div ref={editorRef} id="gjs"></div>
        </div>

        {/* Right Sidebar - Layers, Styles, Traits */}
        <div className="grapesjs-sidebar grapesjs-sidebar-right">
          <div className="grapesjs-tabs">
            <div className="grapesjs-tab grapesjs-tab-active" data-tab="styles">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"></path></svg>
            </div>
            <div className="grapesjs-tab" data-tab="traits">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path></svg>
            </div>
            <div className="grapesjs-tab" data-tab="layers">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z"></path></svg>
            </div>
          </div>

          <div className="grapesjs-tab-content" data-content="styles">
            <div id="styles-container"></div>
          </div>
          <div className="grapesjs-tab-content" data-content="traits" style="display:none;">
            <div id="traits-container"></div>
          </div>
          <div className="grapesjs-tab-content" data-content="layers" style="display:none;">
            <div id="layers-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrapesJSEditor;
