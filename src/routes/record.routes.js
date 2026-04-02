const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const { createRecordRules, updateRecordRules } = require('../validators/record.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// Viewers, Analysts, and Admins can read
router.get('/', authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN), recordController.getAll);
router.get('/:id', authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN), recordController.getById);

// Analytics-heavy read + create/update for Analysts and Admins
router.post('/', authorize(ROLES.ANALYST, ROLES.ADMIN), createRecordRules, validate, recordController.create);
router.patch('/:id', authorize(ROLES.ANALYST, ROLES.ADMIN), updateRecordRules, validate, recordController.update);

// Full deletion restricted strictly to Admin
router.delete('/:id', authorize(ROLES.ADMIN), recordController.remove);

module.exports = router;
