import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { GenerateToken } from '../libs/utils.js';

dotenv.config();
const router = express.Router();


export const Login = async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"Email and password are required"});
    }
    // Check if user exists in database
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message:"Invalid email or password"});
    }
    const passwordMatch = await bcrypt.compare(password,user.password);
    if((!passwordMatch)){
        return res.status(400).json({message:"Invalid email or password"});
    }
    // JWT Token
    const token = GenerateToken(user);
    res.cookie('token',token,{
                httpOnly:true,
                secure:false,
                sameSite:'strict',
                maxAge:3600000,
    }).json({message:"User created successfully",token});


};
export const Signup = async(req,res)=>{
    const {name,email,password} = req.body;
    if(!email || !password || !name){
        return res.status(400).json({message:"Email, password, and name are required"});
    }
    // check if user already exist in database
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:"User already exists"});
    }
     const salt= await bcrypt.genSalt(10);
     const hashedPassword= await bcrypt.hash(password,salt);
        // create user
        const newUser = new User({
            name,
            email,
            password:hashedPassword,
        })
    // create new user in database
    await newUser.save();
    // create JWT token
            const token = GenerateToken(newUser);
            res.cookie('token',token,{
                httpOnly:true,
                secure:false,
                sameSite:'strict',
                maxAge:3600000,
            }).json({message:"User created successfully",token});
};

export const Logout = (req,res)=>{
    res.clearCookie('token').json({message:"User logged out successfully"});
}


export default router;
