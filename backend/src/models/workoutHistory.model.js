import mongoose from 'mongoose';

const completedSetSchema = new mongoose.Schema({
    weight: { type: Number, default: 0 },
    reps: { type: Number, default: 0 }
});

const completedExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: [completedSetSchema]
});

const workoutHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
    name: { type: String, required: true },
    duration: { type: Number, required: true }, // in seconds
    exercises: [completedExerciseSchema],
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export const WorkoutHistory = mongoose.model('WorkoutHistory', workoutHistorySchema);
