import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    conditions: "",
    profilePic: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Optional: show some loading state if needed
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setFormData((prev) => ({ ...prev, profilePic: base64Image }));
      
      try {
        await axios.put("/api/profile", { profilePic: base64Image });
        fetchProfile(); // refresh the profile
        window.dispatchEvent(new Event("profileUpdated")); // trigger navbar refresh
      } catch (err) {
        console.error("Failed to upload image", err);
        alert("Failed to upload image. Please try again.");
      }
    };
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profile");
      setUser(res.data.user);
      
      const p = res.data.patient || {};
      const u = res.data.user || {};

      setFormData({
        name: u.name || "",
        email: u.email || "",
        age: p.age || "",
        gender: p.gender || "",
        height: p.height || "",
        weight: p.weight || "",
        conditions: p.conditions?.join(", ") || "",
        profilePic: u.profilePic || "",
      });
      
      if (res.data.patient) {
        setPatient(res.data.patient);
      }
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error.response ? error.response.data : error.message
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        "/api/profile",
        {
          ...formData,
          conditions: formData.conditions
            ? formData.conditions.split(",").map((item) => item.trim())
            : [],
        }
      );

      setIsEditing(false);
      fetchProfile();

      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="text-white p-10">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">
        My Profile
      </h1>

      <form onSubmit={handleSubmit}>
        {/* ACCOUNT INFO */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            Account Information
          </h2>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center">
                {formData.profilePic || user?.profilePic ? (
                  <img src={formData.profilePic || user?.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white/50">👤</span>
                )}
              </div>
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition mt-2 border border-white/10 shadow-sm">
                Change Photo
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-white/60 text-sm mb-1">Name</label>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-60 cursor-not-allowed">
                {user?.name || formData.name}
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Email</label>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-60 cursor-not-allowed">
                {user?.email || formData.email}
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Role</label>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-60 cursor-not-allowed">
                {user?.role}
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* HEALTH INFO */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6">
          Health Information
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <input
            type="number"
            min={0}
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            disabled={!isEditing}
            className="
              p-3 rounded-xl
              bg-white/10
              border border-white/20
              outline-none
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={!isEditing}
            className="
              p-3 rounded-xl
              bg-white/10
              border border-white/20
              outline-none
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            <option value="">Select Gender</option>
            <option value="male" className="text-black">
              Male
            </option>
            <option value="female" className="text-black">
              Female
            </option>
            <option value="other" className="text-black">
              Other
            </option>
          </select>

          <input
            type="number"
            name="height"
            min={0}
            placeholder="Height (cm)"
            value={formData.height}
            onChange={handleChange}
            disabled={!isEditing}
            className="
              p-3 rounded-xl
              bg-white/10
              border border-white/20
              outline-none
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          />

          <input
            type="number"
            name="weight"
            min={0}
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            disabled={!isEditing}
            className="
              p-3 rounded-xl
              bg-white/10
              border border-white/20
              outline-none
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          />
        </div>

        <textarea
          name="conditions"
          placeholder="Medical Conditions (comma separated)"
          value={formData.conditions}
          onChange={handleChange}
          disabled={!isEditing}
          rows={4}
          className="
            w-full mt-5 p-3 rounded-xl
            bg-white/10
            border border-white/20
            outline-none
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        />

        <div className="mt-6 flex gap-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
              className="
                px-6 py-3
                bg-blue-600
                hover:bg-blue-700
                rounded-xl
                font-semibold
                transition
              "
            >
              Update Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="
                  px-6 py-3
                  bg-green-600
                  hover:bg-green-700
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(false);
                  fetchProfile();
                }}
                className="
                  px-6 py-3
                  bg-red-600
                  hover:bg-red-700
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      </form>

      {/* HEALTH SUMMARY */}
      {patient && (
        <div className="mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Current Health Summary
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60">Age</p>
              <h3 className="text-2xl font-bold">
                {patient.age}
              </h3>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60">Height</p>
              <h3 className="text-2xl font-bold">
                {patient.height} cm
              </h3>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60">Weight</p>
              <h3 className="text-2xl font-bold">
                {patient.weight} kg
              </h3>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60">Gender</p>
              <h3 className="text-2xl font-bold capitalize">
                {patient.gender}
              </h3>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 md:col-span-4">
              <p className="text-white/60">Medical Conditions</p>
              <h3 className="text-xl font-bold">
                {patient.conditions && patient.conditions.length > 0 
                  ? patient.conditions.join(", ") 
                  : "None reported"}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;