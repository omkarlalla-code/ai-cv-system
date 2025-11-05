import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MyWebsites.css';

const MyWebsites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('recent'); // recent, name, views
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/websites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWebsites(data);
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (websiteId) => {
    window.location.href = `/builder/index.html?project=${websiteId}`;
  };

  const handleView = (websiteId, url) => {
    window.open(url || `/preview/${websiteId}`, '_blank');
  };

  const handleDuplicate = async (websiteId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/websites/${websiteId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchWebsites();
      }
    } catch (error) {
      console.error('Failed to duplicate website:', error);
    }
  };

  const handlePublish = async (websiteId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/websites/${websiteId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchWebsites();
      }
    } catch (error) {
      console.error('Failed to publish website:', error);
    }
  };

  const handleUnpublish = async (websiteId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/websites/${websiteId}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchWebsites();
      }
    } catch (error) {
      console.error('Failed to unpublish website:', error);
    }
  };

  const handleDelete = async (websiteId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        setWebsites(websites.filter(w => w.id !== websiteId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete website:', error);
    }
  };

  const getSortedWebsites = () => {
    let filtered = websites;

    // Apply filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(w => {
        if (filterStatus === 'published') return w.is_published;
        if (filterStatus === 'draft') return !w.is_published;
        return true;
      });
    }

    // Apply sort
    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading websites...</div>
      </div>
    );
  }

  const sortedWebsites = getSortedWebsites();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Websites</h1>
          <p className="page-subtitle">{websites.length} website{websites.length !== 1 ? 's' : ''} in total</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          + New Website
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="recent">Recently Updated</option>
            <option value="name">Name</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Websites Grid/List */}
      {sortedWebsites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⊞</div>
          <h3>No websites yet</h3>
          <p>Upload your CV to create your first portfolio website</p>
          <Link to="/upload" className="btn btn-primary">
            Upload CV
          </Link>
        </div>
      ) : (
        <div className={`websites-${viewMode}`}>
          {sortedWebsites.map((website) => (
            <div key={website.id} className="website-card">
              <div className="website-preview">
                <div className="preview-placeholder">
                  {website.title?.[0]?.toUpperCase() || 'W'}
                </div>
                {website.is_published && (
                  <div className="published-badge">Live</div>
                )}
              </div>

              <div className="website-info">
                <div className="website-header">
                  <h3>{website.title || 'Untitled Website'}</h3>
                  <div className="website-meta">
                    <span className="meta-item">
                      <span className="meta-icon">◉</span>
                      {website.views || 0} views
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">✎</span>
                      {formatDate(website.updated_at)}
                    </span>
                  </div>
                </div>

                <div className="website-actions">
                  <button
                    onClick={() => handleEdit(website.id)}
                    className="action-btn"
                    title="Edit in builder"
                  >
                    ✎ Edit
                  </button>

                  <button
                    onClick={() => handleView(website.id, website.published_url)}
                    className="action-btn"
                    title="View website"
                  >
                    ◉ View
                  </button>

                  <Link
                    to={`/history/${website.id}`}
                    className="action-btn"
                    title="Version history"
                  >
                    ↻ History
                  </Link>

                  <button
                    onClick={() => handleDuplicate(website.id)}
                    className="action-btn"
                    title="Duplicate"
                  >
                    ⧉ Duplicate
                  </button>

                  {website.is_published ? (
                    <button
                      onClick={() => handleUnpublish(website.id)}
                      className="action-btn"
                      title="Unpublish"
                    >
                      ◼ Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePublish(website.id)}
                      className="action-btn"
                      title="Publish"
                    >
                      ▶ Publish
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirm(website.id)}
                    className="action-btn danger"
                    title="Delete"
                  >
                    × Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Website?</h3>
            <p>This action cannot be undone. All versions and data will be permanently deleted.</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-primary"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWebsites;
