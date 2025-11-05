/**
 * Enhanced Request Logger
 * Logs all requests with detailed information for security monitoring
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const accessLogPath = path.join(logsDir, 'access.log');
const securityLogPath = path.join(logsDir, 'security.log');

/**
 * Write log entry to file
 */
function writeLog(filePath, entry) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${JSON.stringify(entry)}\n`;

  fs.appendFile(filePath, logLine, (err) => {
    if (err) console.error('Error writing log:', err);
  });
}

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    const responseTime = Date.now() - startTime;

    // Log entry
    const logEntry = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous',
    };

    // Log to access log
    writeLog(accessLogPath, logEntry);

    // Log security events
    if (isSecurityEvent(req, res.statusCode)) {
      const securityEntry = {
        ...logEntry,
        event: getSecurityEventType(req, res.statusCode),
        body: sanitizeBody(req.body),
        query: req.query,
      };
      writeLog(securityLogPath, securityEntry);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Check if request is a security event
 */
function isSecurityEvent(req, statusCode) {
  // Failed authentication
  if (statusCode === 401 || statusCode === 403) return true;

  // Rate limit exceeded
  if (statusCode === 429) return true;

  // Sensitive endpoints
  const sensitiveEndpoints = [
    '/api/auth/',
    '/api/user/profile',
    '/api/upload',
  ];

  return sensitiveEndpoints.some(endpoint => req.url.includes(endpoint));
}

/**
 * Get security event type
 */
function getSecurityEventType(req, statusCode) {
  if (statusCode === 401) return 'AUTH_FAILED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 429) return 'RATE_LIMIT_EXCEEDED';
  if (req.url.includes('/auth/login')) return 'LOGIN_ATTEMPT';
  if (req.url.includes('/auth/register')) return 'REGISTRATION_ATTEMPT';
  if (req.url.includes('/upload')) return 'FILE_UPLOAD';
  return 'SECURITY_EVENT';
}

/**
 * Sanitize request body (remove sensitive data)
 */
function sanitizeBody(body) {
  if (!body) return body;

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Get recent security events
 */
function getSecurityEvents(limit = 100) {
  try {
    const logs = fs.readFileSync(securityLogPath, 'utf8');
    const lines = logs.trim().split('\n');
    const events = lines
      .slice(-limit)
      .map(line => {
        try {
          const match = line.match(/\[(.*?)\] (.*)/);
          if (match) {
            return {
              timestamp: match[1],
              ...JSON.parse(match[2])
            };
          }
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return events;
  } catch (error) {
    return [];
  }
}

/**
 * Get access logs
 */
function getAccessLogs(limit = 100) {
  try {
    const logs = fs.readFileSync(accessLogPath, 'utf8');
    const lines = logs.trim().split('\n');
    const events = lines
      .slice(-limit)
      .map(line => {
        try {
          const match = line.match(/\[(.*?)\] (.*)/);
          if (match) {
            return {
              timestamp: match[1],
              ...JSON.parse(match[2])
            };
          }
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return events;
  } catch (error) {
    return [];
  }
}

module.exports = {
  requestLogger,
  getSecurityEvents,
  getAccessLogs,
};
