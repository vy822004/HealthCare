import React, { useState } from "react";
import {doctors, myAppointments} from "../assets/assets";

const Appointment = () => {
  const [search, setSearch] = useState("");

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

        <span
          className={`
            inline-block
            mt-4
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
    </div>
  );
};

export default Appointment;