import express from "express";

const router = express.Router();

export const fullBody = (req, res) => {
  res.status(200).json({
    type: "Full Body",
    exercises: [
      "Push-ups",
      "Squats",
      "Plank",
      "Burpees",
      "Lunges"
    ]
  });
};

// Lower Body Workout
export const lowerBody = (req, res) => {
  res.status(200).json({
    type: "Lower Body",
    exercises: [
      "Squats",
      "Lunges",
      "Deadlifts",
      "Calf Raises",
      "Leg Press"
    ]
  });
};

// Upper Body Workout (optional - useful later)
export const upperBody = (req, res) => {
  res.status(200).json({
    type: "Upper Body",
    exercises: [
      "Push-ups",
      "Pull-ups",
      "Shoulder Press",
      "Bicep Curls",
      "Tricep Dips"
    ]
  });
};



export default router;