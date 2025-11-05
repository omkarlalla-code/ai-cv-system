const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['ANTHROPIC_API_KEY', 'JWT_SECRET'];

// Either DATABASE_URL or individual DB variables must be set
const hasDatabaseUrl = !!process.env.DATABASE_URL;
const hasIndividualDbVars = !!(process.env.DB_NAME && process.env.DB_USER);

if (!hasDatabaseUrl && !hasIndividualDbVars) {
  requiredEnvVars.push('DATABASE_URL or DB_NAME/DB_USER');
}

const missingEnvVars = requiredEnvVars.filter(varName => {
  // Skip the special DATABASE_URL check message
  if (varName.includes('or')) return false;
  return !process.env[varName];
});

if (missingEnvVars.length > 0 || (!hasDatabaseUrl && !hasIndividualDbVars)) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  if (!hasDatabaseUrl && !hasIndividualDbVars) {
    console.error('   - DATABASE_URL or (DB_NAME + DB_USER)');
  }
  console.error('\n💡 Create a .env file in the backend directory with these variables.');
  console.error('   See .env.example for reference.\n');
  process.exit(1);
}

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const websiteRoutes = require('./routes/website');
const templateRoutes = require('./routes/template');
const builderRoutes = require('./routes/builder');
const builderV2Routes = require('./routes/builder-v2');
const adminRoutes = require('./routes/admin');
const versionsRoutes = require('./routes/versions');
const aiRoutes = require('./routes/ai');
const statsRoutes = require('./routes/stats');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { setCsrfToken, verifyCsrfToken, getCsrfToken } = require('./middleware/csrf');
const securityHeaders = require('./middleware/securityHeaders');
const { requestLogger } = require('./middleware/requestLogger');
const { ipWhitelist } = require('./middleware/ipWhitelist');

// Import database
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.anthropic.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://bettercv.com', 'https://www.bettercv.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Additional security headers
app.use(securityHeaders);

// IP whitelist/blacklist (optional - configure via .env)
app.use(ipWhitelist);

// Request logging for security monitoring
app.use(requestLogger);

// CSRF protection middleware
app.use(setCsrfToken);

// Logging middleware
app.use(logger);

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
});

// Swagger UI - Interactive API Documentation
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BetterCV API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// CSRF token endpoint
app.get('/api/csrf-token', getCsrfToken);

// API Routes (with CSRF protection for state-changing operations)
app.use('/api/auth', authLimiter, verifyCsrfToken, authRoutes);
app.use('/api/user', authMiddleware, verifyCsrfToken, userRoutes);
app.use('/api', verifyCsrfToken, uploadRoutes);
app.use('/api', verifyCsrfToken, websiteRoutes);
app.use('/api', verifyCsrfToken, versionsRoutes);
app.use('/api', verifyCsrfToken, aiRoutes);
app.use('/api', verifyCsrfToken, statsRoutes);
app.use('/api/templates', verifyCsrfToken, templateRoutes);
app.use('/api/builder', verifyCsrfToken, builderRoutes);
app.use('/api/builder-v2', verifyCsrfToken, builderV2Routes);
app.use('/api/admin', adminRoutes); // Admin routes (includes auth check)

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        pool.end();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        pool.end();
        process.exit(0);
    });
});

// Start server only if not in test mode
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        console.log(`🚀 CVSite Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Frontend: http://localhost:${PORT}`);
        console.log(`🔗 API: http://localhost:${PORT}/api`);
        console.log(`❤️  Health: http://localhost:${PORT}/health`);
    });
}

module.exports = app;
