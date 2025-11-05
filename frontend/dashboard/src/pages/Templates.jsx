import React, { useState, useEffect } from 'react';
import './Templates.css';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [myTemplates, setMyTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('community'); // community or mine
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [publishForm, setPublishForm] = useState({
    name: '',
    description: '',
    category: 'minimal',
    tags: ''
  });

  const categories = [
    'all',
    'minimal',
    'professional',
    'creative',
    'developer',
    'academic',
    'executive'
  ];

  useEffect(() => {
    fetchTemplates();
    fetchMyTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTemplates = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMyTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch my templates:', error);
    }
  };

  const handleUseTemplate = async (templateId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/templates/use', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/builder/index.html?project=${data.websiteId}`;
      }
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const handlePreviewTemplate = (templateId) => {
    window.open(`/templates/preview/${templateId}`, '_blank');
  };

  const openPublishModal = () => {
    setPublishModalOpen(true);
  };

  const handlePublishTemplate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/templates/publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: selectedWebsite,
          ...publishForm,
          tags: publishForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        setPublishModalOpen(false);
        setPublishForm({ name: '', description: '', category: 'minimal', tags: '' });
        fetchMyTemplates();
      }
    } catch (error) {
      console.error('Failed to publish template:', error);
    }
  };

  const handleUnpublishTemplate = async (templateId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/templates/${templateId}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        fetchMyTemplates();
      }
    } catch (error) {
      console.error('Failed to unpublish template:', error);
    }
  };

  const getFilteredTemplates = () => {
    const list = activeTab === 'community' ? templates : myTemplates;

    return list.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading templates...</div>
      </div>
    );
  }

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Templates</h1>
          <p className="page-subtitle">Browse and use community templates, or publish your own</p>
        </div>
        <button onClick={openPublishModal} className="btn btn-primary">
          + Publish Template
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Community Templates
          <span className="tab-count">{templates.length}</span>
        </button>
        <button
          className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          My Templates
          <span className="tab-count">{myTemplates.length}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">▦</div>
          <h3>No templates found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-preview">
                <div className="preview-placeholder">
                  {template.name?.[0]?.toUpperCase() || 'T'}
                </div>
              </div>

              <div className="template-info">
                <div className="template-header">
                  <h3>{template.name}</h3>
                  <span className="template-category">{template.category}</span>
                </div>

                {template.description && (
                  <p className="template-description">{template.description}</p>
                )}

                {template.tags && template.tags.length > 0 && (
                  <div className="template-tags">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="template-meta">
                  <span className="meta-item">
                    <span className="meta-icon">◉</span>
                    {template.uses || 0} uses
                  </span>
                  {template.author && (
                    <span className="meta-item">
                      <span className="meta-icon">◆</span>
                      by {template.author}
                    </span>
                  )}
                </div>

                <div className="template-actions">
                  {activeTab === 'community' ? (
                    <>
                      <button
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="action-btn"
                      >
                        ◉ Preview
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="action-btn primary"
                      >
                        Use Template →
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="action-btn"
                      >
                        ◉ Preview
                      </button>
                      <button
                        onClick={() => handleUnpublishTemplate(template.id)}
                        className="action-btn"
                      >
                        ◼ Unpublish
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Template Modal */}
      {publishModalOpen && (
        <div className="modal-overlay" onClick={() => setPublishModalOpen(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Publish Template</h3>
              <button onClick={() => setPublishModalOpen(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handlePublishTemplate} className="publish-form">
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={publishForm.name}
                  onChange={(e) => setPublishForm({ ...publishForm, name: e.target.value })}
                  placeholder="e.g., Modern Developer Portfolio"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={publishForm.description}
                  onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                  placeholder="Describe your template..."
                  rows="4"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={publishForm.category}
                  onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value })}
                  className="form-input"
                >
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={publishForm.tags}
                  onChange={(e) => setPublishForm({ ...publishForm, tags: e.target.value })}
                  placeholder="e.g., modern, dark, responsive"
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setPublishModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
