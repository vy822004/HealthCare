import express from 'express';
import { saveDietPlan, getDietPlans, deleteDietPlan } from '../controllers/dietPlan.controller.js';

const router = express.Router();

router.post('/', saveDietPlan);
router.get('/', getDietPlans);
router.delete('/:id', deleteDietPlan);

export default router;
