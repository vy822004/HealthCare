import React, { useState, useEffect } from "react";
import axios from "axios";
import { doctors as staticDoctors } from "../assets/assets.js";

const Appointment = () => {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingModal, setBookingModal] = useState({ isOpen: false, doctorId: null });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "06:00 PM"];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const docsRes = await axios.get("/api/appointments/doctors");
      const fetchedDoctors = docsRes.data.map((doc, index) => ({
        ...doc,
        image: staticDoctors[index % staticDoctors.length].image
      }));
      setDoctors(fetchedDoctors);

      const appsRes = await axios.get("/api/appointments/my-appointments");
      setMyAppointments(appsRes.data);
    } catch (err) {
      console.error("Failed to fetch appointment data:", err);
    } finally {
      setLoading(false);
    }
  }

  const openBookingModal = (doctorId) => {
    setBookingModal({ isOpen: true, doctorId });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
    setSelectedTime("");
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time slot.");
      return;
    }
    try {
      await axios.post("/api/appointments/book", {
        doctorId: bookingModal.doctorId,
        date: selectedDate,
        time: selectedTime
      });
      alert(`Appointment booked for ${selectedDate} at ${selectedTime}!`);
      setBookingModal({ isOpen: false, doctorId: null });
      fetchData(); // refresh appointments
    } catch (err) {
      console.error("Failed to book:", err);
      alert("Failed to book appointment.");
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.delete(`/api/appointments/cancel/${appointmentId}`);
      alert("Appointment cancelled.");
      fetchData();
    } catch (err) {
      console.error("Failed to cancel:", err);
      alert("Failed to cancel appointment.");
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 text-white">
      {/* Header */}
     
      <div className="mb-10">
  <h2 className="text-2xl font-semibold mb-5">
    My Appointments
  </h2>

  <div className="grid md:grid-cols-2 gap-6">
    {myAppointments.length === 0 && !loading && (
      <p className="text-white/60">No upcoming appointments.</p>
    )}
    {myAppointments.map((appointment) => (
      <div
        key={appointment.id}
        className="
          bg-white/10
          backdrop-blur-xl
          border border-white/20
          rounded-2xl
          p-5
        "
      >
        <h3 className="text-lg font-semibold">
          {appointment.doctor}
        </h3>

        <p className="text-blue-300">
          {appointment.specialization}
        </p>

        <div className="mt-3 text-white/70">
          <p>📅 {appointment.date}</p>
          <p>⏰ {appointment.time}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span
            className={`
              inline-block
              px-3 py-1
              rounded-full
              text-sm
              ${
                appointment.status === "Upcoming"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-blue-500/20 text-blue-400"
              }
            `}
          >
            {appointment.status}
          </span>
          <button
            onClick={() => handleCancel(appointment.id)}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
 <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Book Appointment
        </h1>

        <p className="text-white/60 mt-2">
          Find the best doctor for your healthcare needs.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search doctor or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full
            md:w-[500px]
            px-5
            py-3
            rounded-xl
            bg-white/10
            border border-white/20
            backdrop-blur-xl
            outline-none
            placeholder-white/50
          "
        />
      </div>

      {/* Doctors */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="
              bg-white/10
              backdrop-blur-xl
              border border-white/20
              rounded-3xl
              overflow-hidden
              hover:scale-[1.02]
              transition-all
            "
          >
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-full h-64 object-cover"
            />

            <div className="p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {doctor.name}
                </h2>

                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    doctor.available
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {doctor.available
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              <p className="text-blue-300 mt-2">
                {doctor.specialization}
              </p>

              <div className="mt-4 space-y-2 text-white/70">
                <p>
                  🏥 {doctor.hospital}
                </p>

                <p>
                  📍 {doctor.location}
                </p>

                <p>
                  ⭐ {doctor.rating}
                </p>

                <p>
                  👨‍⚕️ {doctor.experience} Years Experience
                </p>

                <p>
                  💰 ₹{doctor.fee}
                </p>
              </div>

              <button
                onClick={() => openBookingModal(doctor.id)}
                disabled={!doctor.available}
                className={`
                  w-full
                  mt-5
                  py-3
                  rounded-xl
                  font-semibold
                  transition
                  ${
                    doctor.available
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 cursor-not-allowed"
                  }
                `}
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Select Date & Time</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-white/70 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-white/70 mb-2">Available Time Slots</label>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                      selectedTime === time
                        ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setBookingModal({ isOpen: false, doctorId: null })}
                className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold transition shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointment;