const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { loginValidators, refreshValidators } = require('./auth.validators');

// POST /auth/login
router.post('/login', loginValidators, validate, authController.login.bind(authController));

// POST /auth/refresh
router.post('/refresh', refreshValidators, validate, authController.refresh.bind(authController));

// POST /auth/logout  (requires JWT)
router.post('/logout', authenticate, authController.logout.bind(authController));

// POST /auth/logout-all  (requires JWT)
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));

// GET /auth/me  (requires JWT)
router.get('/me', authenticate, authController.me.bind(authController));

module.exports = router;
