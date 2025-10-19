// Enhanced Authentication JavaScript for CVSite

// Global authentication state
let authState = {
    isLoggedIn: false,
    user: null,
    token: null,
    twoFactorRequired: false,
    pendingEmail: null
};

// Initialize enhanced authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedAuth();
});

function initializeEnhancedAuth() {
    // Check existing authentication
    checkAuthState();

    // Set up enhanced form listeners
    setupFormValidation();
    setupPasswordStrength();
    setupUsernameAvailability();
    setupResendTimer();

    // Set up additional event listeners
    setupEnhancedEventListeners();
}

function checkAuthState() {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
        try {
            authState.user = JSON.parse(userData);
            authState.token = token;
            authState.isLoggedIn = true;
            updateUIForLoggedInUser(authState.user);
        } catch (error) {
            console.error('Error parsing user data:', error);
            clearAuthState();
        }
    }
}

function clearAuthState() {
    authState = {
        isLoggedIn: false,
        user: null,
        token: null,
        twoFactorRequired: false,
        pendingEmail: null
    };
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
}

// Enhanced Form Validation
function setupFormValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
        input.addEventListener('input', clearFieldError);
    });

    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('blur', validatePassword);
        input.addEventListener('input', clearFieldError);
    });

    // Username validation
    const usernameInput = document.getElementById('registerUsername');
    if (usernameInput) {
        usernameInput.addEventListener('input', validateUsername);
        usernameInput.addEventListener('blur', validateUsername);
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', validatePasswordMatch);
        confirmPasswordInput.addEventListener('input', clearFieldError);
    }
}

function validateEmail(event) {
    const input = event.target;
    const email = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!email) {
        showFieldError(input, errorElement, 'Email is required');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError(input, errorElement, 'Please enter a valid email address');
        return false;
    }

    showFieldSuccess(input, errorElement);
    return true;
}

function validatePassword(event) {
    const input = event.target;
    const password = input.value;
    const errorElement = document.getElementById(input.id + 'Error');

    if (!password) {
        showFieldError(input, errorElement, 'Password is required');
        return false;
    }

    if (password.length < 8) {
        showFieldError(input, errorElement, 'Password must be at least 8 characters');
        return false;
    }

    showFieldSuccess(input, errorElement);
    return true;
}

function validateUsername(event) {
    const input = event.target;
    const username = input.value.trim();
    const errorElement = document.getElementById('registerUsernameError');
    const previewElement = document.getElementById('subdomainPreview');

    // Update preview
    if (previewElement) {
        previewElement.textContent = username || 'yourusername';
    }

    if (!username) {
        showFieldError(input, errorElement, 'Username is required');
        return false;
    }

    if (username.length < 3) {
        showFieldError(input, errorElement, 'Username must be at least 3 characters');
        return false;
    }

    if (username.length > 20) {
        showFieldError(input, errorElement, 'Username must be less than 20 characters');
        return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        showFieldError(input, errorElement, 'Username can only contain letters, numbers, hyphens, and underscores');
        return false;
    }

    // Check availability
    if (username.length >= 3) {
        checkUsernameAvailability(username);
    }

    clearFieldError(input, errorElement);
    return true;
}

function validatePasswordMatch(event) {
    const confirmInput = event.target;
    const passwordInput = document.getElementById('registerPassword');
    const errorElement = document.getElementById('confirmPasswordError');

    if (confirmInput.value !== passwordInput.value) {
        showFieldError(confirmInput, errorElement, 'Passwords do not match');
        return false;
    }

    showFieldSuccess(confirmInput, errorElement);
    return true;
}

function showFieldError(input, errorElement, message) {
    input.classList.add('error');
    input.classList.remove('success');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function showFieldSuccess(input, errorElement) {
    input.classList.add('success');
    input.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function clearFieldError(event) {
    const input = event.target;
    const errorElement = document.getElementById(input.id + 'Error');

    input.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Password Strength Indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
}

function updatePasswordStrength(event) {
    const password = event.target.value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (!strengthFill || !strengthText) return;

    const strength = calculatePasswordStrength(password);

    // Remove existing classes
    strengthFill.className = 'strength-fill';

    if (password.length === 0) {
        strengthText.textContent = 'Password strength';
        return;
    }

    switch (strength.level) {
        case 1:
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
            break;
        case 2:
            strengthFill.classList.add('fair');
            strengthText.textContent = 'Fair password';
            break;
        case 3:
            strengthFill.classList.add('good');
            strengthText.textContent = 'Good password';
            break;
        case 4:
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
            break;
        default:
            strengthText.textContent = 'Password strength';
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    // Calculate score
    Object.values(checks).forEach(check => {
        if (check) score++;
    });

    // Bonus for length
    if (password.length >= 12) score += 0.5;
    if (password.length >= 16) score += 0.5;

    return {
        score: Math.min(score, 5),
        level: Math.min(Math.floor(score), 4),
        checks
    };
}

// Username Availability Check
function setupUsernameAvailability() {
    let timeoutId;
    const usernameInput = document.getElementById('registerUsername');

    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const username = this.value.trim();
                if (username.length >= 3) {
                    checkUsernameAvailability(username);
                } else {
                    clearUsernameAvailability();
                }
            }, 500);
        });
    }
}

async function checkUsernameAvailability(username) {
    const availabilityElement = document.getElementById('usernameAvailability');
    if (!availabilityElement) return;

    // Show checking state
    availabilityElement.className = 'username-availability checking';
    availabilityElement.textContent = 'Checking availability...';

    try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const result = await response.json();

        if (result.available) {
            availabilityElement.className = 'username-availability available';
            availabilityElement.textContent = '✓ Username is available';
        } else {
            availabilityElement.className = 'username-availability unavailable';
            availabilityElement.textContent = '✗ Username is not available';
        }
    } catch (error) {
        console.error('Error checking username availability:', error);
        availabilityElement.className = 'username-availability';
        availabilityElement.textContent = '';
    }
}

function clearUsernameAvailability() {
    const availabilityElement = document.getElementById('usernameAvailability');
    if (availabilityElement) {
        availabilityElement.className = 'username-availability';
        availabilityElement.textContent = '';
    }
}

// Enhanced Login with 2FA Support
async function handleEnhancedLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const twoFactorCode = document.getElementById('twoFactorCode').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const submitBtn = document.getElementById('loginSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Validate inputs
    if (!email || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Show loading state
    setButtonLoading(submitBtn, btnText, btnLoading, true);

    try {
        const requestData = { email, password };

        if (authState.twoFactorRequired && twoFactorCode) {
            requestData.twoFactorCode = twoFactorCode;
        }

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (result.success) {
            // Store authentication data
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('userToken', result.token);
            storage.setItem('userData', JSON.stringify(result.user));

            authState.user = result.user;
            authState.token = result.token;
            authState.isLoggedIn = true;
            authState.twoFactorRequired = false;

            showNotification('Login successful!', 'success');
            closeModal('authModal');
            updateUIForLoggedInUser(result.user);

        } else if (result.requiresTwoFactor) {
            // Show 2FA input
            authState.twoFactorRequired = true;
            show2FAInput();
            showNotification('Please enter your 2FA code', 'info');

        } else {
            showNotification(result.message || 'Login failed', 'error');
        }

    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');

    } finally {
        setButtonLoading(submitBtn, btnText, btnLoading, false);
    }
}

function show2FAInput() {
    const twoFactorGroup = document.getElementById('twoFactorGroup');
    if (twoFactorGroup) {
        twoFactorGroup.style.display = 'block';
        document.getElementById('twoFactorCode').focus();
    }
}

function hide2FAInput() {
    const twoFactorGroup = document.getElementById('twoFactorGroup');
    if (twoFactorGroup) {
        twoFactorGroup.style.display = 'none';
        document.getElementById('twoFactorCode').value = '';
    }
}

// Enhanced Registration
async function handleEnhancedRegister(e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    const submitBtn = document.getElementById('registerSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Validate all fields
    if (!validateRegistrationForm()) {
        return;
    }

    if (!agreeTerms) {
        showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }

    // Show loading state
    setButtonLoading(submitBtn, btnText, btnLoading, true);

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
            authState.pendingEmail = email;
            showNotification('Account created successfully!', 'success');

            // Show verification modal
            closeModal('authModal');
            showVerificationModal(email);

        } else {
            showNotification(result.message || 'Registration failed', 'error');
        }

    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');

    } finally {
        setButtonLoading(submitBtn, btnText, btnLoading, false);
    }
}

function validateRegistrationForm() {
    let isValid = true;

    // Validate username
    const usernameInput = document.getElementById('registerUsername');
    if (!validateUsername({ target: usernameInput })) {
        isValid = false;
    }

    // Validate email
    const emailInput = document.getElementById('registerEmail');
    if (!validateEmail({ target: emailInput })) {
        isValid = false;
    }

    // Validate password
    const passwordInput = document.getElementById('registerPassword');
    if (!validatePassword({ target: passwordInput })) {
        isValid = false;
    }

    // Validate password match
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (!validatePasswordMatch({ target: confirmPasswordInput })) {
        isValid = false;
    }

    return isValid;
}

// Forgot Password
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();
    const submitBtn = document.getElementById('forgotSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    setButtonLoading(submitBtn, btnText, btnLoading, true);

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Password reset link sent to your email', 'success');
            closeModal('forgotPasswordModal');
        } else {
            showNotification(result.message || 'Failed to send reset link', 'error');
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        showNotification('Failed to send reset link. Please try again.', 'error');

    } finally {
        setButtonLoading(submitBtn, btnText, btnLoading, false);
    }
}

// Email Verification
function showVerificationModal(email) {
    const verificationEmailElement = document.getElementById('verificationEmail');
    if (verificationEmailElement) {
        verificationEmailElement.textContent = email;
    }

    showModal('verificationModal');
    startResendTimer();
}

async function handleEmailVerification(e) {
    e.preventDefault();

    const email = authState.pendingEmail || document.getElementById('verificationEmail').textContent;
    const code = document.getElementById('verificationCode').value.trim();

    const submitBtn = document.getElementById('verifySubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    if (!code || code.length !== 6) {
        showNotification('Please enter a valid 6-digit verification code', 'error');
        return;
    }

    setButtonLoading(submitBtn, btnText, btnLoading, true);

    try {
        const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Email verified successfully!', 'success');
            closeModal('verificationModal');
            showAuthModal('login');
        } else {
            showNotification(result.message || 'Verification failed', 'error');
        }

    } catch (error) {
        console.error('Verification error:', error);
        showNotification('Verification failed. Please try again.', 'error');

    } finally {
        setButtonLoading(submitBtn, btnText, btnLoading, false);
    }
}

// Resend Verification Code
async function resendVerificationCode() {
    const email = authState.pendingEmail || document.getElementById('verificationEmail').textContent;
    const resendBtn = document.getElementById('resendBtn');
    const btnText = resendBtn.querySelector('.btn-text');
    const btnLoading = resendBtn.querySelector('.btn-loading');

    setButtonLoading(resendBtn, btnText, btnLoading, true);

    try {
        const response = await fetch('/api/auth/resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Verification code sent!', 'success');
            startResendTimer();
        } else {
            showNotification(result.message || 'Failed to send code', 'error');
        }

    } catch (error) {
        console.error('Resend error:', error);
        showNotification('Failed to send code. Please try again.', 'error');

    } finally {
        setButtonLoading(resendBtn, btnText, btnLoading, false);
    }
}

// Resend Timer
function startResendTimer() {
    const resendBtn = document.getElementById('resendBtn');
    const resendTimer = document.getElementById('resendTimer');
    const timerCount = document.getElementById('timerCount');

    if (!resendBtn || !resendTimer || !timerCount) return;

    let timeLeft = 60;
    resendBtn.style.display = 'none';
    resendTimer.style.display = 'block';

    const interval = setInterval(() => {
        timeLeft--;
        timerCount.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
            resendBtn.style.display = 'inline-block';
            resendTimer.style.display = 'none';
        }
    }, 1000);
}

function setupResendTimer() {
    // Initialize timer display
    const resendTimer = document.getElementById('resendTimer');
    if (resendTimer) {
        resendTimer.style.display = 'none';
    }
}

// Utility Functions
function setButtonLoading(button, textElement, loadingElement, isLoading) {
    button.disabled = isLoading;

    if (isLoading) {
        textElement.style.display = 'none';
        loadingElement.style.display = 'flex';
    } else {
        textElement.style.display = 'block';
        loadingElement.style.display = 'none';
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle');

    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}

function showForgotPassword() {
    closeModal('authModal');
    showModal('forgotPasswordModal');
}

// Enhanced Event Listeners
function setupEnhancedEventListeners() {
    // Replace existing form listeners with enhanced versions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const verificationForm = document.getElementById('verificationForm');

    if (loginForm) {
        loginForm.removeEventListener('submit', handleLogin);
        loginForm.addEventListener('submit', handleEnhancedLogin);
    }

    if (registerForm) {
        registerForm.removeEventListener('submit', handleRegister);
        registerForm.addEventListener('submit', handleEnhancedRegister);
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }

    if (verificationForm) {
        verificationForm.addEventListener('submit', handleEmailVerification);
    }

    // Modal close on background click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            const modalId = e.target.id;
            closeModal(modalId);
        }
    });

    // Reset forms when switching auth modes
    const originalSwitchAuthMode = window.switchAuthMode;
    window.switchAuthMode = function(mode) {
        originalSwitchAuthMode(mode);
        hide2FAInput();
        clearAllFormErrors();
    };
}

function clearAllFormErrors() {
    // Clear all error states
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input.error, input.success').forEach(el => {
        el.classList.remove('error', 'success');
    });

    // Reset password strength
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    if (strengthFill && strengthText) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Password strength';
    }

    // Clear username availability
    clearUsernameAvailability();
}

// Export enhanced functions for backwards compatibility
window.handleEnhancedLogin = handleEnhancedLogin;
window.handleEnhancedRegister = handleEnhancedRegister;
window.togglePasswordVisibility = togglePasswordVisibility;
window.showForgotPassword = showForgotPassword;
window.resendVerificationCode = resendVerificationCode;
window.showVerificationModal = showVerificationModal;