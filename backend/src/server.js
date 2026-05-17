import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.route.js';
import exerciseRoutes from './routes/exercise.route.js';
import dontenv from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from "./config/db.js";


const app= express();
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

connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})