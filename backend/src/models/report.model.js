import mongoose from 'mongoose';


const reportSchema = new mongoose.Schema({
    patientId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    title: {
        type: String,
        required: true, ///eg blood test, x-ray report etc
    },
    description: String,
    prescription: String,
    diagnosis: String,
    reportType :{
        type: String,
        enum:['lab','diagnosis','prescription','discharge'],
        default:'diagnosis'
    },
    fileUrl: String,  /// if there's an actual file associated with the report
    status :{
        type: String,
        enum: ['draft','final'],
        default: 'final'
    },
},{
    timestamps:true
})

export const Report = mongoose.model('Report', reportSchema)