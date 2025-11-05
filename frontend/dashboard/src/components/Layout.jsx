import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '◆' },
    { path: '/upload', label: 'Upload CV', icon: '↑' },
    { path: '/websites', label: 'My Websites', icon: '⊞' },
    { path: '/templates', label: 'Templates', icon: '▦' },
    { path: '/brainstorm', label: 'AI Brainstorm', icon: '◉' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>BetterCV</h1>
          <p className="subtitle">CV to Website</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="user-details">
              <p className="user-name">{user?.username || 'User'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            Logout →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
