import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FileText, Download, Activity, HeartPulse, Scale, Flame, Upload, FileUp, PlusCircle } from "lucide-react";

export default function Reports() {
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [profileRes, reportsRes] = await Promise.all([
        axios.get("/api/profile"),
        axios.get("/api/reports")
      ]);
      setProfile(profileRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      console.error("Failed to load report data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      alert("Please upload a valid PDF or Image file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await axios.post("/api/reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Medical document successfully analyzed and saved!");
      await fetchData(); // Refresh reports
    } catch (err) {
      console.error("Upload failed", err);
      alert(err.response?.data?.message || "Failed to process the document.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleStatusToggle = async (reportId, newStatus) => {
    try {
      await axios.put(`/api/reports/${reportId}/status`, { recordStatus: newStatus });
      // Update local state directly to avoid a full re-fetch or simply re-fetch
      setReports(reports.map(r => r._id === reportId ? { ...r, recordStatus: newStatus } : r));
    } catch (err) {
      console.error("Failed to update status", err);
      alert(err.response?.data?.message || "Failed to update record status.");
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "N/A";
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const patient = profile?.patient || {};
  const user = profile?.user || {};
  const bmi = calculateBMI(patient.weight, patient.height);

  return (
    <div className="max-w-6xl mx-auto p-6 text-white animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="text-blue-500" />
            Health & Activity Report
          </h1>
          <p className="text-gray-400 mt-2">Comprehensive overview of your health metrics and AI-extracted medical records.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept="application/pdf,image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-lg ${uploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileUp size={18} />
            )}
            {uploading ? "Analyzing Document..." : "Upload Medical Document"}
          </button>
          
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition cursor-not-allowed opacity-70">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Patient Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Personal Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="font-medium">{user.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Age</span>
              <span className="font-medium">{patient.age || "N/A"} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gender</span>
              <span className="font-medium capitalize">{patient.gender || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Vital Metrics Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <Activity size={20} className="text-green-400" />
            Vital Metrics
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Scale size={16} /> BMI
              </div>
              <span className="font-bold text-lg text-blue-400">{bmi}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Height: {patient.height || "-"} cm</span>
              <span>Weight: {patient.weight || "-"} kg</span>
            </div>
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <HeartPulse size={20} className="text-red-400" />
            Medical Profile
          </h2>
          {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.medicalConditions.map((condition, idx) => (
                <span key={idx} className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-sm">
                  {condition}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">No known medical conditions reported.</p>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Flame className="text-orange-500" />
          System Analysis
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          Based on the provided health profile, your Body Mass Index (BMI) indicates a reading of <strong className="text-white">{bmi}</strong>. 
          {bmi !== "N/A" && (
            <span>
              {bmi < 18.5 ? " This is considered underweight. A balanced, nutrient-rich diet is recommended."
              : bmi < 25 ? " This falls within the healthy normal weight range. Keep up the good work!"
              : bmi < 30 ? " This falls in the overweight range. Regular exercise and a balanced diet can help improve your metrics."
              : " This falls in the obese range. We recommend consulting with your primary care doctor for a personalized health plan."}
            </span>
          )}
        </p>
        <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg text-blue-200 text-sm">
          <strong>Note:</strong> This report is generated automatically based on your profile data. Always consult with a healthcare professional for accurate medical advice.
        </div>
      </div>

      {/* AI Analyzed Documents Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-emerald-400" />
            AI-Analyzed Medical Documents
          </h2>
        </div>

        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <div key={report._id} className="bg-[#2A2B3D] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-blue-300">Document {reports.length - index}: {report.title}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md mt-2 inline-block">
                      {report.reportType}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                    
                    {/* Status Toggle */}
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                      <button 
                        onClick={() => handleStatusToggle(report._id, 'active')}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${(!report.recordStatus || report.recordStatus === 'active') ? 'bg-red-500/20 text-red-400 font-medium' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        Active
                      </button>
                      <button 
                        onClick={() => handleStatusToggle(report._id, 'fixed')}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${(report.recordStatus === 'fixed') ? 'bg-green-500/20 text-green-400 font-medium' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        Fixed
                      </button>
                    </div>
                  </div>
                </div>
                
                {report.diagnosis && report.diagnosis !== 'N/A' && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Diagnosis</h4>
                    <p className="text-sm text-gray-200">{report.diagnosis}</p>
                  </div>
                )}
                
                {report.prescription && report.prescription !== 'N/A' && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Prescription</h4>
                    <div className="p-3 bg-black/20 rounded-lg text-sm text-gray-300 border border-white/5">
                      {report.prescription}
                    </div>
                  </div>
                )}

                {report.description && report.description !== 'N/A' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Summary</h4>
                    <p className="text-sm text-gray-400 italic">"{report.description}"</p>
                  </div>
                )}

                {report.fileUrl && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <a 
                      href={report.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <FileText size={16} />
                      View Original Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <Upload className="text-gray-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No documents analyzed yet</h3>
            <p className="text-gray-500 text-sm max-w-md">
              Upload your medical prescriptions or lab reports as a PDF or Image. Our AI will automatically extract and organize the diagnosis, prescriptions, and summaries for you.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-sm font-medium transition"
            >
              <PlusCircle size={16} />
              Upload First Document
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
