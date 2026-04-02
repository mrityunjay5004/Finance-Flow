const { body, param } = require('express-validator');
const { ROLES, USER_STATUS } = require('../utils/constants');

const updateUserRules = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage('Invalid role provided'),
  body('status')
    .optional()
    .isIn(Object.values(USER_STATUS)).withMessage('Invalid status provided'),
];

module.exports = { updateUserRules };
