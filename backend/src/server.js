import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.route.js';
import exerciseRoutes from './routes/exercise.route.js';
import profileRoutes from './routes/getSetProfile.route.js';
import chatbotRoutes from './chatbot.server/chatbot.js';
import workoutRoutes from './routes/workout.route.js';
import dietRoutes from './routes/dietPlan.route.js';
import dontenv from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from "./config/db.js";
import cors from "cors";


const app= express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser());

dontenv.config();
const PORT = process.env.PORT || 3000;





app.get('/',(req,res)=>{
    res.send("Hello World");
    console.log("Hello World");

})
app.use('/api/auth/',authRoutes);
app.use('/api/exercises/',exerciseRoutes);
app.use('/api/profile/',profileRoutes);
app.use('/api/chatbot/',chatbotRoutes);
app.use('/api/workouts/',workoutRoutes);
app.use('/api/diet/',dietRoutes);
connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})