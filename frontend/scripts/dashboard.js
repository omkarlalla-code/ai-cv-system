// Dashboard JavaScript

// Global variables
let currentUser = null;
let userWebsites = [];
let userCVData = [];
let userStats = {};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    // Check authentication
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    if (!token || !userData) {
        window.location.href = '/index.html';
        return;
    }

    try {
        currentUser = JSON.parse(userData);
        updateUserDisplay();
        await loadDashboardData();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        logout();
    }
}

function updateUserDisplay() {
    const userNameElement = document.getElementById('userName');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.username || currentUser.email;
    }
}

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('userToken');

        // Load user stats
        await loadUserStats();

        // Load CV data
        await loadCVData();

        // Load websites
        await loadWebsites();

        // Load recent activity
        await loadRecentActivity();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

async function loadUserStats() {
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('/api/user/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            userStats = await response.json();
            updateStatsDisplay();
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
        // Set default stats if API fails
        userStats = {
            websiteCount: 0,
            totalViews: 0,
            cvCount: 0,
            templateCount: 0
        };
        updateStatsDisplay();
    }
}

function updateStatsDisplay() {
    document.getElementById('websiteCount').textContent = userStats.websiteCount || 0;
    document.getElementById('totalViews').textContent = userStats.totalViews || 0;
    document.getElementById('cvCount').textContent = userStats.cvCount || 0;
    document.getElementById('templateCount').textContent = userStats.templateCount || 0;
}

async function loadCVData() {
    const container = document.getElementById('cvDataGrid');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading CV data...</p></div>';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('/api/user/cv-data', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            userCVData = await response.json();
            renderCVData();
        } else {
            throw new Error('Failed to load CV data');
        }
    } catch (error) {
        console.error('Error loading CV data:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📄</div>
                <h3>No CV data found</h3>
                <p>Upload your first CV to get started</p>
                <button class="btn btn-primary" onclick="showUploadModal()">Upload CV</button>
            </div>
        `;
    }
}

function renderCVData() {
    const container = document.getElementById('cvDataGrid');

    if (userCVData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📄</div>
                <h3>No CV data found</h3>
                <p>Upload your first CV to get started</p>
                <button class="btn btn-primary" onclick="showUploadModal()">Upload CV</button>
            </div>
        `;
        return;
    }

    container.innerHTML = userCVData.map(cv => `
        <div class="cv-card">
            <div class="cv-card-header">
                <h3 class="cv-card-title">${cv.personal_info?.name || 'Unnamed CV'}</h3>
                <span class="cv-card-date">${formatDate(cv.created_at)}</span>
            </div>
            <div class="cv-card-info">
                <p><strong>File:</strong> ${cv.original_filename || 'Unknown'}</p>
                <p><strong>Type:</strong> ${cv.file_type?.toUpperCase() || 'Unknown'}</p>
                <p><strong>Status:</strong> <span class="status-${cv.parsing_status}">${cv.parsing_status}</span></p>
            </div>
            <div class="cv-card-actions">
                <button class="btn btn-outline" onclick="viewCVData('${cv.id}')">View</button>
                <button class="btn btn-primary" onclick="createWebsiteFromCV('${cv.id}')">Create Website</button>
            </div>
        </div>
    `).join('');
}

async function loadWebsites() {
    const container = document.getElementById('websitesGrid');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading websites...</p></div>';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('/api/user/websites', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            userWebsites = await response.json();
            renderWebsites();
        } else {
            throw new Error('Failed to load websites');
        }
    } catch (error) {
        console.error('Error loading websites:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌐</div>
                <h3>No websites found</h3>
                <p>Create your first website from your CV data</p>
                <button class="btn btn-primary" onclick="createNewSite()">Create Website</button>
            </div>
        `;
    }
}

function renderWebsites() {
    const container = document.getElementById('websitesGrid');

    if (userWebsites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌐</div>
                <h3>No websites found</h3>
                <p>Create your first website from your CV data</p>
                <button class="btn btn-primary" onclick="createNewSite()">Create Website</button>
            </div>
        `;
        return;
    }

    container.innerHTML = userWebsites.map(website => `
        <div class="website-card">
            <div class="website-preview"></div>
            <div class="website-card-content">
                <div class="website-card-header">
                    <h3 class="website-card-title">${website.site_title}</h3>
                    <span class="website-status ${website.is_published ? 'published' : 'draft'}">
                        ${website.is_published ? 'Published' : 'Draft'}
                    </span>
                </div>
                <a href="https://${website.subdomain}.bettercv.com" target="_blank" class="website-card-url">
                    ${website.subdomain}.bettercv.com
                </a>
                <div class="website-card-stats">
                    <div class="website-stat">
                        <span class="website-stat-number">${website.view_count || 0}</span>
                        <span class="website-stat-label">Views</span>
                    </div>
                    <div class="website-stat">
                        <span class="website-stat-number">${formatDate(website.updated_at)}</span>
                        <span class="website-stat-label">Updated</span>
                    </div>
                </div>
                <div class="website-card-actions">
                    <button class="btn btn-outline" onclick="editWebsite('${website.id}')">Edit</button>
                    <button class="btn btn-primary" onclick="viewWebsite('${website.subdomain}')">View</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadRecentActivity() {
    const container = document.getElementById('activityList');

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('/api/user/activity', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const activities = await response.json();
            renderActivity(activities);
        } else {
            throw new Error('Failed to load activity');
        }
    } catch (error) {
        console.error('Error loading activity:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>No recent activity</h3>
                <p>Your activity will appear here as you use the platform</p>
            </div>
        `;
    }
}

function renderActivity(activities) {
    const container = document.getElementById('activityList');

    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>No recent activity</h3>
                <p>Your activity will appear here as you use the platform</p>
            </div>
        `;
        return;
    }

    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${getActivityIcon(activity.action)}</div>
            <div class="activity-content">
                <div class="activity-title">${getActivityTitle(activity.action)}</div>
                <p class="activity-description">${getActivityDescription(activity)}</p>
            </div>
            <div class="activity-time">${formatTimeAgo(activity.created_at)}</div>
        </div>
    `).join('');
}

// Modal and action functions
function showUploadModal() {
    // Use the existing upload modal from main.js
    showModal('uploadModal');
}

function createNewSite() {
    showModal('editorModal');
    initializeEditor();
}

function editWebsite(websiteId) {
    const website = userWebsites.find(w => w.id === websiteId);
    if (website) {
        showModal('editorModal');
        initializeEditor(website);
    }
}

function viewWebsite(subdomain) {
    window.open(`https://${subdomain}.bettercv.com`, '_blank');
}

function createWebsiteFromCV(cvId) {
    showModal('editorModal');
    initializeEditor(null, cvId);
}

function viewCVData(cvId) {
    const cv = userCVData.find(c => c.id === cvId);
    if (cv) {
        // Create a simple modal to display CV data
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>CV Data - ${cv.personal_info?.name || 'Unnamed'}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <pre style="background: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.875rem;">
${JSON.stringify(cv, null, 2)}
                    </pre>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

async function initializeEditor(existingWebsite = null, preselectedCVId = null) {
    // Set modal title
    const title = document.getElementById('editorModalTitle');
    title.textContent = existingWebsite ? 'Edit Website' : 'Create Website';

    // Load templates
    await loadTemplateSelector();

    // Load CV data selector
    loadCVDataSelector(preselectedCVId);

    // Populate form if editing
    if (existingWebsite) {
        populateEditorForm(existingWebsite);
    }
}

async function loadTemplateSelector() {
    const container = document.getElementById('templateSelector');

    try {
        const response = await fetch('/api/templates');
        if (response.ok) {
            const templates = await response.json();
            renderTemplateSelector(templates);
        }
    } catch (error) {
        console.error('Error loading templates:', error);
        container.innerHTML = '<p>Failed to load templates</p>';
    }
}

function renderTemplateSelector(templates) {
    const container = document.getElementById('templateSelector');
    container.innerHTML = templates.map((template, index) => `
        <div class="template-option ${index === 0 ? 'selected' : ''}" onclick="selectTemplate('${template.id}')">
            <div class="template-option-name">${template.name}</div>
            <div class="template-option-description">${template.description}</div>
        </div>
    `).join('');
}

function selectTemplate(templateId) {
    document.querySelectorAll('.template-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.template-option').classList.add('selected');
}

function loadCVDataSelector(preselectedCVId) {
    const selector = document.getElementById('cvDataSelector');
    selector.innerHTML = '<option value="">Select CV data...</option>' +
        userCVData.map(cv => `
            <option value="${cv.id}" ${cv.id === preselectedCVId ? 'selected' : ''}>
                ${cv.personal_info?.name || cv.original_filename || 'Unnamed CV'}
            </option>
        `).join('');
}

function populateEditorForm(website) {
    document.getElementById('siteTitle').value = website.site_title;
    document.getElementById('subdomain').value = website.subdomain;

    if (website.theme_colors?.primary) {
        document.getElementById('primaryColor').value = website.theme_colors.primary;
    }

    if (website.cv_data_id) {
        document.getElementById('cvDataSelector').value = website.cv_data_id;
    }
}

async function previewWebsite() {
    // Collect form data
    const formData = getEditorFormData();

    if (!formData.cvDataId) {
        showNotification('Please select CV data first', 'warning');
        return;
    }

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('/api/preview-website', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const previewData = await response.json();
            const iframe = document.getElementById('previewIframe');
            iframe.srcdoc = previewData.html;
        } else {
            throw new Error('Preview generation failed');
        }
    } catch (error) {
        console.error('Preview error:', error);
        showNotification('Failed to generate preview', 'error');
    }
}

async function publishWebsite() {
    const formData = getEditorFormData();

    if (!formData.cvDataId || !formData.subdomain) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('/api/publish-website', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Website published successfully!', 'success');
            closeModal('editorModal');
            await loadWebsites(); // Refresh websites list
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Publishing failed');
        }
    } catch (error) {
        console.error('Publishing error:', error);
        showNotification(error.message || 'Failed to publish website', 'error');
    }
}

function getEditorFormData() {
    const selectedTemplate = document.querySelector('.template-option.selected');

    return {
        templateId: selectedTemplate?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1],
        cvDataId: document.getElementById('cvDataSelector').value,
        siteTitle: document.getElementById('siteTitle').value,
        subdomain: document.getElementById('subdomain').value,
        primaryColor: document.getElementById('primaryColor').value
    };
}

// Settings functions
function showSettingsModal() {
    showModal('settingsModal');
    loadUserSettings();
}

function showSettingsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function loadUserSettings() {
    if (currentUser) {
        document.getElementById('profileUsername').value = currentUser.username || '';
        document.getElementById('profileEmail').value = currentUser.email || '';
    }
}

// User menu functions
function toggleUserMenu() {
    const button = document.querySelector('.user-button');
    const dropdown = document.getElementById('userDropdown');

    button.classList.toggle('active');
    dropdown.classList.toggle('active');
}

// Close user menu when clicking outside
document.addEventListener('click', function(e) {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu.contains(e.target)) {
        document.querySelector('.user-button').classList.remove('active');
        document.getElementById('userDropdown').classList.remove('active');
    }
});

// Refresh functions
async function refreshCVData() {
    await loadCVData();
    showNotification('CV data refreshed', 'success');
}

async function refreshWebsites() {
    await loadWebsites();
    showNotification('Websites refreshed', 'success');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return formatDate(dateString);
}

function getActivityIcon(action) {
    const icons = {
        'upload_cv': '📄',
        'create_website': '🌐',
        'publish_website': '🚀',
        'edit_website': '✏️',
        'login': '🔐',
        'register': '👤'
    };
    return icons[action] || '📊';
}

function getActivityTitle(action) {
    const titles = {
        'upload_cv': 'CV Uploaded',
        'create_website': 'Website Created',
        'publish_website': 'Website Published',
        'edit_website': 'Website Updated',
        'login': 'Logged In',
        'register': 'Account Created'
    };
    return titles[action] || 'Activity';
}

function getActivityDescription(activity) {
    const action = activity.action;
    const details = activity.details || {};

    switch (action) {
        case 'upload_cv':
            return `Uploaded ${details.filename || 'a CV file'}`;
        case 'create_website':
            return `Created website: ${details.subdomain || 'Unknown'}.bettercv.com`;
        case 'publish_website':
            return `Published website: ${details.subdomain || 'Unknown'}.bettercv.com`;
        case 'edit_website':
            return `Updated website: ${details.subdomain || 'Unknown'}.bettercv.com`;
        default:
            return details.description || 'User activity';
    }
}