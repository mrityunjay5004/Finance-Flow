const { body, param } = require('express-validator');
const { TRANSACTION_TYPES } = require('../utils/constants');

const createRecordRules = [
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number greater than 0'),
  body('type')
    .isIn(Object.values(TRANSACTION_TYPES)).withMessage(`Type must be one of: ${Object.values(TRANSACTION_TYPES).join(', ')}`),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 50 }).withMessage('Category name is too long'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const updateRecordRules = [
  param('id').isMongoId().withMessage('Invalid record ID format'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('type').optional().isIn(Object.values(TRANSACTION_TYPES)).withMessage('Invalid transaction type'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
];

module.exports = { createRecordRules, updateRecordRules };
