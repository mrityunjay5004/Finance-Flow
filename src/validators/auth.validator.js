const { body } = require('express-validator');

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('A valid email address is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email address is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
