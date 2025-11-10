/**
 * Swagger API Documentation Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Automated Profit System API',
      version: '1.0.0',
      description: 'API documentation for the Automated Print-on-Demand Profit System',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://your-app.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF token for state-changing operations'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'API is healthy and online'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            uptime: {
              type: 'integer',
              description: 'Server uptime in seconds'
            },
            version: {
              type: 'string',
              example: '1.0.0'
            },
            environment: {
              type: 'string',
              example: 'production'
            },
            checks: {
              type: 'object',
              properties: {
                server: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    message: { type: 'string' }
                  }
                },
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    message: { type: 'string' }
                  }
                },
                printful: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    message: { type: 'string' }
                  }
                },
                environment: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'System health and monitoring endpoints'
      },
      {
        name: 'Admin',
        description: 'Admin authentication and management'
      },
      {
        name: 'Team',
        description: 'Team profit sharing and management'
      },
      {
        name: 'Products',
        description: 'Product research and profit tools'
      },
      {
        name: 'Automation',
        description: 'Printful integration and automation'
      },
      {
        name: 'Personal',
        description: 'Personal account sales tracking'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/server.js'] // Path to API route files
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
