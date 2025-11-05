import React, { useState, useEffect } from 'react';
import GrapesJSEditor from './GrapesJSEditor';
import './App.css';

/**
 * Builder App - Wrapper for GrapeJS Editor
 * Handles project loading and saving
 */
function App() {
  const [projectId, setProjectId] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get project ID from URL params
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('project') || params.get('id');

    if (pid) {
      setProjectId(pid);
      loadProject(pid);
    } else {
      // No project ID, start with empty canvas
      setLoading(false);
    }
  }, []);

  const loadProject = async (pid) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/builder/projects/${pid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInitialData(data);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    if (!projectId) {
      console.warn('No project ID, cannot save');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/builder/projects/${projectId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <GrapesJSEditor
        projectId={projectId}
        initialData={initialData}
        onSave={handleSave}
      />
    </div>
  );
}

export default App;
