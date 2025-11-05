import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Registration failed');
        }

        const data = await response.json();
        onLogin(data.token, data.user);

      } else {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Login failed');
        }

        const data = await response.json();
        onLogin(data.token, data.user);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>BetterCV</h1>
          <p>AI-Powered CV to Website Generator</p>
        </div>

        <div className="login-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-banner">
                <span>⚠</span>
                <p>{error}</p>
              </div>
            )}

            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="form-input"
                  placeholder="Choose a username"
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="form-input"
                placeholder="••••••••"
                minLength="8"
              />
            </div>

            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="••••••••"
                  minLength="8"
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login →' : 'Create Account →'}
            </button>

            {mode === 'login' && (
              <div className="form-footer">
                <p>
                  Don't have an account?{' '}
                  <button type="button" onClick={toggleMode} className="link-btn">
                    Register here
                  </button>
                </p>
              </div>
            )}

            {mode === 'register' && (
              <div className="form-footer">
                <p>
                  Already have an account?{' '}
                  <button type="button" onClick={toggleMode} className="link-btn">
                    Login here
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="login-footer">
          <p>Transform your CV into a professional website in minutes</p>
          <div className="features-list">
            <span>◆ AI-Powered</span>
            <span>◆ Customizable Templates</span>
            <span>◆ Easy to Use</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
