import express from 'express';
import { saveWorkout, getWorkouts, deleteWorkout, updateWorkoutName, logWorkout, getWorkoutHistory } from '../controllers/workout.controller.js';
import { protectRoute } from '../middlewares/auth.midlleware.js';

const router = express.Router();

router.post('/', protectRoute, saveWorkout);
router.get('/', protectRoute, getWorkouts);
router.delete('/:id', protectRoute, deleteWorkout);
router.put('/:id', protectRoute, updateWorkoutName);

router.post('/history', protectRoute, logWorkout);
router.get('/history', protectRoute, getWorkoutHistory);

export default router;
