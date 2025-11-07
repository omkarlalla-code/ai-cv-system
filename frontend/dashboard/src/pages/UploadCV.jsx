import React, { useState, useRef } from 'react';
import './UploadCV.css';

const UploadCV = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const templates = [
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple portfolio' },
    { id: 'professional', name: 'Professional', description: 'Corporate and elegant' },
    { id: 'creative', name: 'Creative', description: 'Bold and artistic' },
    { id: 'developer', name: 'Developer', description: 'Technical and modern' },
    { id: 'academic', name: 'Academic', description: 'Research-focused layout' },
    { id: 'executive', name: 'Executive', description: 'Leadership-oriented' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Start parsing
      setParsing(true);
      await parseCV(data.uploadId);

    } catch (err) {
      setError(err.message || 'Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const parseCV = async (uploadId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/parse-cv/${uploadId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Parsing failed');
      }

      const data = await response.json();
      setParsedData(data);
      setParsing(false);
    } catch (err) {
      setError(err.message || 'Failed to parse CV');
      setParsing(false);
    }
  };

  const handleGenerateWebsite = async () => {
    if (!parsedData || !selectedTemplate) {
      setError('Please select a template');
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData: parsedData,
          templateId: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();

      // Redirect to builder with the new website after generation
      // The builder will load the generated website content
      window.location.href = `/builder/index.html?project=${data.websiteId}`;

    } catch (err) {
      setError(err.message || 'Failed to generate website');
      setGenerating(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedData(null);
    setSelectedTemplate(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Upload CV</h1>
          <p className="page-subtitle">Upload your CV and generate a professional website</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="steps-indicator">
        <div className={`step ${file ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Upload CV</div>
        </div>
        <div className="step-divider"></div>
        <div className={`step ${parsedData ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Review Data</div>
        </div>
        <div className="step-divider"></div>
        <div className={`step ${selectedTemplate ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Choose Template</div>
        </div>
        <div className="step-divider"></div>
        <div className="step">
          <div className="step-number">4</div>
          <div className="step-label">Generate</div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠</span>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn-close-error">×</button>
        </div>
      )}

      {/* Step 1: Upload */}
      {!file && (
        <div className="upload-section">
          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="dropzone-icon">↑</div>
            <h3>Drop your CV here</h3>
            <p>or click to browse</p>
            <div className="file-formats">
              <span>PDF</span>
              <span>DOC</span>
              <span>DOCX</span>
              <span>TXT</span>
            </div>
            <p className="file-size-limit">Max file size: 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Step 2: File selected, ready to upload */}
      {file && !parsedData && (
        <div className="file-preview-section">
          <div className="file-preview-card">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <h3>{file.name}</h3>
              <p>{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <button onClick={resetUpload} className="btn-remove">×</button>
          </div>

          <div className="upload-actions">
            <button onClick={resetUpload} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={uploading || parsing}
            >
              {uploading ? 'Uploading...' : parsing ? 'Parsing...' : 'Upload & Parse'}
            </button>
          </div>

          {(uploading || parsing) && (
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="progress-text">
                {uploading ? 'Uploading your CV...' : 'AI is parsing your CV...'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Parsed data review */}
      {parsedData && (
        <>
          <div className="parsed-data-section">
            <div className="section-title-bar">
              <h2>Parsed CV Data</h2>
              <button onClick={resetUpload} className="btn btn-outline btn-small">
                Upload Different CV
              </button>
            </div>

            <div className="parsed-data-grid">
              {parsedData.name && (
                <div className="data-card">
                  <label>Name</label>
                  <p>{parsedData.name}</p>
                </div>
              )}

              {parsedData.email && (
                <div className="data-card">
                  <label>Email</label>
                  <p>{parsedData.email}</p>
                </div>
              )}

              {parsedData.phone && (
                <div className="data-card">
                  <label>Phone</label>
                  <p>{parsedData.phone}</p>
                </div>
              )}

              {parsedData.location && (
                <div className="data-card">
                  <label>Location</label>
                  <p>{parsedData.location}</p>
                </div>
              )}

              {parsedData.summary && (
                <div className="data-card full-width">
                  <label>Professional Summary</label>
                  <p>{parsedData.summary}</p>
                </div>
              )}

              {parsedData.experience && parsedData.experience.length > 0 && (
                <div className="data-card full-width">
                  <label>Work Experience ({parsedData.experience.length} positions)</label>
                  <div className="experience-list">
                    {parsedData.experience.slice(0, 3).map((exp, idx) => (
                      <div key={idx} className="experience-item">
                        <h4>{exp.title || 'Position'}</h4>
                        <p className="company">{exp.company || 'Company'}</p>
                        <p className="dates">{exp.dates || 'Dates'}</p>
                      </div>
                    ))}
                    {parsedData.experience.length > 3 && (
                      <p className="more-items">+{parsedData.experience.length - 3} more...</p>
                    )}
                  </div>
                </div>
              )}

              {parsedData.education && parsedData.education.length > 0 && (
                <div className="data-card full-width">
                  <label>Education ({parsedData.education.length} items)</label>
                  <div className="education-list">
                    {parsedData.education.map((edu, idx) => (
                      <div key={idx} className="education-item">
                        <h4>{edu.degree || 'Degree'}</h4>
                        <p>{edu.institution || 'Institution'}</p>
                        <p className="dates">{edu.dates || 'Dates'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedData.skills && parsedData.skills.length > 0 && (
                <div className="data-card full-width">
                  <label>Skills</label>
                  <div className="skills-tags">
                    {parsedData.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Template selection */}
          <div className="template-selection-section">
            <h2>Choose a Template</h2>
            <p className="section-subtitle">Select a design for your website. You can customize it later in the builder.</p>

            <div className="templates-grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="template-preview">
                    <div className="preview-placeholder">{template.name[0]}</div>
                  </div>
                  <div className="template-info">
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>

            <div className="generate-actions">
              <button
                onClick={handleGenerateWebsite}
                className="btn btn-primary btn-large"
                disabled={!selectedTemplate || generating}
              >
                {generating ? '⏳ Generating Website...' : 'Generate Website & Open Builder →'}
              </button>
              <p className="generate-note">
                {generating
                  ? 'Please wait while we generate your website with AI...'
                  : 'After generation, the GrapeJS builder will open automatically for customization'
                }
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadCV;
