
import React, { useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const {  email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData
      );
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // 🔥 Uses your global gradient background
    <div className="min-h-screen flex items-center justify-center">
        {/* LEFT TEXT */}
      <h1 className="text-[80px] font-bold text-white/10 m-5">
        JEEVAN
      </h1>

      {/* Card */}
      <div className="w-[320px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 text-center text-white">

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-gray-300 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-gray-300 outline-none"
          />

          <button
                type="submit"
                className="bg-blue-700 text-white py-2 rounded-full 
                 hover:bg-black 
                active:scale-95 
                transition-all duration-150 
                cursor-pointer"
                >
                 Login
                </button>

        </form>

        <p className="text-sm text-gray-300 mt-4">
          Don't have an account? <NavLink to="/signup" className="underline cursor-pointer">Sign Up</NavLink>
        </p>
        {/* RIGHT TEXT */}
     

      </div>
       <h1 className="text-[80px] font-bold text-white/10 m-5">
        CARE
      </h1>
    </div>
  );
};

export default Login;