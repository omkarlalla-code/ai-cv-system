import React, { useEffect, useRef, useState } from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';
import { unstable_setAnimationsEnabled, unstable_setRemoveBackgroundEnabled } from 'polotno/config';
import '@blueprintjs/core/lib/css/blueprint.css';
import './PolotnoBuilder.css';

// Polotno configuration
unstable_setAnimationsEnabled(true);

// Create store outside component to persist state
const store = createStore({
  key: 'nFA5H9elEytDyPyvKL7T', // Free key for development (public)
  showCredit: false
});

// Set initial page size (1440px desktop)
store.addPage({
  width: 1440,
  height: 900,
  background: 'white'
});

function PolotnoBuilder() {
  const [projectName, setProjectName] = useState('Untitled Portfolio');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState([]);
  const saveTimeoutRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    const handleChange = () => {
      // Debounce auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 2000);
    };

    store.on('change', handleChange);

    return () => {
      store.off('change', handleChange);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const autoSave = async () => {
    const state = store.toJSON();

    // Save to localStorage for now (will move to DB)
    localStorage.setItem('polotno-autosave', JSON.stringify({
      projectName,
      state,
      timestamp: new Date().toISOString()
    }));

    console.log('Auto-saved design');
  };

  const handleSaveVersion = async () => {
    setIsSaving(true);

    try {
      const state = store.toJSON();

      // Generate screenshot
      const url = await store.toDataURL();

      // For now, save to localStorage (will move to database)
      const version = {
        id: Date.now(),
        projectName,
        state,
        screenshot: url,
        timestamp: new Date().toISOString(),
        commitMessage: `Version ${versions.length + 1}`
      };

      const newVersions = [...versions, version];
      setVersions(newVersions);
      localStorage.setItem('polotno-versions', JSON.stringify(newVersions));

      alert('Version saved successfully!');
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Failed to save version');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateWebsite = async () => {
    setIsGenerating(true);

    try {
      // Save current state first
      await handleSaveVersion();

      // Get store state and screenshot
      const state = store.toJSON();
      const screenshot = await store.toDataURL();

      // Convert base64 to blob
      const response = await fetch(screenshot);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('screenshot', blob, 'design.png');
      formData.append('data', JSON.stringify(state));
      formData.append('projectName', projectName);

      // Call backend API
      const result = await fetch('/api/builder/generate-code', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        throw new Error('Failed to generate website');
      }

      const responseData = await result.json();

      // Download HTML
      const htmlBlob = new Blob([responseData.html], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.html`;
      link.click();
      URL.revokeObjectURL(url);

      alert('Website generated and downloaded!');
    } catch (error) {
      console.error('Error generating website:', error);
      alert('Failed to generate website. Make sure backend is running and API key is configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadVersion = (version) => {
    store.loadJSON(version.state);
    setProjectName(version.projectName);
    alert('Version restored!');
  };

  const handleExportJSON = () => {
    const state = store.toJSON();
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}-design.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Load auto-save on mount
  useEffect(() => {
    const saved = localStorage.getItem('polotno-autosave');
    if (saved) {
      try {
        const { projectName: savedName, state } = JSON.parse(saved);
        store.loadJSON(state);
        setProjectName(savedName);
        console.log('Loaded auto-saved design');
      } catch (error) {
        console.error('Error loading auto-save:', error);
      }
    }

    // Load versions
    const savedVersions = localStorage.getItem('polotno-versions');
    if (savedVersions) {
      setVersions(JSON.parse(savedVersions));
    }
  }, []);

  return (
    <div className="polotno-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="header-left">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="project-name-input"
            placeholder="Project Name"
          />
          <span className="auto-save-indicator">Auto-saved</span>
        </div>

        <div className="header-actions">
          <button
            onClick={handleSaveVersion}
            className="btn btn-secondary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : '💾 Save Version'}
          </button>

          <button
            onClick={handleExportJSON}
            className="btn btn-secondary"
          >
            📥 Export JSON
          </button>

          <button
            onClick={handleGenerateWebsite}
            className="btn btn-primary"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : '🚀 Generate Website'}
          </button>
        </div>
      </div>

      {/* Version History Sidebar */}
      {versions.length > 0 && (
        <div className="version-sidebar">
          <h3>Version History</h3>
          <div className="version-list">
            {versions.map((version) => (
              <div
                key={version.id}
                className="version-item"
                onClick={() => handleLoadVersion(version)}
              >
                <img src={version.screenshot} alt="Version preview" />
                <div className="version-info">
                  <p className="version-message">{version.commitMessage}</p>
                  <p className="version-time">
                    {new Date(version.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Polotno Editor */}
      <div className="polotno-container">
        <PolotnoContainer style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
          <SidePanelWrap>
            <SidePanel store={store} />
          </SidePanelWrap>

          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace store={store} />
            <ZoomButtons store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
    </div>
  );
}

export default PolotnoBuilder;
