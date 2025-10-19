const logger = (req, res, next) => {
    const start = Date.now();

    // Override res.end to log response time
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;

        // Log request details
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            contentLength: res.get('Content-Length') || 0
        };

        // Add user info if authenticated
        if (req.user) {
            logData.userId = req.user.id;
            logData.username = req.user.username;
        }

        // Color code based on status
        let statusColor = '';
        if (res.statusCode >= 500) {
            statusColor = '\x1b[31m'; // Red
        } else if (res.statusCode >= 400) {
            statusColor = '\x1b[33m'; // Yellow
        } else if (res.statusCode >= 300) {
            statusColor = '\x1b[36m'; // Cyan
        } else {
            statusColor = '\x1b[32m'; // Green
        }

        const resetColor = '\x1b[0m';

        // Console log for development
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                `${statusColor}${req.method}${resetColor} ${req.url} - ` +
                `${statusColor}${res.statusCode}${resetColor} - ${duration}ms - ${req.ip}`
            );
        }

        // In production, you might want to send logs to external service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to logging service (e.g., Winston, Elasticsearch, etc.)
        }

        originalEnd.apply(this, args);
    };

    next();
};

module.exports = logger;