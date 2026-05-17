import mongoose from 'mongoose';

const exerciseLogSchema = new mongoose.Schema({
    patientId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: { type: Date, default: Date.now },
    exercises: [{
        name: String,
        sets: Number,
        reps: Number,
        duration: Number,  /// in minutes
        caloriesBurned: Number
    }],
    

},{timestamps:true })

export const ExerciseLog = mongoose.model('ExerciseLog', exerciseLogSchema)