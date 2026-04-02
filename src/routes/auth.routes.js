const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerRules, loginRules } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
