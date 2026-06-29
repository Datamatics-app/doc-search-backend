// eoaf.routes.js
const express = require('express');
const router = express.Router();

const eoafController = require('./eoaf.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { idValidator, queryValidators, formIdParam } = require('./eoaf.validators');

router.use(authenticate);

router.get('/forms', queryValidators, validate, eoafController.searchForms.bind(eoafController));
router.get('/forms/:id', idValidator, validate, eoafController.getForm.bind(eoafController));
router.get('/forms/:form_id/enclosures', formIdParam, queryValidators, validate, eoafController.listEnclosuresByForm.bind(eoafController));
router.get('/enclosures/:id', idValidator, validate, eoafController.getEnclosure.bind(eoafController));

module.exports = router;
