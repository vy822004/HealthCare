import mongoose from 'mongoose';


const medicalRecordSchema = new mongoose.Schema({
    patientId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    condition:String,
    painLevel :{
        type:Number,
        min:1,
        max:10
    },
    mobility :{
        type:String,
        enum: ['low','medium','high']
    },
    vitals :{
        bloodPressure: String,  /// like 120/80
        heartRate: Number, /// in bpm
        temperature: Number ///in celsius
    },
    assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
    },  
    recordedAt: { type: Date, default: Date.now }
})

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema)
