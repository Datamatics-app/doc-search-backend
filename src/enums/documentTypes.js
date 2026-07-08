const DocumentTypes = Object.freeze({
  EOAF: 'eoaf',
  GENERAL: 'general',
  LD: 'ld',
});

const DOCUMENT_TYPE_VALUES = Object.freeze(Object.values(DocumentTypes));

function normalizeDocumentType(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  return DOCUMENT_TYPE_VALUES.includes(normalized) ? normalized : null;
}

module.exports = {
  DocumentTypes,
  DOCUMENT_TYPE_VALUES,
  normalizeDocumentType,
};
