const crypto = require('crypto');

/**
 * CSRF Protection Middleware
 * Uses double-submit cookie pattern
 *
 * How it works:
 * 1. Server generates a random token and sends it in a cookie
 * 2. Client includes this token in a custom header for state-changing requests
 * 3. Server verifies that cookie and header match
 */

// Generate CSRF token
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to set CSRF token
const setCsrfToken = (req, res, next) => {
  if (!req.cookies.csrfToken) {
    const token = generateCsrfToken();
    res.cookie('csrfToken', token, {
      httpOnly: false, // Must be accessible by JS to send in headers
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  next();
};

// Middleware to verify CSRF token
const verifyCsrfToken = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
    });
  }

  if (cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch',
    });
  }

  next();
};

// Endpoint to get CSRF token (for initial page load)
const getCsrfToken = (req, res) => {
  const token = req.cookies.csrfToken || generateCsrfToken();

  if (!req.cookies.csrfToken) {
    res.cookie('csrfToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  res.json({
    success: true,
    csrfToken: token,
  });
};

module.exports = {
  setCsrfToken,
  verifyCsrfToken,
  getCsrfToken,
};
