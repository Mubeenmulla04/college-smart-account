import express from 'express';
const router = express.Router();
import * as departmentController from '../Controllers/departmentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.get('/', protect, departmentController.getAllDepartments);
router.get('/:id', protect, departmentController.getDepartmentById);
router.post('/', protect, adminOnly, departmentController.createDepartment);
router.put('/:id', protect, adminOnly, departmentController.updateDepartment);
router.delete('/:id', protect, adminOnly, departmentController.deleteDepartment);

export default router;
