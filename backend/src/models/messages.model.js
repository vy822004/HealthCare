import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatHistory',
        required: true,
        index: true,
    },

    sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },

    text: {
        type: String,
        required: true
    }

}, { timestamps: true });

messageSchema.index({ chatId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);