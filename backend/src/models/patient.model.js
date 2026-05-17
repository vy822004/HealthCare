import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    age: Number,
    gender: {
        type: String,
        enum: ['male','female','other'],
    },
    height : Number,   /// in cm
    weight : Number,  // in kg
    conditions: [String],   //// like diabetes, hypertension etc
    createdAt: { type: Date, default: Date.now },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }

})

export const Patient = mongoose.model('Patient', patientSchema)