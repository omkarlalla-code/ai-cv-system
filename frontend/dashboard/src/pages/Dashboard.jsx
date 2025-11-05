import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    websites: 0,
    views: 0,
    cvs: 0,
    templates: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/user/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/user/activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back to BetterCV</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⊞</div>
          <div className="stat-content">
            <div className="stat-value">{stats.websites}</div>
            <div className="stat-label">Active Websites</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◉</div>
          <div className="stat-content">
            <div className="stat-value">{stats.views}</div>
            <div className="stat-label">Total Views</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↑</div>
          <div className="stat-content">
            <div className="stat-value">{stats.cvs}</div>
            <div className="stat-label">CVs Uploaded</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">▦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.templates}</div>
            <div className="stat-label">Templates Used</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <a href="/upload" className="action-card">
            <div className="action-icon">↑</div>
            <div className="action-content">
              <h3>Upload New CV</h3>
              <p>Upload a CV and generate a website</p>
            </div>
          </a>

          <a href="/websites" className="action-card">
            <div className="action-icon">⊞</div>
            <div className="action-content">
              <h3>Manage Websites</h3>
              <p>View and edit your portfolio sites</p>
            </div>
          </a>

          <a href="/templates" className="action-card">
            <div className="action-icon">▦</div>
            <div className="action-content">
              <h3>Browse Templates</h3>
              <p>Explore and use community templates</p>
            </div>
          </a>

          <a href="/brainstorm" className="action-card">
            <div className="action-icon">◉</div>
            <div className="action-content">
              <h3>AI Brainstorm</h3>
              <p>Get ideas for your portfolio</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section">
        <h2 className="section-title">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{getActivityIcon(activity.action)}</div>
                <div className="activity-content">
                  <p className="activity-text">{activity.details?.message || activity.action}</p>
                  <p className="activity-time">{formatDate(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getActivityIcon = (action) => {
  const icons = {
    'upload_cv': '↑',
    'create_website': '⊞',
    'edit_website': '✎',
    'publish_template': '▦',
    'login': '→',
  };
  return icons[action] || '◆';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default Dashboard;
