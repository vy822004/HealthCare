import doctor1 from "./doctors/doctor1.png";
import doctor2 from "./doctors/doctor2.png";
import doctor3 from "./doctors/doctor3.png";
import doctor4 from "./doctors/doctor4.png";
import doctor5 from "./doctors/doctor5.png";
import doctor6 from "./doctors/doctor6.png";
import doctor7 from "./doctors/doctor7.png";
import doctor8 from "./doctors/doctor8.png";

export const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    experience: 12,
    rating: 4.9,
    fee: 1200,
    available: true,
    image: doctor1,
    hospital: "Apollo Hospital",
    location: "Delhi",
  },

  {
    id: 2,
    name: "Dr. Michael Chen",
    specialization: "Dermatologist",
    experience: 8,
    rating: 4.8,
    fee: 900,
    available: true,
    image: doctor2,
    hospital: "Fortis Hospital",
    location: "Mumbai",
  },

  {
    id: 3,
    name: "Dr. Emily Davis",
    specialization: "Neurologist",
    experience: 15,
    rating: 4.9,
    fee: 1800,
    available: false,
    image: doctor3,
    hospital: "Max Healthcare",
    location: "Bangalore",
  },

  {
    id: 4,
    name: "Dr. James Wilson",
    specialization: "Orthopedic",
    experience: 10,
    rating: 4.7,
    fee: 1100,
    available: true,
    image: doctor4,
    hospital: "Medanta",
    location: "Gurgaon",
  },

  {
    id: 5,
    name: "Dr. Priya Sharma",
    specialization: "Pediatrician",
    experience: 9,
    rating: 4.8,
    fee: 1000,
    available: true,
    image: doctor5,
    hospital: "AIIMS",
    location: "Delhi",
  },

  {
    id: 6,
    name: "Dr. Robert Brown",
    specialization: "General Physician",
    experience: 18,
    rating: 5.0,
    fee: 700,
    available: true,
    image: doctor6,
    hospital: "Manipal Hospital",
    location: "Pune",
  },

  {
    id: 7,
    name: "Dr. Ananya Verma",
    specialization: "Gynecologist",
    experience: 11,
    rating: 4.8,
    fee: 1300,
    available: true,
    image: doctor7,
    hospital: "Cloudnine Hospital",
    location: "Noida",
  },

  {
    id: 8,
    name: "Dr. David Miller",
    specialization: "Psychiatrist",
    experience: 14,
    rating: 4.9,
    fee: 1500,
    available: false,
    image: doctor8,
    hospital: "NIMHANS",
    location: "Bangalore",
  },
];

export const myAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    date: "2026-06-10",
    time: "10:00 AM",
    status: "Upcoming",
  },
  {
    id: 2,
    doctor: "Dr. Priya Sharma",
    specialization: "Pediatrician",
    date: "2026-05-25",
    time: "04:00 PM",
    status: "Completed",
  },
];