import express from 'express';
import { fullBody,lowerBody, } from '../controllers/exercise.controller.js';



const router = express.Router();


router.get('/fullbody',fullBody);


export default router;