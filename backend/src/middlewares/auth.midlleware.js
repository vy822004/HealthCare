import express from 'express';
import cookieParser from 'cookie-parser';

const router = express();




export const protectRoute = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    // Here you would typically verify the token and extract user information
    // For example, using JWT:
    // jwt.verify(token, 'your_secret_key', (err, decoded) => {
    //     if (err) {
    //         return res.status(401).json({ message: "Unauthorized" });
    //     }
    //     req.user = decoded; // Attach user info to request object
    //     next();
    // });
    
    next(); // Call next middleware or route handler
    
}

export default router;