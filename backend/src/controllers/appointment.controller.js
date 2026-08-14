import { Appointment } from '../models/appointment.model.js';
import { Doctor } from '../models/doctor.model.js';
import { User } from '../models/user.model.js';
import { Patient } from '../models/patient.model.js';
import { MedicalRecord } from '../models/medicalRecord.model.js';
import { Report } from '../models/report.model.js';

export const getDoctors = async (req, res) => {
    try {
        let doctors = await Doctor.find().populate('userId', 'name profilePic');
        
        // Auto-seed if empty for demonstration purposes
        if (doctors.length === 0) {
            console.log("No doctors found, seeding dummy doctors...");
            
            let dummyUsers = await User.find({ email: { $in: ["sanjay@hospital.com", "priya@hospital.com", "rahul@hospital.com", "neha@hospital.com", "vikram@hospital.com", "aarti@hospital.com", "karan@hospital.com", "sneha@hospital.com"] } });
            if (dummyUsers.length === 0) {
                dummyUsers = await User.insertMany([
                    { name: "Dr. Sanjay Gupta", email: "sanjay@hospital.com", password: "password", role: "doctor" },
                    { name: "Dr. Priya Sharma", email: "priya@hospital.com", password: "password", role: "doctor" },
                    { name: "Dr. Sneha Reddy", email: "rahul@hospital.com", password: "password", role: "doctor" },
                    { name: "Dr. Neha Patel", email: "neha@hospital.com", password: "password", role: "doctor" },
                    { name: "Dr. Vikram Singh", email: "vikram@hospital.com", password: "password", role: "doctor" },
                    { name: "Dr. Karan Mehta", email: "aarti@hospital.com", password: "password", role: "doctor" },
                    { name: "Dr. Aarti Desai", email: "karan@hospital.com", password: "password", role: "doctor" },
                    { name: "Dr. Rahul Sharma", email: "sneha@hospital.com", password: "password", role: "doctor" }
                ]);
            }

            const dummyDoctors = [
                { userId: dummyUsers[0]._id, specialization: "Cardiologist", experience: 15, hospital: "Apollo Hospital", licenseNumber: "LIC101" },
                { userId: dummyUsers[1]._id, specialization: "Dermatologist", experience: 8, hospital: "Fortis Clinic", licenseNumber: "LIC102" },
                { userId: dummyUsers[2]._id, specialization: "Neurologist", experience: 12, hospital: "Max Healthcare", licenseNumber: "LIC103" },
                { userId: dummyUsers[3]._id, specialization: "Orthopedic", experience: 10, hospital: "Medanta", licenseNumber: "LIC104" },
                { userId: dummyUsers[4]._id, specialization: "Pediatrician", experience: 9, hospital: "AIIMS", licenseNumber: "LIC105" },
                { userId: dummyUsers[5]._id, specialization: "General Physician", experience: 18, hospital: "Manipal Hospital", licenseNumber: "LIC106" },
                { userId: dummyUsers[6]._id, specialization: "Gynecologist", experience: 11, hospital: "Cloudnine", licenseNumber: "LIC107" },
                { userId: dummyUsers[7]._id, specialization: "Psychiatrist", experience: 14, hospital: "NIMHANS", licenseNumber: "LIC108" }
            ];
            await Doctor.insertMany(dummyDoctors);
            doctors = await Doctor.find().populate('userId', 'name profilePic');
        }

        // Transform the data to match frontend requirements
        const transformedDoctors = doctors.map(doc => ({
            id: doc._id,
            name: doc.userId ? (doc.userId.name.startsWith("Dr.") ? doc.userId.name : `Dr. ${doc.userId.name}`) : `Dr. ${doc.specialization} Specialist`,
            specialization: doc.specialization,
            hospital: doc.hospital || "General Hospital",
            location: "Virtual",
            rating: "4.8", // dummy for now
            experience: doc.experience,
            fee: "500", // dummy
            available: true,
            image: doc.userId && doc.userId.profilePic ? doc.userId.profilePic : "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
        }));

        res.json(transformedDoctors);
    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        res.status(500).json({ error: "Failed to fetch doctors" });
    }
};

export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;
        const userId = req.user.id;

        if (!doctorId || !date || !time) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const appointment = new Appointment({
            userId,
            doctorId,
            date,
            time
        });
        await appointment.save();

        res.status(201).json({ message: "Appointment booked successfully!", appointment });
    } catch (error) {
        console.error("Failed to book appointment:", error);
        res.status(500).json({ error: "Failed to book appointment" });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const appointments = await Appointment.find({ userId })
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

        // Transform for frontend
        const transformed = appointments.map(app => ({
            id: app._id,
            doctor: app.doctorId && app.doctorId.userId ? (app.doctorId.userId.name.startsWith("Dr.") ? app.doctorId.userId.name : `Dr. ${app.doctorId.userId.name}`) : "Unknown Doctor",
            specialization: app.doctorId ? app.doctorId.specialization : "General",
            date: app.date,
            time: app.time,
            status: app.status
        }));

        res.json(transformed);
    } catch (error) {
        console.error("Failed to fetch appointments:", error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const appointment = await Appointment.findOneAndDelete({ _id: id, userId });
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found or unauthorized" });
        }

        res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
        console.error("Failed to cancel appointment:", error);
        res.status(500).json({ error: "Failed to cancel appointment" });
    }
};

export const getDoctorAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let doctor = await Doctor.findOne({ userId });
        if (!doctor) {
            // If user has doctor role but no profile, create a default one
            const user = await User.findById(userId);
            if (user && user.role === 'doctor') {
                doctor = new Doctor({
                    userId,
                    specialization: "General Physician",
                    experience: 5,
                    hospital: "Jeevan Care Hospital",
                    licenseNumber: `LIC${Date.now()}`
                });
                await doctor.save();
            } else {
                return res.status(404).json({ error: "Doctor profile not found" });
            }
        }

        const appointments = await Appointment.find({ doctorId: doctor._id })
            .populate('userId', 'name email profilePic')
            .sort({ createdAt: -1 });

        const transformed = appointments.map(app => ({
            id: app._id,
            patientUserId: app.userId ? app.userId._id : null,
            patientName: app.userId ? app.userId.name : "Unknown Patient",
            patientEmail: app.userId ? app.userId.email : "",
            patientImage: app.userId ? app.userId.profilePic : "",
            date: app.date,
            time: app.time,
            status: app.status,
            isPrescribed: app.isPrescribed
        }));

        res.json(transformed);
    } catch (error) {
        console.error("Failed to fetch doctor appointments:", error);
        res.status(500).json({ error: "Failed to fetch doctor appointments" });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        let doctor = await Doctor.findOne({ userId });
        if (!doctor) {
            const user = await User.findById(userId);
            if (user && user.role === 'doctor') {
                doctor = new Doctor({
                    userId,
                    specialization: "General Physician",
                    experience: 5,
                    hospital: "Jeevan Care Hospital",
                    licenseNumber: `LIC${Date.now()}`
                });
                await doctor.save();
            } else {
                return res.status(403).json({ error: "Only doctors can update appointments" });
            }
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: id, doctorId: doctor._id },
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        res.json({ message: "Appointment updated successfully", appointment });
    } catch (error) {
        console.error("Failed to update appointment:", error);
        res.status(500).json({ error: "Failed to update appointment" });
    }
};

export const getPatientProfileForDoctor = async (req, res) => {
    try {
        const { patientId } = req.params; // this is the User ID of the patient
        const doctorUserId = req.user.id;

        // Verify that the doctor exists
        const doctor = await Doctor.findOne({ userId: doctorUserId });
        if (!doctor) {
            return res.status(403).json({ error: "Access denied. Only doctors can view patient profiles." });
        }

        // Verify that this patient actually has an appointment with this doctor
        const appointmentExists = await Appointment.exists({ doctorId: doctor._id, userId: patientId });
        if (!appointmentExists) {
            return res.status(403).json({ error: "Access denied. You can only view profiles of your patients." });
        }

        const user = await User.findById(patientId).select("-password");
        const patient = await Patient.findOne({ userId: patientId });

        let medicalRecords = [];
        let reports = [];
        if (patient) {
            medicalRecords = await MedicalRecord.find({ patientId: patient._id });
            reports = await Report.find({ patientId: patient._id });
        }

        res.json({ user, patient, medicalRecords, reports });
    } catch (error) {
        console.error("Failed to fetch patient profile:", error);
        res.status(500).json({ error: "Failed to fetch patient profile" });
    }
};
