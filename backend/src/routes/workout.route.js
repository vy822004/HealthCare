import express from 'express';
import { saveWorkout, getWorkouts, deleteWorkout } from '../controllers/workout.controller.js';

const router = express.Router();

router.post('/', saveWorkout);
router.get('/', getWorkouts);
router.delete('/:id', deleteWorkout);

export default router;
