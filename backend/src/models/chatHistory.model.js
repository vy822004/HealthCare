import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    title: {
        type: String,
        default: 'New Chat'
    },

    lastMessage: {
        type: String
    }

}, { timestamps: true });

export const ChatHistory = mongoose.model(
    'ChatHistory',
    chatHistorySchema
);