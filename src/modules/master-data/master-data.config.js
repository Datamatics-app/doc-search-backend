// master-data.config.js

const resourceConfig = {
  companies: {
    table: 'companies',
    label: 'Company',
    selectClause: 'id, code, name, is_active, created_at, updated_at',
    orderBy: 'name ASC, code ASC',
    fields: {
      code: { required: true, maxLength: 20, type: 'string' },
      name: { required: true, maxLength: 150, type: 'string' },
    },
  },
  clusters: {
    table: 'clusters',
    label: 'Cluster',
    selectClause: 'id, name, is_active, created_at, updated_at',
    orderBy: 'name ASC',
    fields: {
      name: { required: true, maxLength: 100, type: 'string' },
    },
  },
  statuses: {
    table: 'statuses',
    label: 'Status',
    selectClause: 'id, name, is_active, created_at, updated_at',
    orderBy: 'name ASC',
    fields: {
      name: { required: true, maxLength: 50, type: 'string' },
    },
  },
  'process-types': {
    table: 'process_types',
    label: 'Process type',
    selectClause: 'id, name, is_active, created_at, updated_at',
    orderBy: 'name ASC',
    fields: {
      name: { required: true, maxLength: 100, type: 'string' },
    },
  },
};

function getConfig(resource) {
  const config = resourceConfig[resource];
  if (!config) {
    const error = new Error('Unsupported resource');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  return config;
}

module.exports = { resourceConfig, getConfig };