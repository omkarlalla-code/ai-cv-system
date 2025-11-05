/**
 * API Utility Functions
 * Centralized API communication with error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Generic API request wrapper
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Unauthorized. Please log in again.');
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Auth API
 */
export const authAPI = {
  register: (userData) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () =>
    apiRequest('/api/auth/me'),
};

/**
 * CV Upload API
 */
export const cvAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('cv', file);

    return apiRequest('/api/upload-cv', {
      method: 'POST',
      body: formData,
    });
  },

  parse: (uploadId) =>
    apiRequest(`/api/parse-cv/${uploadId}`, {
      method: 'POST',
    }),

  generate: (data) =>
    apiRequest('/api/generate-website', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Websites API
 */
export const websitesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/websites?${queryString}` : '/api/websites';
    return apiRequest(endpoint);
  },

  getOne: (websiteId) =>
    apiRequest(`/api/websites/${websiteId}`),

  create: (websiteData) =>
    apiRequest('/api/websites', {
      method: 'POST',
      body: JSON.stringify(websiteData),
    }),

  update: (websiteId, updates) =>
    apiRequest(`/api/websites/${websiteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (websiteId) =>
    apiRequest(`/api/websites/${websiteId}`, {
      method: 'DELETE',
    }),

  publish: (websiteId) =>
    apiRequest(`/api/websites/${websiteId}/publish`, {
      method: 'POST',
    }),

  unpublish: (websiteId) =>
    apiRequest(`/api/websites/${websiteId}/unpublish`, {
      method: 'POST',
    }),

  duplicate: (websiteId) =>
    apiRequest(`/api/websites/${websiteId}/duplicate`, {
      method: 'POST',
    }),
};

/**
 * Templates API
 */
export const templatesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/templates?${queryString}` : '/api/templates';
    return apiRequest(endpoint);
  },

  getOne: (templateId) =>
    apiRequest(`/api/templates/${templateId}`),

  getMy: () =>
    apiRequest('/api/templates/my'),

  publish: (publishData) =>
    apiRequest('/api/templates/publish', {
      method: 'POST',
      body: JSON.stringify(publishData),
    }),

  unpublish: (templateId) =>
    apiRequest(`/api/templates/${templateId}/unpublish`, {
      method: 'POST',
    }),

  use: (templateId, websiteData) =>
    apiRequest(`/api/templates/${templateId}/use`, {
      method: 'POST',
      body: JSON.stringify(websiteData),
    }),
};

/**
 * Version History API
 */
export const versionsAPI = {
  getAll: (websiteId) =>
    apiRequest(`/api/websites/${websiteId}/versions`),

  getOne: (websiteId, versionId) =>
    apiRequest(`/api/websites/${websiteId}/versions/${versionId}`),

  restore: (websiteId, versionId) =>
    apiRequest(`/api/websites/${websiteId}/versions/${versionId}/restore`, {
      method: 'POST',
    }),

  compare: (websiteId, versionId1, versionId2) =>
    apiRequest(`/api/websites/${websiteId}/versions/compare?v1=${versionId1}&v2=${versionId2}`),

  createSnapshot: (websiteId, message) =>
    apiRequest(`/api/websites/${websiteId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

/**
 * AI Brainstorm API
 */
export const aiAPI = {
  brainstorm: (messages) =>
    apiRequest('/api/ai/brainstorm', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),

  getSuggestions: (context) =>
    apiRequest('/api/ai/suggestions', {
      method: 'POST',
      body: JSON.stringify({ context }),
    }),
};

/**
 * Dashboard Stats API
 */
export const statsAPI = {
  getDashboard: () =>
    apiRequest('/api/stats/dashboard'),

  getActivity: (limit = 10) =>
    apiRequest(`/api/stats/activity?limit=${limit}`),
};

/**
 * Builder API
 */
export const builderAPI = {
  loadProject: (projectId) =>
    apiRequest(`/api/builder/projects/${projectId}/load`),

  saveProject: (projectId, data) =>
    apiRequest(`/api/builder/projects/${projectId}/save`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAssets: (projectId) =>
    apiRequest(`/api/builder/projects/${projectId}/assets`),

  uploadAsset: (projectId, file) => {
    const formData = new FormData();
    formData.append('asset', file);

    return apiRequest(`/api/builder/projects/${projectId}/assets`, {
      method: 'POST',
      body: formData,
    });
  },
};

/**
 * Notifications API
 */
export const notificationsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/notifications?${queryString}` : '/api/notifications';
    return apiRequest(endpoint);
  },

  getUnreadCount: () =>
    apiRequest('/api/notifications/unread-count'),

  markAsRead: (notificationId) =>
    apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    }),

  markAllAsRead: () =>
    apiRequest('/api/notifications/mark-all-read', {
      method: 'POST',
    }),

  delete: (notificationId) =>
    apiRequest(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    }),

  deleteAllRead: () =>
    apiRequest('/api/notifications', {
      method: 'DELETE',
    }),
};

export default {
  auth: authAPI,
  cv: cvAPI,
  websites: websitesAPI,
  templates: templatesAPI,
  versions: versionsAPI,
  ai: aiAPI,
  stats: statsAPI,
  builder: builderAPI,
  notifications: notificationsAPI,
};
