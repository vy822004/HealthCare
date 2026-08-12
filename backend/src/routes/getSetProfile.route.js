import { User } from "../models/user.model.js";
import { Patient } from "../models/patient.model.js";
import { protectRoute } from "../middlewares/auth.midlleware.js";
import {getProfile,setProfile} from "../controllers/getSetProfile.controller.js";
import express from 'express';

const router = express.Router();

router.get('/', protectRoute, getProfile);
router.put('/', protectRoute, setProfile);

export default router;