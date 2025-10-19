import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ value, onChange, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for now (in production, upload to S3/Cloudflare)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        onChange(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-wrapper">
      <div className="image-upload-label">{label}</div>

      {/* Mode Toggle */}
      <div className="upload-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
          onClick={() => setUploadMode('url')}
        >
          🔗 URL
        </button>
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
          onClick={() => setUploadMode('file')}
        >
          📁 Upload
        </button>
      </div>

      {/* Current Image Preview */}
      {value && (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={value} alt="Preview" />
          </div>
          <button
            type="button"
            className="remove-image-btn"
            onClick={handleRemove}
            title="Remove image"
          >
            🗑️ Remove
          </button>
        </div>
      )}

      {/* URL Input Mode */}
      {uploadMode === 'url' && (
        <div className="url-input-container">
          <input
            type="text"
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit();
              }
            }}
            className="url-input"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="url-submit-btn"
            disabled={!urlInput.trim()}
          >
            ✓
          </button>
        </div>
      )}

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div className="file-upload-container">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="upload-btn"
            disabled={isUploading}
          >
            {isUploading ? (
              <>⏳ Uploading...</>
            ) : (
              <>📤 Choose Image</>
            )}
          </button>
          <div className="upload-hint">
            Max 5MB • JPG, PNG, GIF, WebP
          </div>
        </div>
      )}

      {/* Unsplash Search (Optional) */}
      <div className="quick-links">
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="quick-link"
        >
          🖼️ Find free images on Unsplash
        </a>
      </div>
    </div>
  );
};

export default ImageUpload;
