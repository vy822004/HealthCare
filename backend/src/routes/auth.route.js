import express from 'express';
import { Login, Signup, Logout } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.midlleware.js';


const router = express.Router();

// Public routes
router.post('/login',Login);
router.post('/signup',Signup);

// Protected route for logout
router.post('/logout',protectRoute,Logout);


export default router;
