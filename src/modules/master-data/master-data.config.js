// master-data.config.js

const { DocumentTypes, normalizeDocumentType } = require('../../enums/documentTypes');
const { normalizeResourceType, ResourceTypes } = require('../../enums/resourceTypes');

function resolveConfigParams(resource, documentType = null) {
  const normalizedResource = normalizeResourceType(resource) || normalizeResourceType(documentType);
  const normalizedDocumentType = normalizeDocumentType(documentType) || normalizeDocumentType(resource);

  return {
    normalizedResource,
    normalizedDocumentType,
  };
}

const documentTypeResourceConfig = {
  [DocumentTypes.EOAF]: {
    [ResourceTypes.EOAF_TYPE]: {
      table: 'xoaf_form_eoaf_type',
      label: 'eOAF Type',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.COMPANY_CODE]: {
      table: 'xoaf_form_company_code',
      label: 'Company Code',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.CLUSTERS]: {
      table: 'xoaf_form_clusters',
      label: 'Cluster',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.STATUS]: {
      table: 'xoaf_form_status',
      label: 'Status',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.PROCESS_TYPE]: {
      table: 'xoaf_form_process_type',
      label: 'Process Type',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.BUDGET]: {
      table: 'xoaf_form_budget',
      label: 'Budget',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.CATEGORY]: {
      table: 'xoaf_form_category',
      label: 'Category',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.SOA_CLAUSE]: {
      table: 'soa_clauses',
      label: 'SOA Clause',
      selectClause: 'id, name AS value, is_active, created_at, updated_at',
      orderBy: 'name ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
  },
  [DocumentTypes.GENERAL]: {
    [ResourceTypes.COMPANY_CODE]: {
      table: 'xoaf_general_form_company_code',
      label: 'Company Code',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.STATUS]: {
      table: 'xoaf_general_form_status',
      label: 'Status',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.CATEGORY]: {
      table: 'xoaf_general_form_category',
      label: 'Category',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
  },
  [DocumentTypes.LD]: {
    [ResourceTypes.ORDER_TYPE]: {
      table: 'xoaf_ld_form_order_type',
      label: 'Order Type',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.CLUSTERS]: {
      table: 'xoaf_ld_form_clusters',
      label: 'Cluster',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.COMPANY_CODE]: {
      table: 'xoaf_ld_form_company_code',
      label: 'Company Code',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
    [ResourceTypes.COMPANY_NAME]: {
      table: 'xoaf_ld_form_company_name',
      label: 'Company Name',
      selectClause: 'id, value, is_active, created_at, updated_at',
      orderBy: 'value ASC',
      fields: {
        value: { required: true, maxLength: 255, type: 'string' },
      },
    },
  },
};

function getConfig(resource, documentType = null) {
  const { normalizedDocumentType, normalizedResource } = resolveConfigParams(resource, documentType);
  const config = normalizedDocumentType && normalizedResource
    ? documentTypeResourceConfig[normalizedDocumentType]?.[normalizedResource]
    : null;

  if (!config) {
    const error = new Error('Unsupported resource');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  return config;
}

module.exports = { documentTypeResourceConfig, getConfig, resolveConfigParams };