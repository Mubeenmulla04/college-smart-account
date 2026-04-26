import express from 'express';
const router = express.Router();
import * as exportController from '../Controllers/exportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.get('/students', protect, adminOnly, exportController.exportStudentsToExcel);

export default router;
