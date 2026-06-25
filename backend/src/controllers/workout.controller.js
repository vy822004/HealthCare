import { Workout } from '../models/workout.model.js';

// POST /api/workouts — Save a new workout
export const saveWorkout = async (req, res) => {
    try {
        const { name, exercises } = req.body;
        const userId = "64c9d5e3f1a2b3c4d5e6f7a8"; // Dummy userId for now (no auth required during testing)

        if (!exercises || exercises.length === 0) {
            return res.status(400).json({ error: "A workout must have at least one exercise." });
        }

        const workout = new Workout({ userId, name, exercises });
        await workout.save();

        res.status(201).json({ message: "Workout saved successfully!", workout });
    } catch (error) {
        console.error("Save workout error:", error);
        res.status(500).json({ error: error.message || "Failed to save workout." });
    }
};

// GET /api/workouts — Get all saved workouts for the user
export const getWorkouts = async (req, res) => {
    try {
        const userId = "64c9d5e3f1a2b3c4d5e6f7a8"; // Dummy userId for now
        const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });
        res.json(workouts);
    } catch (error) {
        console.error("Get workouts error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch workouts." });
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
