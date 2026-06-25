import mongoose from 'mongoose';

const workoutExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    primaryMuscles: [String],
    secondaryMuscles: [String],
    sets: { type: Number, default: 0 },
    reps: { type: String, default: '' },
    rest: { type: String, default: '' },
});

const workoutSchema = new mongoose.Schema({
    userId: {
        type: String,  // Using String for now (dummy userId during testing)
        required: true
    },
    name: {
        type: String,
        required: true,
        default: 'My Workout'
    },
    exercises: [workoutExerciseSchema],
}, { timestamps: true });

export const Workout = mongoose.model('Workout', workoutSchema);
