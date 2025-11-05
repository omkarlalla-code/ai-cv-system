/**
 * Swagger/OpenAPI Configuration
 * Interactive API documentation and testing interface
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BetterCV API',
      version: '1.0.0',
      description: 'AI-Powered CV to Website Generator API - Transform CVs into beautiful portfolio websites',
      contact: {
        name: 'BetterCV Support',
        email: 'support@bettercv.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.bettercv.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (get it from /api/auth/login)',
        },
        CsrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF token from /api/csrf-token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            is_verified: {
              type: 'boolean',
              example: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'My Portfolio',
            },
            description: {
              type: 'string',
              example: 'Personal portfolio website',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status',
      },
      {
        name: 'Security',
        description: 'CSRF tokens and security endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'User',
        description: 'User profile and account management',
      },
      {
        name: 'Builder',
        description: 'Website builder and project management',
      },
      {
        name: 'CV Upload',
        description: 'CV upload and AI parsing',
      },
      {
        name: 'Templates',
        description: 'Website templates',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints (admin only)',
      },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Check if the server is healthy and database is connected',
          responses: {
            200: {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'healthy',
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time',
                      },
                      uptime: {
                        type: 'number',
                        example: 12345.67,
                      },
                      environment: {
                        type: 'string',
                        example: 'development',
                      },
                    },
                  },
                },
              },
            },
            503: {
              description: 'Server is unhealthy',
            },
          },
        },
      },
      '/api/csrf-token': {
        get: {
          tags: ['Security'],
          summary: 'Get CSRF token',
          description: 'Get a CSRF token for protected requests. Required for all POST/PUT/DELETE operations.',
          responses: {
            200: {
              description: 'CSRF token generated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      csrfToken: {
                        type: 'string',
                        example: 'a1b2c3d4e5f6...',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register new user',
          description: 'Create a new user account. Email verification will be sent.',
          security: [{ CsrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'username', 'name'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'user@example.com',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      minLength: 8,
                      example: 'SecurePass123!',
                    },
                    username: {
                      type: 'string',
                      minLength: 3,
                      example: 'johndoe',
                    },
                    name: {
                      type: 'string',
                      example: 'John Doe',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      message: {
                        type: 'string',
                      },
                      user: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            403: {
              description: 'CSRF token missing or invalid',
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login',
          description: 'Authenticate user and receive JWT token. Use this token in the "Authorize" button above.',
          security: [{ CsrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'user@example.com',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'SecurePass123!',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      message: {
                        type: 'string',
                        example: 'Login successful',
                      },
                      token: {
                        type: 'string',
                        description: 'JWT token - copy this and paste in "Authorize" button',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      },
                      user: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
            },
            403: {
              description: 'CSRF token missing or invalid',
            },
          },
        },
      },
      '/api/user/profile': {
        get: {
          tags: ['User'],
          summary: 'Get user profile',
          description: 'Get current user profile information',
          security: [{ BearerAuth: [], CsrfToken: [] }],
          responses: {
            200: {
              description: 'Profile retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      data: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Not authenticated',
            },
          },
        },
        put: {
          tags: ['User'],
          summary: 'Update user profile',
          description: 'Update current user profile information',
          security: [{ BearerAuth: [], CsrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      example: 'John Doe',
                    },
                    bio: {
                      type: 'string',
                      example: 'Full-stack developer',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Profile updated',
            },
            401: {
              description: 'Not authenticated',
            },
          },
        },
      },
      '/api/builder-v2/projects': {
        get: {
          tags: ['Builder'],
          summary: 'List projects',
          description: 'Get all projects for authenticated user',
          security: [{ BearerAuth: [], CsrfToken: [] }],
          responses: {
            200: {
              description: 'Projects retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      projects: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Project',
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Not authenticated',
            },
          },
        },
        post: {
          tags: ['Builder'],
          summary: 'Create project',
          description: 'Create a new website builder project',
          security: [{ BearerAuth: [], CsrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: {
                      type: 'string',
                      example: 'My Portfolio',
                    },
                    description: {
                      type: 'string',
                      example: 'Personal portfolio website',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Project created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      project: {
                        $ref: '#/components/schemas/Project',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Not authenticated',
            },
          },
        },
      },
      '/api/user/stats': {
        get: {
          tags: ['User'],
          summary: 'Get user statistics',
          description: 'Get statistics for current user',
          security: [{ BearerAuth: [], CsrfToken: [] }],
          responses: {
            200: {
              description: 'Statistics retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      stats: {
                        type: 'object',
                        properties: {
                          totalCVs: {
                            type: 'integer',
                            example: 3,
                          },
                          totalWebsites: {
                            type: 'integer',
                            example: 2,
                          },
                          totalProjects: {
                            type: 'integer',
                            example: 5,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Get system statistics (Admin only)',
          description: 'Get overall system statistics. Requires admin role.',
          security: [{ BearerAuth: [], CsrfToken: [] }],
          responses: {
            200: {
              description: 'Statistics retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      stats: {
                        type: 'object',
                        properties: {
                          users: {
                            type: 'object',
                            properties: {
                              total: {
                                type: 'integer',
                                example: 150,
                              },
                            },
                          },
                          projects: {
                            type: 'object',
                            properties: {
                              total: {
                                type: 'integer',
                                example: 320,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Not authorized - admin access required',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to route files for JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
