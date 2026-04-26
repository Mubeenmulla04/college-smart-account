import express from 'express';
const router = express.Router();
import * as dashboardController from '../Controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.get('/admin', protect, adminOnly, dashboardController.getAdminStats);
router.get('/student', protect, dashboardController.getStudentStats);

export default router;
