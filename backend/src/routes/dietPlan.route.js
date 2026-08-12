import express from 'express';
import { saveDietPlan, getDietPlans, deleteDietPlan } from '../controllers/dietPlan.controller.js';
import { protectRoute } from '../middlewares/auth.midlleware.js';

const router = express.Router();

router.post('/', protectRoute, saveDietPlan);
router.get('/', protectRoute, getDietPlans);
router.delete('/:id', protectRoute, deleteDietPlan);

export default router;
