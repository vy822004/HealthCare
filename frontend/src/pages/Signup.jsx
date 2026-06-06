import React, { useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import loginImage from "../assets/login-illustration.png";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { name, email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/signup",
        formData
      );
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div
      className="
        w-full max-w-6xl
        flex flex-col md:flex-row
        overflow-hidden
        rounded-3xl
        border border-white/20
        bg-white/5
        backdrop-blur-md
        shadow-[0_8px_32px_rgba(0,0,0,0.35)]
      "
    >
      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 bg-white/5 flex items-center justify-center ">

  <img
    src={loginImage}
    alt="Healthcare"
    className="w-full h-full object-cover"
  />

      </div>

      {/* RIGHT SIDE */}
      <div
        className="
          w-full md:w-1/2
          bg-white/10
          backdrop-blur-xl
          border-l border-white/20
          text-white
          flex flex-col
          justify-center
          px-8 md:px-10
          py-8
        "
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center text-3xl">
            👤
          </div>

          <h2 className="text-3xl md:text-4xl font-bold">
            Create Account
          </h2>

          <p className="text-white/70 mt-2">
            Join Jeevan Care
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={handleChange}
            className="
              w-full
              p-3
              rounded-xl
              bg-white/10
              border border-white/20
              text-white
              placeholder-white/50
              outline-none
              focus:border-blue-400
              focus:bg-white/15
              transition
            "
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={handleChange}
            className="
              w-full
              p-3
              rounded-xl
              bg-white/10
              border border-white/20
              text-white
              placeholder-white/50
              outline-none
              focus:border-blue-400
              focus:bg-white/15
              transition
            "
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            className="
              w-full
              p-3
              rounded-xl
              bg-white/10
              border border-white/20
              text-white
              placeholder-white/50
              outline-none
              focus:border-blue-400
              focus:bg-white/15
              transition
            "
          />

          <button
            type="submit"
            className="
              w-full
              py-3
              rounded-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              transition-all
              duration-300
              hover:scale-[1.02]
            "
          >
            CREATE ACCOUNT
          </button>
        </form>

        <p className="text-center mt-5 text-white/70">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="text-blue-300 hover:text-blue-200 font-semibold"
          >
            Sign In
          </NavLink>
        </p>
      </div>
    </div>
  </div>
);
};

export default Signup;