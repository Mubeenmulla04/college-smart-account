import express from 'express';
const router = express.Router();
import * as scholarshipController from '../Controllers/scholarshipController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.get('/', protect, scholarshipController.getAllScholarships);
router.get('/:id', protect, scholarshipController.getScholarshipById);
router.post('/', protect, adminOnly, scholarshipController.createScholarship);
router.put('/:id', protect, adminOnly, scholarshipController.updateScholarship);
router.delete('/:id', protect, adminOnly, scholarshipController.deleteScholarship);

export default router;
