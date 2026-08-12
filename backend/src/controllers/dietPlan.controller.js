import { DietPlan } from '../models/dietPlan.model.js';

// POST /api/diet — Save a new diet plan
export const saveDietPlan = async (req, res) => {
    try {
        const { name, goal, meals } = req.body;
        const userId = req.user.id;

        if (!meals || meals.length === 0) {
            return res.status(400).json({ error: "A diet plan must have at least one meal." });
        }

        // Calculate totals
        let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
        meals.forEach(meal => {
            meal.items.forEach(item => {
                totalCalories += item.calories || 0;
                totalProtein += item.protein || 0;
                totalCarbs += item.carbs || 0;
                totalFat += item.fat || 0;
            });
        });

        const dietPlan = new DietPlan({
            userId, name, goal, meals,
            totalCalories: Math.round(totalCalories),
            totalProtein: Math.round(totalProtein),
            totalCarbs: Math.round(totalCarbs),
            totalFat: Math.round(totalFat),
        });
        await dietPlan.save();

        res.status(201).json({ message: "Diet plan saved successfully!", dietPlan });
    } catch (error) {
        console.error("Save diet plan error:", error);
        res.status(500).json({ error: error.message || "Failed to save diet plan." });
    }
};

// GET /api/diet — Get all saved diet plans for the user
export const getDietPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const plans = await DietPlan.find({ userId }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch diet plans." });
    }
};

// DELETE /api/diet/:id — Delete a saved diet plan
export const deleteDietPlan = async (req, res) => {
    try {
        const { id } = req.params;
        // Optionally ensure it belongs to the user:
        // await DietPlan.findOneAndDelete({ _id: id, userId: req.user.id });
        await DietPlan.findByIdAndDelete(id);
        res.json({ message: "Diet plan deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to delete diet plan." });
    }
};
