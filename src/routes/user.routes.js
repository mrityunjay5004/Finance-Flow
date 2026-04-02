const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { updateUserRules } = require('../validators/user.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

// Strictly ADMIN-only for all user management
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.patch('/:id', updateUserRules, validate, userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
