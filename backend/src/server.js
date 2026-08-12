import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import exerciseRoutes from './routes/exercise.route.js';
import profileRoutes from './routes/getSetProfile.route.js';
import chatbotRoutes from './chatbot.server/chatbot.js';
import workoutRoutes from './routes/workout.route.js';
import dietRoutes from './routes/dietPlan.route.js';
import reportRoutes from './routes/report.route.js';
import dontenv from 'dotenv';
import cookieParser from 'cookie-parser';
import appointmentRoutes from './routes/appointment.route.js';

import connectDB from "./config/db.js";
import cors from "cors";


const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/reports/',reportRoutes);
app.use('/api/appointments/', appointmentRoutes);
connectDB();

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT,()=>{
      console.log(`Server is running on port ${PORT}`)
  });
}

export default app;