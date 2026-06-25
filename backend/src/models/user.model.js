import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role :{
        type: String,
        enum: ['doctor', 'user','admin'],
        required:true,
        default: 'user'
    },
    isVerified:{ type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

export const User = mongoose.model('User', userSchema);
