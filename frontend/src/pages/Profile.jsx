import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-6 text-white">

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl hover:scale-105 transition m-5" onClick={() => navigate("/info/personal")}>
          <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
          <p className="text-gray-300 text-sm">
            Check Your personal details, update your profile, and manage your account settings.
          </p>
        </div>

      <div className="grid md:grid-cols-3 gap-6 m-6">



         {/* 🩺 Current Conditions */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl hover:scale-105 transition" onClick={()=>navigate("/info/current")}>
          <h2 className="text-xl font-semibold mb-3">Current Conditions</h2>
          <p className="text-gray-300 text-sm">
            Monitor your current health conditions and medications.
          </p>
        </div>

        {/* 🧾 Medical Reports History */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl hover:scale-105 transition" onClick={()=>navigate("/info/reports")}>
          <h2 className="text-xl font-semibold mb-3">Medical Reports History</h2>
          <p className="text-gray-300 text-sm">
            View and manage your medical reports and test results.
          </p>
        </div>

        {/* 💪 Exercise History */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl hover:scale-105 transition" onClick={()=>navigate("/info/exercises")}>
          <h2 className="text-xl font-semibold mb-3">Exercise History</h2>
          <p className="text-gray-300 text-sm">
            Track your workouts and fitness progress over time.
          </p>
        </div>

       

      </div>

    </div>
  );
};

export default Profile;