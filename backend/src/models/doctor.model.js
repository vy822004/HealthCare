import mongoose from 'mongoose' ;

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: {
        type:String,
        required : true
    },
    experience :{
        type:Number,
        default:0
    },
    hospital: String,
    licenseNumber: {
        type: String,
        unique: true,
        required: true
    },
    patients:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }],
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

export const Doctor = mongoose.model('Doctor', doctorSchema)