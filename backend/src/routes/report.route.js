import express from 'express';
import multer from 'multer';
import { uploadReport, getReports, updateReportStatus, createPrescription } from '../controllers/report.controller.js';
import { protectRoute } from '../middlewares/auth.midlleware.js';

const router = express.Router();

const upload = multer({ dest: '/tmp/' });

router.post('/upload', protectRoute, upload.single('file'), uploadReport);
router.post('/prescribe', protectRoute, createPrescription);
router.get('/', protectRoute, getReports);
router.put('/:id/status', protectRoute, updateReportStatus);

export default router;
