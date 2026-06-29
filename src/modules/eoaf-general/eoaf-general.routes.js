const express = require('express');
const router = express.Router();

const eoafGeneralController = require('./eoaf-general.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { idValidator, queryValidators, formIdParam } = require('./eoaf-general.validators');

router.use(authenticate);

router.get('/forms', queryValidators, validate, eoafGeneralController.searchForms.bind(eoafGeneralController));
router.get('/forms/:id', idValidator, validate, eoafGeneralController.getForm.bind(eoafGeneralController));
router.get('/forms/:id/document', idValidator, validate, eoafGeneralController.getFormDocument.bind(eoafGeneralController));
router.get('/forms/:form_id/attachments', formIdParam, queryValidators, validate, eoafGeneralController.listAttachmentsByForm.bind(eoafGeneralController));
router.get('/attachments/:id', idValidator, validate, eoafGeneralController.getAttachment.bind(eoafGeneralController));
router.get('/attachments/:id/document', idValidator, validate, eoafGeneralController.getAttachmentDocument.bind(eoafGeneralController));

module.exports = router;