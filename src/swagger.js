const listEndpoints = require('express-list-endpoints');

const makeOpenApiPath = (routePath) => routePath.replace(/:([^/]+)/g, '{$1}');

const createOpenApiSpec = (app) => {
  const endpoints = listEndpoints(app);
  const paths = {};

  endpoints.forEach((endpoint) => {
    const apiPath = makeOpenApiPath(endpoint.path);

    if (apiPath.startsWith('/api-docs')) {
      return;
    }

    if (!paths[apiPath]) {
      paths[apiPath] = {};
    }

    const parameterNames = [...apiPath.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);

    endpoint.methods.forEach((method) => {
      const lowerMethod = method.toLowerCase();
      if (lowerMethod === 'head') {
        return;
      }

      const tags = apiPath
        .split('/')
        .filter(Boolean)
        .slice(1, 2);

      const operation = {
        summary: `Auto-generated ${method} ${apiPath}`,
        tags: tags.length ? tags : ['general'],
        parameters: parameterNames.map((name) => ({
          name,
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: `Auto-generated path parameter ${name}`,
        })),
        responses: {
          '200': { description: 'Success' },
          '400': { description: 'Bad Request' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not Found' },
        },
      };

      if (['post', 'put', 'patch'].includes(lowerMethod)) {
        operation.requestBody = {
          description: 'Auto-generated request body',
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
              },
            },
          },
        };
      }

      paths[apiPath][lowerMethod] = operation;
    });
  });

  return {
    openapi: '3.0.0',
    info: {
      title: 'RBAC API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Auto-generated API documentation based on registered Express routes.',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || '/',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    paths,
  };
};

module.exports = {
  createOpenApiSpec,
};
