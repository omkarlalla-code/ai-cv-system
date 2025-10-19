// BetterCV Frontend JavaScript

// Global variables
let currentAuthMode = 'login';
let uploadedFile = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeUploadArea();
});

// Initialize event listeners
function initializeEventListeners() {
    // Template selection
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            templateCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Modal close on background click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize upload area
function initializeUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('cvFile');
    const browseButton = document.querySelector('.upload-browse');

    if (!uploadArea || !fileInput) return;

    // Browse button click
    if (browseButton) {
        browseButton.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Upload area click
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset forms
        if (modalId === 'authModal') {
            resetAuthForms();
        } else if (modalId === 'uploadModal') {
            resetUploadModal();
        }
    }
}

function showAuthModal(mode = 'login') {
    currentAuthMode = mode;
    switchAuthMode(mode);
    showModal('authModal');
}

function showUploadModal() {
    // Check if user is logged in (this would normally check authentication state)
    const isLoggedIn = localStorage.getItem('userToken');

    if (!isLoggedIn) {
        showAuthModal('register');
        return;
    }

    showModal('uploadModal');
}

function switchAuthMode(mode) {
    currentAuthMode = mode;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('authModalTitle');

    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        modalTitle.textContent = 'Login';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        modalTitle.textContent = 'Create Account';
    }
}

function resetAuthForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function resetUploadModal() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadProgress = document.getElementById('uploadProgress');
    const fileInput = document.getElementById('cvFile');

    uploadArea.style.display = 'block';
    uploadProgress.style.display = 'none';
    fileInput.value = '';
    uploadedFile = null;
}

// File upload functions
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    // Validate file type
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload a PDF, Word document, or text file.', 'error');
        return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }

    uploadedFile = file;
    uploadFile(file);
}

async function uploadFile(file) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadProgress = document.getElementById('uploadProgress');

    // Show progress
    uploadArea.style.display = 'none';
    uploadProgress.style.display = 'block';

    try {
        const formData = new FormData();
        formData.append('cv', file);

        // Get user token
        const token = localStorage.getItem('userToken');

        const response = await fetch('/api/upload-cv', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();

        if (result.success) {
            showNotification('CV uploaded and processed successfully!', 'success');
            closeModal('uploadModal');

            // Redirect to dashboard or next step
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
        } else {
            throw new Error(result.message || 'Processing failed');
        }

    } catch (error) {
        console.error('Upload error:', error);
        showNotification(error.message || 'Upload failed. Please try again.', 'error');
        resetUploadModal();
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('userToken', result.token);
            localStorage.setItem('userData', JSON.stringify(result.user));

            showNotification('Login successful!', 'success');
            closeModal('authModal');

            // Update UI for logged in state
            updateUIForLoggedInUser(result.user);

        } else {
            showNotification(result.message || 'Login failed', 'error');
        }

    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        showNotification('Username can only contain letters, numbers, hyphens, and underscores', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Account created successfully! Please check your email to verify your account.', 'success');
            switchAuthMode('login');
        } else {
            showNotification(result.message || 'Registration failed', 'error');
        }

    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// UI update functions
function updateUIForLoggedInUser(user) {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.innerHTML = `
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#templates">Templates</a>
            <a href="/dashboard.html">Dashboard</a>
            <button class="btn btn-outline" onclick="logout()">Logout</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    showNotification('Logged out successfully', 'success');

    // Reset navigation
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.innerHTML = `
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#templates">Templates</a>
            <button class="btn btn-outline" onclick="showAuthModal('login')">Login</button>
            <button class="btn btn-primary" onclick="showAuthModal('register')">Get Started</button>
        `;
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add notification styles if not already present
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                border-left: 4px solid;
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }

            .notification-success { border-color: #10b981; }
            .notification-error { border-color: #ef4444; }
            .notification-warning { border-color: #f59e0b; }
            .notification-info { border-color: #2563eb; }

            .notification button {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #64748b;
                padding: 0;
                line-height: 1;
            }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize on page load
function initializePage() {
    // Check if user is already logged in
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            updateUIForLoggedInUser(user);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
        }
    }
}

// Call initialization
document.addEventListener('DOMContentLoaded', initializePage);

// Export functions to global scope for HTML onclick handlers
window.showAuthModal = showAuthModal;
window.showUploadModal = showUploadModal;
window.closeModal = closeModal;
window.scrollToSection = scrollToSection;
window.switchAuthMode = switchAuthMode;
window.logout = logout;