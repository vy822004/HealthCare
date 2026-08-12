import { Workout } from '../models/workout.model.js';
import { WorkoutHistory } from '../models/workoutHistory.model.js';

// POST /api/workouts — Save a new workout
export const saveWorkout = async (req, res) => {
    try {
        const { name, exercises } = req.body;
        const userId = req.user.id;

        if (!exercises || exercises.length === 0) {
            return res.status(400).json({ error: "A workout must have at least one exercise." });
        }

        const workout = new Workout({ userId, name, exercises });
        await workout.save();

        res.status(201).json({ message: "Workout saved successfully!", workout });
    } catch (error) {
        console.error("Save workout error details:", error);
        res.status(500).json({ error: error.message || "Failed to save workout." });
    }
};

// GET /api/workouts — Get all saved workouts for the user
export const getWorkouts = async (req, res) => {
    try {
        const userId = req.user.id;
        const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });
        res.json(workouts);
    } catch (error) {
        console.error("Get workouts error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch workouts." });
    }
};

// PUT /api/workouts/:id — Update a saved workout name
export const updateWorkoutName = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required." });
        }
        const updatedWorkout = await Workout.findByIdAndUpdate(id, { name }, { new: true });
        res.json({ message: "Workout renamed successfully.", workout: updatedWorkout });
    } catch (error) {
        console.error("Update workout error:", error);
        res.status(500).json({ error: error.message || "Failed to update workout." });
    }
};

// DELETE /api/workouts/:id — Delete a saved workout
export const deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        await Workout.findByIdAndDelete(id);
        res.json({ message: "Workout deleted successfully." });
    } catch (error) {
        console.error("Delete workout error:", error);
        res.status(500).json({ error: error.message || "Failed to delete workout." });
    }
};

// POST /api/workouts/history — Log a completed workout
export const logWorkout = async (req, res) => {
    try {
        const { workoutId, name, duration, exercises } = req.body;
        const userId = req.user.id;

        const history = new WorkoutHistory({
            userId,
            workoutId,
            name,
            duration,
            exercises
        });
        await history.save();

        res.status(201).json({ message: "Workout logged successfully!", history });
    } catch (error) {
        console.error("Log workout error:", error);
        res.status(500).json({ error: error.message || "Failed to log workout." });
    }
};

// GET /api/workouts/history — Get logged workouts for progress
export const getWorkoutHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await WorkoutHistory.find({ userId }).sort({ date: 1 });
        res.json(history);
    } catch (error) {
        console.error("Get workout history error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch workout history." });
    }
};
