import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import { Patient } from '../models/patient.model.js';
import { MedicalRecord } from '../models/medicalRecord.model.js';
import { Doctor } from '../models/doctor.model.js';
import { ChatHistory } from '../models/chatHistory.model.js';
import { Message } from '../models/messages.model.js';
import { Workout } from '../models/workout.model.js';
import { DietPlan } from '../models/dietPlan.model.js';
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
            name: "get_patient_profile",
            description: "Get the user's age, weight, height, and existing medical conditions. Call this before creating any plan to personalise it.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "get_medical_records",
            description: "Get the user's recent medical records including vitals, pain levels, and mobility.",
            parameters: { type: "object", properties: {} }
        }
    },
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
        const previousMessages = await Message.find({ chatId: activeChatId }).sort({ createdAt: 1 }).limit(12);

        const openAiMessages = [
            {
                role: "system",
                content: `You are a professional healthcare AI assistant. You can create personalised workout and diet plans and save them to the user's account.

══════════════════════════════════════════════
PLAN CREATION WORKFLOW — FOLLOW THIS EXACTLY:
══════════════════════════════════════════════

STEP 1 — GATHER INFO:
- Call get_patient_profile first. 
- If profile exists: use it to personalise the plan.
- If NO profile: ask the user in ONE message for: Age, Weight (kg), Height (cm), Fitness goal (lose weight / build muscle / maintenance), Fitness level (beginner / intermediate / advanced), and any injuries or conditions to avoid.

STEP 2 — SHOW THE PLAN (DO NOT SAVE YET):
- Generate the full plan and display it clearly to the user in a readable format.
- For workout plans: list each exercise with sets, reps, and rest time.
- For diet plans: list each meal (Breakfast / Lunch / Dinner / Snack) with food items and their calories/macros. Show daily totals.
- End EVERY plan preview with this exact line: "Would you like to modify anything, or shall I save this plan to your account? ✅"
- ⚠️ DO NOT call create_workout_plan or create_diet_plan at this step.

STEP 3 — HANDLE MODIFICATIONS:
- If the user asks to change something (e.g. "replace X with Y", "remove the snack", "add more protein"): update the plan and show the full revised plan again.
- End the revised plan with: "Here is the updated plan. Shall I save it now? ✅"
- ⚠️ DO NOT call create_workout_plan or create_diet_plan yet.

STEP 4 — SAVE ONLY ON APPROVAL:
- ONLY call create_workout_plan or create_diet_plan when the user explicitly says something like: "yes", "save it", "looks good", "add it", "perfect", "go ahead".
- After saving, confirm: "✅ Your plan has been saved! You can view and manage it on the [Workouts / Diet] page."

══════════════════════════════════════════════
CRITICAL RULES:
══════════════════════════════════════════════
- NEVER diagnose a disease or suggest what illness a user might have.
- If a user mentions symptoms, call get_available_doctors to find the right specialist.
- Be friendly, clear, and encouraging.`
            }
        ];

        previousMessages.forEach(msg => {
            openAiMessages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text });
        });

        // 3. First AI call with tools
        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
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
                if (functionName === "get_patient_profile") {
                    functionResult = await getPatientProfile(userId);
                } else if (functionName === "get_medical_records") {
                    functionResult = await getMedicalRecords(userId);
                } else if (functionName === "get_available_doctors") {
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
                model: "llama-3.1-8b-instant",
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

export default router;
