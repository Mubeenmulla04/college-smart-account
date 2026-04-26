import express from 'express';
const router = express.Router();
import * as sc from '../controllers/scholarshipController.js';
import * as ac from '../controllers/scholarshipApplicationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

// Applications (Students and Admins) - Specific routes first
router.get('/my-applications', protect, ac.getMyApplications);
router.post('/apply', protect, ac.applyForScholarship);
router.get('/admin/all-applications', protect, adminOnly, ac.getAllApplications);
router.put('/admin/review/:id', protect, adminOnly, ac.reviewApplication);

// Scholarship definitions (Admin managed)
router.get('/', protect, sc.getAllScholarships);
router.get('/:id', protect, sc.getScholarshipById);
router.post('/', protect, adminOnly, sc.createScholarship);
router.put('/:id', protect, adminOnly, sc.updateScholarship);
router.delete('/:id', protect, adminOnly, sc.deleteScholarship);

export default router;
