const express = require('express');
const router = express.Router();

const eoafScrapcadController = require('./eoaf-scrapcad.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { idValidator, queryValidators, formIdParam } = require('./eoaf-scrapcad.validators');

router.use(authenticate);

router.get('/forms', queryValidators, validate, eoafScrapcadController.searchForms.bind(eoafScrapcadController));
router.get('/forms/:id', idValidator, validate, eoafScrapcadController.getForm.bind(eoafScrapcadController));
router.get('/forms/:id/document', idValidator, validate, eoafScrapcadController.getFormDocument.bind(eoafScrapcadController));
router.get('/forms/:form_id/enclosures', formIdParam, queryValidators, validate, eoafScrapcadController.listEnclosuresByForm.bind(eoafScrapcadController));
router.get('/enclosures/:id', idValidator, validate, eoafScrapcadController.getEnclosure.bind(eoafScrapcadController));
router.get('/enclosures/:id/document', idValidator, validate, eoafScrapcadController.getEnclosureDocument.bind(eoafScrapcadController));

module.exports = router;
