import express from 'express';
const router = express.Router();
import * as authController from '../Controllers/authController.js';

import { loginValidationRules, validateRequest } from '../middleware/validator.js';

router.post('/login', loginValidationRules, validateRequest, authController.login);

export default router;
