import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VersionHistory.css';

const VersionHistory = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState([]);

  useEffect(() => {
    fetchVersionHistory();
  }, [websiteId]);

  const fetchVersionHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [websiteRes, versionsRes] = await Promise.all([
        fetch(`/api/websites/${websiteId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/websites/${websiteId}/versions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (websiteRes.ok) {
        const websiteData = await websiteRes.json();
        setWebsite(websiteData);
      }

      if (versionsRes.ok) {
        const versionsData = await versionsRes.json();
        setVersions(versionsData);
      }
    } catch (error) {
      console.error('Failed to fetch version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!confirm('Restore this version? This will create a new version from this point.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/websites/${websiteId}/versions/${versionId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        fetchVersionHistory();
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const handlePreviewVersion = (versionId) => {
    window.open(`/preview/${websiteId}?version=${versionId}`, '_blank');
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      alert('Please select exactly 2 versions to compare');
      return;
    }
    setComparing(selectedVersions);
  };

  const toggleVersionSelection = (versionId) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading version history...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/websites')} className="back-btn">
            ← Back to Websites
          </button>
          <h1>Version History</h1>
          <p className="page-subtitle">
            {website?.title || 'Website'} • {versions.length} version{versions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {selectedVersions.length === 2 && (
          <button onClick={handleCompareVersions} className="btn btn-primary">
            Compare Selected
          </button>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">↻</div>
          <h3>No version history yet</h3>
          <p>Versions are automatically created when you save changes</p>
        </div>
      ) : (
        <div className="versions-list">
          {versions.map((version, index) => (
            <div key={version.id} className={`version-item ${selectedVersions.includes(version.id) ? 'selected' : ''}`}>
              <div className="version-timeline">
                <div className="timeline-dot"></div>
                {index < versions.length - 1 && <div className="timeline-line"></div>}
              </div>

              <div className="version-card">
                <div className="version-header">
                  <div>
                    <h3>
                      Version {versions.length - index}
                      {index === 0 && <span className="current-badge">Current</span>}
                    </h3>
                    <p className="version-date">
                      {formatDate(version.created_at)} • {getTimeSince(version.created_at)}
                    </p>
                  </div>

                  <div className="version-actions">
                    <button
                      onClick={() => toggleVersionSelection(version.id)}
                      className={`action-btn ${selectedVersions.includes(version.id) ? 'active' : ''}`}
                      title="Select for comparison"
                    >
                      {selectedVersions.includes(version.id) ? '✓' : '○'}
                    </button>

                    <button
                      onClick={() => handlePreviewVersion(version.id)}
                      className="action-btn"
                      title="Preview"
                    >
                      ◉
                    </button>

                    {index !== 0 && (
                      <button
                        onClick={() => handleRestoreVersion(version.id)}
                        className="action-btn"
                        title="Restore this version"
                      >
                        ↻
                      </button>
                    )}
                  </div>
                </div>

                {version.notes && (
                  <div className="version-notes">
                    <p>{version.notes}</p>
                  </div>
                )}

                {version.changes && version.changes.length > 0 && (
                  <div className="version-changes">
                    <div className="changes-summary">
                      {version.changes.map((change, idx) => (
                        <span key={idx} className="change-badge">
                          {change.type === 'add' && '+ '}
                          {change.type === 'remove' && '- '}
                          {change.type === 'modify' && '✎ '}
                          {change.component || change.description}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {version.stats && (
                  <div className="version-stats">
                    <span className="stat-item">
                      <span className="stat-label">Size:</span>
                      {(version.stats.size / 1024).toFixed(1)} KB
                    </span>
                    {version.stats.components && (
                      <span className="stat-item">
                        <span className="stat-label">Components:</span>
                        {version.stats.components}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare Modal */}
      {comparing && (
        <div className="modal-overlay" onClick={() => setComparing(null)}>
          <div className="modal-content compare-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Compare Versions</h3>
              <button onClick={() => setComparing(null)} className="btn-close">×</button>
            </div>

            <div className="compare-view">
              <div className="compare-panel">
                <h4>Version {versions.findIndex(v => v.id === comparing[0]) + 1}</h4>
                <iframe
                  src={`/preview/${websiteId}?version=${comparing[0]}`}
                  className="compare-iframe"
                  title="Version 1"
                />
              </div>

              <div className="compare-divider"></div>

              <div className="compare-panel">
                <h4>Version {versions.findIndex(v => v.id === comparing[1]) + 1}</h4>
                <iframe
                  src={`/preview/${websiteId}?version=${comparing[1]}`}
                  className="compare-iframe"
                  title="Version 2"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
