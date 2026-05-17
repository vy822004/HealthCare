import dotenv from "dotenv";
import OpenAI from "openai";
import express from "express";

const router = express.Router();

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


