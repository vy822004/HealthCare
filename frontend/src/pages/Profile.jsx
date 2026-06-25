import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    conditions: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/profile",
        {
          withCredentials: true,
        }
      );

      setUser(res.data.user);

      if (res.data.patient) {
        setPatient(res.data.patient);

        setFormData({
          age: res.data.patient.age || "",
          gender: res.data.patient.gender || "",
          height: res.data.patient.height || "",
          weight: res.data.patient.weight || "",
          conditions:
            res.data.patient.conditions?.join(", ") || "",
        });
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

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
        "http://localhost:3000/api/profile",
        {
          ...formData,
          conditions: formData.conditions
            .split(",")
            .map((item) => item.trim()),
        },
        {
          withCredentials: true,
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

      {/* ACCOUNT INFO */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Account Information
        </h2>

        <div className="space-y-3">
          <p>
            <strong>Name:</strong> {user?.name}
          </p>

          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <p>
            <strong>Role:</strong> {user?.role}
          </p>
        </div>
      </div>

      {/* HEALTH INFO */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
      >
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
              onClick={() => setIsEditing(true)}
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
                onClick={() => {
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;