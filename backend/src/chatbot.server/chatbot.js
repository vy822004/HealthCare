import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import { Patient } from '../models/patient.model.js';
import { MedicalRecord } from '../models/medicalRecord.model.js';
import { Doctor } from '../models/doctor.model.js';
import { ChatHistory } from '../models/chatHistory.model.js';
import { Message } from '../models/messages.model.js';
import { Workout } from '../models/workout.model.js';
import { WorkoutHistory } from '../models/workoutHistory.model.js';
import { DietPlan } from '../models/dietPlan.model.js';
import { Report } from '../models/report.model.js';
import { protectRoute } from '../middlewares/auth.midlleware.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ 
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// ─── Tool Functions ──────────────────────────────────────────────────────────

async function getPatientProfile(userId) {
    try {
        const patient = await Patient.findOne({ userId });
        if (!patient) return "No patient profile found.";
        return JSON.stringify(patient);
    } catch (err) { return "Error fetching patient profile."; }
}

async function getMedicalRecords(userId) {
    try {
        const patient = await Patient.findOne({ userId });
        if (!patient) return "No patient profile found.";
        const records = await MedicalRecord.find({ patientId: patient._id }).sort({ recordedAt: -1 }).limit(3);
        if (records.length === 0) return "No recent medical records found.";
        return JSON.stringify(records);
    } catch (err) { return "Error fetching medical records."; }
}

async function getAvailableDoctors() {
    try {
        const doctors = await Doctor.find({}).populate('userId', 'name').limit(10);
        if (doctors.length === 0) return "No doctors available.";
        return JSON.stringify(doctors.map(doc => ({
            name: doc.userId ? doc.userId.name : "Unknown",
            specialization: doc.specialization,
            experience: doc.experience + " years",
            hospital: doc.hospital
        })));
    } catch (err) { return "Error fetching doctors."; }
}

async function createWorkoutPlan(userId, args) {
    try {
        const { name, exercises } = args;
        if (!exercises || exercises.length === 0) return "Cannot save: no exercises provided.";

        const workout = new Workout({ userId, name: name || "AI Workout Plan", exercises });
        await workout.save();
        return JSON.stringify({ success: true, message: `Workout plan "${workout.name}" saved with ${exercises.length} exercises!`, workoutId: workout._id });
    } catch (err) {
        console.error("createWorkoutPlan error:", err);
        return "Error saving workout plan: " + err.message;
    }
}

async function createDietPlan(userId, args) {
    try {
        const { name, goal, meals } = args;
        if (!meals || meals.length === 0) return "Cannot save: no meals provided.";

        let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
        meals.forEach(meal => {
            (meal.items || []).forEach(item => {
                totalCalories += item.calories || 0;
                totalProtein += item.protein || 0;
                totalCarbs += item.carbs || 0;
                totalFat += item.fat || 0;
            });
        });

        // 🧠 AI mathematical correction: if the AI hallucinated low calories for muscle gain, auto-scale the portions mathematically.
        if (goal === "Muscle Gain" && totalCalories > 0 && totalCalories < 2800) {
            const multiplier = 3200 / totalCalories;
            
            // We need to carefully scale so protein doesn't exceed 200g.
            // If totalProtein * multiplier > 220, we use a separate protein multiplier
            const proteinMultiplier = (totalProtein * multiplier > 220) ? (220 / totalProtein) : multiplier;
            
            // If we cap protein, we should add the missing calories into carbs.
            const extraCarbCalories = (totalProtein * multiplier - totalProtein * proteinMultiplier) * 4;
            const extraCarbsPerMeal = Math.round((extraCarbCalories / 4) / meals.length);

            meals.forEach(meal => {
                (meal.items || []).forEach((item, i) => {
                    item.calories = Math.round(item.calories * multiplier);
                    item.protein = Math.round(item.protein * proteinMultiplier);
                    item.fat = Math.round(item.fat * multiplier);
                    item.carbs = Math.round(item.carbs * multiplier);
                    
                    // Distribute the missing calories from protein into carbs on the first item of each meal
                    if (i === 0 && proteinMultiplier !== multiplier) {
                        item.carbs += extraCarbsPerMeal;
                        item.calories += (extraCarbsPerMeal * 4); // Keep calories mathematically sound
                    }

                    if (!item.name.includes("Portion")) {
                        item.name = item.name + " (Large Portion)";
                    }
                });
            });
            // Recalculate totals after scaling
            totalCalories = 0; totalProtein = 0; totalCarbs = 0; totalFat = 0;
            meals.forEach(meal => {
                (meal.items || []).forEach(item => {
                    totalCalories += item.calories || 0;
                    totalProtein += item.protein || 0;
                    totalCarbs += item.carbs || 0;
                    totalFat += item.fat || 0;
                });
            });
        }

        const dietPlan = new DietPlan({
            userId,
            name: name || "AI Diet Plan",
            goal: goal || "Maintenance",
            meals,
            totalCalories: Math.round(totalCalories),
            totalProtein: Math.round(totalProtein),
            totalCarbs: Math.round(totalCarbs),
            totalFat: Math.round(totalFat),
        });
        await dietPlan.save();
        return JSON.stringify({ success: true, message: `Diet plan "${dietPlan.name}" saved! Total: ${Math.round(totalCalories)} kcal/day.`, dietPlanId: dietPlan._id });
    } catch (err) {
        console.error("createDietPlan error:", err);
        return "Error saving diet plan: " + err.message;
    }
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

const tools = [
    {
        type: "function",
        function: {
            name: "get_available_doctors",
            description: "Get a list of available doctors and their specializations. Use this when user mentions symptoms.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "create_workout_plan",
            description: "Generate and SAVE a personalised workout plan directly into the user's account. Call this when the user asks to create or generate a workout plan.",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Name of the workout plan, e.g. 'Full Body Strength Plan'" },
                    exercises: {
                        type: "array",
                        description: "List of exercises in the plan",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "Exercise name, e.g. 'Push-ups'" },
                                sets: { type: "number", description: "Number of sets" },
                                reps: { type: "string", description: "Reps or duration, e.g. '10-12' or '30 seconds'" },
                                rest: { type: "string", description: "Rest period, e.g. '60 seconds'" },
                                category: { type: "string", description: "Muscle group, e.g. 'Chest', 'Legs'" },
                                primaryMuscles: { type: "array", items: { type: "string" }, description: "Primary muscles targeted" }
                            },
                            required: ["name", "sets", "reps"]
                        }
                    }
                },
                required: ["name", "exercises"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_diet_plan",
            description: "Generate and SAVE a personalised daily diet plan directly into the user's account. Call this when the user asks to create or generate a diet plan.",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Name of the diet plan, e.g. 'High Protein Cut Plan'" },
                    goal: { type: "string", enum: ["Weight Loss", "Muscle Gain", "Maintenance", "Healthy Eating"], description: "Fitness goal this plan targets" },
                    meals: {
                        type: "array",
                        description: "List of meals in the daily plan",
                        items: {
                            type: "object",
                            properties: {
                                mealType: { type: "string", enum: ["Breakfast", "Lunch", "Dinner", "Snack"], description: "Type of meal" },
                                items: {
                                    type: "array",
                                    description: "Food items in this meal",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string", description: "Food name, e.g. 'Chicken Breast (100g)'" },
                                            calories: { type: "number", description: "Calories" },
                                            protein: { type: "number", description: "Protein in grams" },
                                            carbs: { type: "number", description: "Carbohydrates in grams" },
                                            fat: { type: "number", description: "Fat in grams" },
                                            category: { type: "string", description: "Category like Protein, Carbs, Vegetables" }
                                        },
                                        required: ["name", "calories", "protein", "carbs", "fat"]
                                    }
                                }
                            },
                            required: ["mealType", "items"]
                        }
                    }
                },
                required: ["name", "goal", "meals"]
            }
        }
    }
];

// ─── Chat Route ───────────────────────────────────────────────────────────────

router.post("/chat", protectRoute, async (req, res) => {
    try {
        const { message, chatId } = req.body;
        const userId = req.user?.id;

        if (!message) return res.status(400).json({ error: "Message is required" });
        if (!userId) return res.status(401).json({ error: "Please log in to use the chatbot." });

        // 1. Get or Create Chat History
        let activeChatId = chatId;
        if (!activeChatId) {
            const newChat = new ChatHistory({ userId, title: message.substring(0, 35) + "...", lastMessage: message });
            await newChat.save();
            activeChatId = newChat._id;
        } else {
            await ChatHistory.findByIdAndUpdate(activeChatId, { lastMessage: message });
        }

        await Message.create({ chatId: activeChatId, sender: 'user', text: message });

        // 2. Build message history
        // Fetch only the 4 most recent messages to stay under Groq's 6000 TPM limit
        let previousMessages = await Message.find({ chatId: activeChatId }).sort({ createdAt: -1 }).limit(4);
        previousMessages = previousMessages.reverse();

        // 3. Proactively gather Context-Aware Memory for the AI
        let contextString = "";
        try {
            const patient = await Patient.findOne({ userId });
            if (patient) {
                const bmi = (patient.weight && patient.height) ? (patient.weight / ((patient.height/100)**2)).toFixed(1) : "Unknown";
                contextString += `\n[PATIENT PROFILE]: Age: ${patient.age}, Gender: ${patient.gender}, Weight: ${patient.weight}kg, Height: ${patient.height}cm, BMI: ${bmi}`;
                if (patient.medicalConditions?.length) {
                    contextString += `\n[MEDICAL CONDITIONS]: ${patient.medicalConditions.join(", ")}`;
                }

                // Fetch last 5 recent AI analyzed reports
                const reports = await Report.find({ patientId: patient._id }).sort({ createdAt: -1 }).limit(5);
                if (reports.length > 0) {
                    contextString += `\n[PATIENT MEDICAL RECORDS (REPORTS)]:\n`;
                    reports.forEach((r, i) => {
                        contextString += `  - Record ${i+1}: ${r.title} | Status: ${r.recordStatus ? r.recordStatus.toUpperCase() : 'ACTIVE'} | Diagnosis: ${r.diagnosis || 'None'} | Prescriptions: ${r.prescription || 'None'}\n`;
                    });
                }
            }

            // Fetch last 2 recent workouts
            const recentWorkouts = await WorkoutHistory.find({ userId }).sort({ date: -1 }).limit(2);
            if (recentWorkouts.length > 0) {
                contextString += `\n[RECENT WORKOUTS]:\n`;
                recentWorkouts.forEach((w, i) => {
                    contextString += `  - Workout ${i+1}: ${w.name} (Duration: ${Math.round(w.duration / 60)} mins)\n`;
                });
            }
        } catch (err) {
            console.error("Context gathering error:", err);
        }

        const openAiMessages = [
            {
                role: "system",
                content: `You are a professional healthcare and fitness AI assistant. Your primary role is to have a natural, helpful conversation with the user.

══════════════════════════════════════════════
USER'S LIVE HEALTH CONTEXT (BACKGROUND MEMORY):
══════════════════════════════════════════════
${contextString || "No context provided yet. Assume a general user."}

══════════════════════════════════════════════
CRITICAL CONVERSATION RULES (MUST OBEY):
══════════════════════════════════════════════
1. BE NATURAL: Do NOT announce that you have retrieved their profile or records. NEVER repeat their height, weight, or age back to them unprompted. Use this knowledge silently.
2. DO NOT BE PUSHY: If the user just says "hi" or asks a general question, just greet them normally. Do NOT immediately ask for their fitness goals or try to force them to create a workout/diet plan. Wait for them to explicitly ask for a plan.
3. NO MEDICAL DIAGNOSIS: NEVER diagnose a disease or suggest what illness a user might have. If they mention symptoms, call get_available_doctors.

══════════════════════════════════════════════
IF (AND ONLY IF) THE USER EXPLICITLY ASKS FOR A WORKOUT OR DIET PLAN, FOLLOW THIS WORKFLOW:
══════════════════════════════════════════════
STEP 1: If you don't know their fitness goal (e.g. lose weight, build muscle) or fitness level, ask for it simply.
STEP 2: Generate the full plan clearly using rich Markdown formatting for excellent readability.
- Use **bold headers** for each meal or workout day.
- MUST use **Markdown Tables** for all plans.
- For diet plans, use this table format for each meal:
  | Food Item | Calories (kcal) | Protein (g) | Carbs (g) | Fat (g) |
  |---|---|---|---|---|
  | Chicken | 150 | 25 | 0 | 5 |
- For workout plans, use this table format:
  | Exercise | Sets | Reps/Time | Rest |
  |---|---|---|---|
  | Push-ups | 3 | 10-12 | 60s |
- 🚨 CALORIE & MACRO RULES: For muscle gain, aim for 2800-3500 kcal and max 200g protein. For weight loss, aim for 1800-2200 kcal.
- End EVERY plan preview with: "Would you like to modify anything, or shall I save this plan to your account? ✅"
STEP 4: ONLY call create_workout_plan or create_diet_plan when the user explicitly confirms (e.g. "save it", "looks good"). After saving, confirm it's saved.`
            }
        ];

        previousMessages.forEach(msg => {
            openAiMessages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text });
        });

        // 3. First AI call with tools
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: openAiMessages,
            tools,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;
        let finalReplyText = responseMessage.content;

        // 4. Agentic loop — handle all tool calls
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            openAiMessages.push(responseMessage);

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                let args = {};
                try { args = JSON.parse(toolCall.function.arguments || "{}"); } catch (_) {}

                let functionResult = "";
                if (functionName === "get_available_doctors") {
                    functionResult = await getAvailableDoctors();
                } else if (functionName === "create_workout_plan") {
                    functionResult = await createWorkoutPlan(userId, args);
                } else if (functionName === "create_diet_plan") {
                    functionResult = await createDietPlan(userId, args);
                }

                openAiMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResult,
                });
            }

            // Final response after tool results
            const finalResponse = await openai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: openAiMessages,
            });
            finalReplyText = finalResponse.choices[0].message.content;
        }

        // 5. Save bot reply
        await Message.create({ chatId: activeChatId, sender: 'bot', text: finalReplyText });
        await ChatHistory.findByIdAndUpdate(activeChatId, { lastMessage: finalReplyText });

        return res.json({ reply: finalReplyText, chatId: activeChatId });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong with the AI assistant" });
    }
});

// ─── History Routes ────────────────────────────────────────────────────────────

router.get("/history", protectRoute, async (req, res) => {
    try {
        const histories = await ChatHistory.find({ userId: req.user?.id }).sort({ updatedAt: -1 });
        res.json(histories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

router.get("/history/:chatId", protectRoute, async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

router.delete("/history/:chatId", protectRoute, async (req, res) => {
    try {
        await ChatHistory.findOneAndDelete({ _id: req.params.chatId, userId: req.user.id });
        await Message.deleteMany({ chatId: req.params.chatId });
        res.json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete chat" });
    }
});

export default router;
