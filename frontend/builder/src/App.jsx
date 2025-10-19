import React, { useState } from 'react';
import GrapesJSEditor from './GrapesJSEditor';
import { toPng } from 'html-to-image';
import './App.css';


function App() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWebsite = async () => {
    setIsGenerating(true);
    try {
      const editor = window.grapesJSEditor;
      if (!editor) {
        alert('Editor not initialized');
        setIsGenerating(false);
        return;
      }

      // Get the canvas iframe content
      const iframe = editor.Canvas.getFrameEl();
      const canvasBody = iframe.contentDocument.body;

      const dataUrl = await toPng(canvasBody, {
        quality: 0.95,
        pixelRatio: 2,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('screenshot', blob, 'design.png');
      formData.append('polotnoState', JSON.stringify({
        html: editor.getHtml(),
        css: editor.getCss(),
      }));

      const result = await fetch('http://localhost:3000/api/builder-v2/generate-website', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) throw new Error('Failed to generate');

      const responseData = await result.json();

      const htmlBlob = new Blob([responseData.html], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'portfolio.html';
      link.click();
      URL.revokeObjectURL(url);

      alert('Website generated and downloaded!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate. Make sure backend is running on port 3000 with ANTHROPIC_API_KEY set.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportHTML = () => {
    const editor = window.grapesJSEditor;
    if (!editor) {
      alert('Editor not initialized');
      return;
    }

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
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>BetterCV Builder</h1>
        <div className="header-actions">
          <button onClick={handleExportHTML} className="btn btn-secondary">
            Export HTML
          </button>

          <button
            onClick={handleGenerateWebsite}
            className="btn btn-primary"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'AI Generate Website'}
          </button>
        </div>
      </header>

      <div className="builder-container">
        <GrapesJSEditor />
      </div>
    </div>
  );
}

export default App;
