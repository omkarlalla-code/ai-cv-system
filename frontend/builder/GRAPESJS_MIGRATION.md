# Migrating to GrapesJS

## Why GrapesJS?

**GrapesJS** is the most mature, feature-rich open-source web builder:
- ✅ 18k+ GitHub stars
- ✅ Used by 1000+ companies
- ✅ All features we want built-in
- ✅ Better UX than Puck
- ✅ Free & open source
- ✅ Active community

## Features Out-of-the-Box

### ✅ Already Has:
- Drag-and-drop components
- Click-to-edit text (inline)
- Resize elements (drag corners)
- Visual CSS editor
- Responsive design modes
- Layer/block manager
- Component library
- Style manager
- Export HTML/CSS
- Asset manager
- Canvas zoom/pan

### 🎨 What You Get:
- **PowerPoint-like editing** ✓
- **Resize elements** ✓
- **Inline text editing** ✓
- **Component library** ✓
- **Mobile preview** ✓
- **No custom code needed** ✓

## Installation

### 1. Install Dependencies

```bash
cd frontend/builder
npm install grapesjs grapesjs-preset-webpage
```

### 2. Create GrapesJS Component

**File**: `src/GrapesJSEditor.jsx`

```jsx
import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

const GrapesJSEditor = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = grapesjs.init({
      container: editorRef.current,
      height: '100vh',
      width: '100%',

      // Pre-built webpage blocks
      plugins: [gjsPresetWebpage],
      pluginsOpts: {
        'gjs-preset-webpage': {
          blocksBasicOpts: {
            blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
            flexGrid: 1,
          },
          blocks: ['link-block', 'quote', 'text-basic'],
        }
      },

      // Storage
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
      },

      // Canvas
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css?family=Roboto:300,400,700',
        ],
      },

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
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<i class="fa fa-clone"></i>',
                command: 'sw-visibility',
              }, {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fa fa-code"></i>',
                command: 'export-template',
              }, {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fa fa-file-code-o"></i>',
                context: 'show-json',
                command(editor) {
                  editor.Modal.setTitle('Components JSON')
                    .setContent(`<textarea style="width:100%; height: 250px;">
                      ${JSON.stringify(editor.getComponents())}
                    </textarea>`)
                    .open();
                },
              }
            ],
          }
        ]
      },
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

    // Export command
    editor.Commands.add('export-template', {
      run(editor) {
        const html = editor.getHtml();
        const css = editor.getCss();
        const fullHtml = `
<!DOCTYPE html>
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

    return () => {
      editor.destroy();
    };
  }, []);

  return (
    <div>
      <div className="panel__basic-actions" style={{ padding: '10px', background: '#444', color: 'white' }}></div>
      <div ref={editorRef}></div>
    </div>
  );
};

export default GrapesJSEditor;
```

### 3. Update App.jsx

```jsx
import React from 'react';
import GrapesJSEditor from './GrapesJSEditor';
import './App.css';

function App() {
  return (
    <div className="app">
      <GrapesJSEditor />
    </div>
  );
}

export default App;
```

### 4. Update App.css

```css
.app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  margin: 0;
  padding: 0;
}
```

## Features Comparison

| Feature | Puck | GrapesJS | Winner |
|---------|------|----------|--------|
| Drag & Drop | ✅ | ✅ | Tie |
| Click-to-edit text | ❌ (need custom) | ✅ Built-in | **GrapesJS** |
| Resize elements | ❌ (need custom) | ✅ Built-in | **GrapesJS** |
| Visual CSS editor | ❌ | ✅ | **GrapesJS** |
| Responsive modes | ❌ | ✅ | **GrapesJS** |
| Component library | ✅ | ✅ | Tie |
| Export HTML/CSS | ✅ | ✅ | Tie |
| Layer manager | ❌ | ✅ | **GrapesJS** |
| Undo/Redo | ❌ | ✅ | **GrapesJS** |
| Learning curve | Medium | Easy | **GrapesJS** |
| Customization | High | Very High | **GrapesJS** |

## Migration Steps

### Step 1: Install GrapesJS
```bash
npm install grapesjs grapesjs-preset-webpage
```

### Step 2: Test GrapesJS
Create the component above and test it

### Step 3: Migrate Components
Convert Puck components to GrapesJS blocks

### Step 4: Update Backend
Backend stays the same (screenshot → HTML)

### Step 5: Deploy
Replace Puck with GrapesJS

## Plugins Available

GrapesJS has tons of plugins:

- **grapesjs-preset-webpage** - Webpage blocks
- **grapesjs-blocks-basic** - Basic blocks
- **grapesjs-plugin-forms** - Form builder
- **grapesjs-navbar** - Navbar builder
- **grapesjs-component-countdown** - Countdown timer
- **grapesjs-tabs** - Tab component
- **grapesjs-tooltip** - Tooltips
- **grapesjs-custom-code** - Custom HTML/CSS
- **grapesjs-parser-postcss** - PostCSS support
- **grapesjs-tui-image-editor** - Image editing
- **grapesjs-typed** - Typing animation

## AI Integration

Same as before - just export HTML and send to Claude:

```javascript
const html = editor.getHtml();
const css = editor.getCss();

// Convert to full page
const fullHtml = `<!DOCTYPE html>...`;

// Send to backend for AI generation (same as before)
```

## Advantages

1. **Zero custom code** for editing features
2. **Professional UI** out of the box
3. **Active community** + plugins
4. **Better UX** than Puck
5. **Mature & stable**
6. **Free forever**

## Disadvantages

1. Need to learn GrapesJS API
2. More opinionated than Puck
3. Larger bundle size

## Recommendation

**Switch to GrapesJS** if you want:
- ✅ Faster development
- ✅ Better UX
- ✅ All features built-in
- ✅ Professional result

**Keep Puck** if you want:
- ✅ Full control
- ✅ Smaller bundle
- ✅ React-native approach

## Next Steps

1. Try the GrapesJS demo: https://grapesjs.com/demo.html
2. Install and test locally
3. Compare with current Puck setup
4. Decide which to use

---

**My recommendation: Go with GrapesJS. It has everything you built + more, all built-in and battle-tested.**
