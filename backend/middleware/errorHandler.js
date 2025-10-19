const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Default error
    let error = {
        success: false,
        message: 'Internal server error'
    };

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Invalid ID format';
        return res.status(400).json(error);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        return res.status(401).json(error);
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        return res.status(401).json(error);
    }

    // PostgreSQL errors
    if (err.code === '23505') { // Unique violation
        error.message = 'Resource already exists';
        return res.status(409).json(error);
    }

    if (err.code === '23503') { // Foreign key violation
        error.message = 'Referenced resource not found';
        return res.status(400).json(error);
    }

    if (err.code === '23514') { // Check violation
        error.message = 'Invalid data provided';
        return res.status(400).json(error);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        error.message = 'Validation failed';
        error.details = Object.values(err.errors).map(val => val.message);
        return res.status(400).json(error);
    }

    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        error.message = 'File too large';
        return res.status(413).json(error);
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error.message = 'Unexpected file field';
        return res.status(400).json(error);
    }

    // Custom application errors
    if (err.statusCode) {
        error.message = err.message;
        return res.status(err.statusCode).json(error);
    }

    // Default to 500 server error
    res.status(500).json(error);
};

module.exports = errorHandler;