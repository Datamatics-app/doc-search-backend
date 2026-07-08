const ResourceTypes = Object.freeze({
  EOAF_TYPE: 'eoaf-type',
  COMPANY_CODE: 'company-code',
  CLUSTERS: 'clusters',
  STATUS: 'status',
  PROCESS_TYPE: 'process-type',
  BUDGET: 'budget',
  CATEGORY: 'category',
  SOA_CLAUSE: 'soa-clause',
  ORDER_TYPE: 'order-type',
  COMPANY_NAME: 'company-name',
});

const RESOURCE_TYPE_VALUES = Object.freeze(Object.values(ResourceTypes));

function normalizeResourceType(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  return RESOURCE_TYPE_VALUES.includes(normalized) ? normalized : null;
}

module.exports = {
  ResourceTypes,
  RESOURCE_TYPE_VALUES,
  normalizeResourceType,
};
