import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    tags: [String],
});

const mealSchema = new mongoose.Schema({
    mealType: { type: String, enum: ["Breakfast", "Lunch", "Dinner", "Snack"], required: true },
    items: [mealItemSchema],
});

const dietPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true, default: 'My Diet Plan' },
    goal: { type: String, enum: ["Weight Loss", "Muscle Gain", "Maintenance", "Healthy Eating"], default: "Maintenance" },
    meals: [mealSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
}, { timestamps: true });

export const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
