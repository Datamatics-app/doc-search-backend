const express = require('express');
const router = express.Router();

const eoafLdController = require('./eoaf-ld.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { idValidator, queryValidators, formIdParam } = require('./eoaf-ld.validators');

router.use(authenticate);

router.get('/forms', queryValidators, validate, eoafLdController.searchForms.bind(eoafLdController));
router.get('/forms/:id', idValidator, validate, eoafLdController.getForm.bind(eoafLdController));
router.get('/forms/:id/document', idValidator, validate, eoafLdController.getFormDocument.bind(eoafLdController));
router.get('/forms/:form_id/enclosures', formIdParam, queryValidators, validate, eoafLdController.listEnclosuresByForm.bind(eoafLdController));
router.get('/enclosures/:id', idValidator, validate, eoafLdController.getEnclosure.bind(eoafLdController));
router.get('/enclosures/:id/document', idValidator, validate, eoafLdController.getEnclosureDocument.bind(eoafLdController));

module.exports = router;
