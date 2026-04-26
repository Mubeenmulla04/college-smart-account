import express from 'express';
const router = express.Router();
import * as studentController from '../Controllers/studentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { studentCreateSchema } from '../validators/studentValidator.js';

router.get('/profile', protect, studentController.getStudentProfile);
router.get('/', protect, studentController.getAllStudents);
router.get('/:id', protect, studentController.getStudentById);
router.post('/', protect, adminOnly, validate(studentCreateSchema), studentController.createStudent);
router.put('/:id', protect, studentController.updateStudent);
router.delete('/:id', protect, adminOnly, studentController.deleteStudent);

export default router;
