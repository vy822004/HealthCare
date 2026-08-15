import React, { useState, useEffect } from "react";
import axios from "axios";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientModal, setPatientModal] = useState({ isOpen: false, data: null, loading: false });
  const [writePrescriptionModal, setWritePrescriptionModal] = useState({ isOpen: false, patientId: null });
  const [prescriptionForm, setPrescriptionForm] = useState({ diagnosis: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("/api/appointments/doctor-appointments");
      setAppointments(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      // If it's a 404, it might mean the user is not a doctor
      if (err.response && err.response.status === 404) {
          setError("You do not have a doctor profile.");
      } else {
          setError("Failed to fetch appointments.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/appointments/update-status/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  const handleViewProfile = async (patientId) => {
    if (!patientId) {
        alert("Patient profile not available.");
        return;
    }
    setPatientModal({ isOpen: true, data: null, loading: true });
    try {
      const res = await axios.get(`/api/appointments/patient-profile/${patientId}`);
      setPatientModal({ isOpen: true, data: res.data, loading: false });
    } catch (err) {
      console.error("Failed to fetch patient profile:", err);
      setPatientModal({ isOpen: false, data: null, loading: false });
      alert("Failed to load patient profile.");
    }
  };

  const handleWritePrescription = (appointmentId, patientId) => {
    setWritePrescriptionModal({ isOpen: true, appointmentId, patientId });
    setPrescriptionForm({ diagnosis: "", notes: "" });
  };

  const submitPrescription = async () => {
    if (!prescriptionForm.diagnosis || !prescriptionForm.notes) {
      alert("Please fill out both diagnosis and prescription notes.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post("/api/reports/prescribe", {
        patientUserId: writePrescriptionModal.patientId,
        appointmentId: writePrescriptionModal.appointmentId,
        diagnosis: prescriptionForm.diagnosis,
        prescriptionNotes: prescriptionForm.notes
      });
      alert("Prescription generated successfully! The patient can now download it.");
      setWritePrescriptionModal({ isOpen: false, patientId: null, appointmentId: null });
      fetchAppointments(); // Refresh the appointments to update the 'isPrescribed' status
    } catch (err) {
      console.error(err);
      alert("Failed to generate prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
      return <div className="p-8 text-white">Loading appointments...</div>;
  }

  if (error) {
      return (
          <div className="p-8 text-white flex flex-col items-center justify-center min-h-[50vh]">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
              <p className="text-white/70">{error}</p>
          </div>
      );
  }

  return (
    <div className="p-8 text-white">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Doctor Dashboard
        </h1>
        <p className="text-white/60 mt-2">
          Manage your patients and upcoming appointments.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
        <h2 className="text-2xl font-semibold mb-6">Patient Appointments</h2>
        
        {appointments.length === 0 ? (
            <p className="text-white/60">No appointments found.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/20 text-white/70">
                            <th className="py-4 px-4 font-medium">Patient Name</th>
                            <th className="py-4 px-4 font-medium">Date & Time</th>
                            <th className="py-4 px-4 font-medium">Status</th>
                            <th className="py-4 px-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment.id} className="border-b border-white/10 hover:bg-white/5 transition">
                                <td className="py-4 px-4">
                                    <p className="font-semibold">{appointment.patientName}</p>
                                    <p className="text-sm text-white/50">{appointment.patientEmail}</p>
                                </td>
                                <td className="py-4 px-4">
                                    <p>{appointment.date}</p>
                                    <p className="text-sm text-white/70">{appointment.time}</p>
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            appointment.status === "Upcoming"
                                                ? "bg-blue-500/20 text-blue-400"
                                                : appointment.status === "Completed"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                        }`}
                                    >
                                        {appointment.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 flex flex-wrap items-center gap-3">
                                    <select
                                        value={appointment.status}
                                        onChange={(e) => handleUpdateStatus(appointment.id, e.target.value)}
                                        className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button 
                                        onClick={() => handleViewProfile(appointment.patientUserId)}
                                        className="bg-blue-600 hover:bg-blue-700 text-xs px-4 py-2 rounded-lg font-medium transition shadow-lg"
                                    >
                                        View Profile
                                    </button>
                                    {appointment.status === 'Completed' && !appointment.isPrescribed && (
                                        <button 
                                            onClick={() => handleWritePrescription(appointment.id, appointment.patientUserId)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 py-2 rounded-lg font-medium transition shadow-lg flex items-center gap-1"
                                        >
                                            📝 Prescribe
                                        </button>
                                    )}
                                    {appointment.isPrescribed && (
                                        <span className="text-xs text-emerald-400 font-medium px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1">
                                            ✅ Prescribed
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Patient Profile Modal */}
      {patientModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <button 
                onClick={() => setPatientModal({ isOpen: false, data: null, loading: false })}
                className="absolute top-4 right-5 text-white/50 hover:text-white transition text-2xl font-bold"
            >
                &times;
            </button>

            <h3 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Patient Details</h3>
            
            {patientModal.loading ? (
                <div className="py-10 flex flex-col items-center justify-center text-white/60">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading patient records...</p>
                </div>
            ) : patientModal.data ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-5 mb-6 bg-white/5 p-4 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                            {patientModal.data.user?.profilePic ? (
                                <img src={patientModal.data.user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl">👤</span>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold">{patientModal.data.user?.name}</h4>
                            <p className="text-sm text-blue-300">{patientModal.data.user?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Age</p>
                            <p className="font-semibold text-lg">{patientModal.data.patient?.age || "N/A"}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Gender</p>
                            <p className="font-semibold text-lg capitalize">{patientModal.data.patient?.gender || "N/A"}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Height</p>
                            <p className="font-semibold text-lg">{patientModal.data.patient?.height ? `${patientModal.data.patient.height} cm` : "N/A"}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Weight</p>
                            <p className="font-semibold text-lg">{patientModal.data.patient?.weight ? `${patientModal.data.patient.weight} kg` : "N/A"}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mt-4">
                        <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Known Medical Conditions</p>
                        <div className="flex flex-wrap gap-2">
                            {patientModal.data.patient?.conditions && patientModal.data.patient.conditions.length > 0 ? (
                                patientModal.data.patient.conditions.map((c, i) => (
                                    <span key={i} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-500/30">
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-white/70 italic">No conditions reported by patient.</p>
                            )}
                        </div>
                    </div>

                    {/* Reports Section */}
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mt-4">
                        <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Reports & Diagnosis</p>
                        {patientModal.data.reports && patientModal.data.reports.length > 0 ? (
                            <div className="space-y-3">
                                {patientModal.data.reports.map((report) => (
                                    <div key={report._id} className="bg-black/30 p-4 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-sm text-blue-300">{report.title}</p>
                                                <span className="text-[10px] uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                    {report.reportType}
                                                </span>
                                            </div>
                                            {report.fileUrl && (
                                                <a 
                                                    href={report.fileUrl.replace(/\.pdf$/i, '.jpg')} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                                                >
                                                    View Document
                                                </a>
                                            )}
                                        </div>
                                        {report.description && <p className="text-xs text-white/70 mt-2 italic">"{report.description}"</p>}
                                        {report.diagnosis && (
                                            <div className="mt-2">
                                                <p className="text-[10px] text-white/50 uppercase">Diagnosis</p>
                                                <p className="text-xs text-red-300">{report.diagnosis}</p>
                                            </div>
                                        )}
                                        {report.prescription && (
                                            <div className="mt-2">
                                                <p className="text-[10px] text-white/50 uppercase">Prescription</p>
                                                <p className="text-xs text-green-300">{report.prescription}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-white/70 italic">No reports available.</p>
                        )}
                    </div>

                    {/* Medical Records Section */}
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mt-4">
                        <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Medical Records (Vitals)</p>
                        {patientModal.data.medicalRecords && patientModal.data.medicalRecords.length > 0 ? (
                            <div className="space-y-3">
                                {patientModal.data.medicalRecords.map((record) => (
                                    <div key={record._id} className="bg-black/30 p-3 rounded-xl border border-white/10">
                                        {record.condition && <p className="font-semibold text-sm mb-1">{record.condition}</p>}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <p><span className="text-white/50">Pain Level:</span> {record.painLevel || "N/A"}/10</p>
                                            <p><span className="text-white/50">Mobility:</span> <span className="capitalize">{record.mobility || "N/A"}</span></p>
                                            {record.vitals && (
                                                <>
                                                    <p><span className="text-white/50">BP:</span> {record.vitals.bloodPressure || "N/A"}</p>
                                                    <p><span className="text-white/50">Heart Rate:</span> {record.vitals.heartRate ? `${record.vitals.heartRate} bpm` : "N/A"}</p>
                                                    <p><span className="text-white/50">Temp:</span> {record.vitals.temperature ? `${record.vitals.temperature}°C` : "N/A"}</p>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-white/40 mt-2 text-right">
                                            {new Date(record.recordedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-white/70 italic">No medical records available.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="py-10 text-center text-red-400 font-medium">Failed to load patient data.</div>
            )}
          </div>
        </div>
      )}

      {/* Write Prescription Modal */}
      {writePrescriptionModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-4 text-emerald-400 border-b border-white/10 pb-3">
                Write Prescription
            </h3>
            <p className="text-white/60 text-sm mb-6">
                This will automatically generate a downloadable PDF prescription and save it to the patient's reports.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-white/70 mb-2">Diagnosis</label>
                    <input
                        type="text"
                        value={prescriptionForm.diagnosis}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                        placeholder="E.g., Acute Bronchitis"
                        className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-2">Prescription & Advice</label>
                    <textarea
                        value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                        placeholder="E.g., 1. Amoxicillin 500mg twice daily for 7 days.&#10;2. Drink plenty of fluids.&#10;3. Rest for 3 days."
                        rows={5}
                        className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-white resize-none"
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setWritePrescriptionModal({ isOpen: false, patientId: null })}
                className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={submitPrescription}
                disabled={isSubmitting}
                className={`flex-1 py-3 rounded-xl font-semibold transition shadow-lg ${
                    isSubmitting ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isSubmitting ? "Generating PDF..." : "Generate PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
