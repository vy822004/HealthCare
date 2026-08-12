import express from 'express';
import { getDoctors, bookAppointment, getAppointments, cancelAppointment, getDoctorAppointments, updateAppointmentStatus, getPatientProfileForDoctor } from '../controllers/appointment.controller.js';
import { protectRoute } from '../middlewares/auth.midlleware.js';

const router = express.Router();

router.get('/doctors', protectRoute, getDoctors);
router.post('/book', protectRoute, bookAppointment);
router.get('/my-appointments', protectRoute, getAppointments);
router.delete('/cancel/:id', protectRoute, cancelAppointment);

// Doctor specific routes
router.get('/doctor-appointments', protectRoute, getDoctorAppointments);
router.patch('/update-status/:id', protectRoute, updateAppointmentStatus);
router.get('/patient-profile/:patientId', protectRoute, getPatientProfileForDoctor);

export default router;
