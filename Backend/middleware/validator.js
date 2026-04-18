import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }
  next();
};

export const studentValidationRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('department').notEmpty().withMessage('Department is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
];

export const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['admin', 'student']).withMessage('Role must be admin or student'),
];

export const departmentValidationRules = [
  body('name').notEmpty().withMessage('Department name is required'),
  body('code').notEmpty().withMessage('Department code is required'),
];
