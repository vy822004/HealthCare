
import React, { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import loginImage from "../assets/login-illustration.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(res.data);

      // Redirect to Home page after successful login
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
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
        <div className="w-full md:w-1/2 bg-white/5 flex items-center justify-center">
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
            px-8 md:px-12
            py-10
          "
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center text-3xl">
              🔐
            </div>

            <h2 className="text-4xl font-bold">Sign In</h2>

            <p className="text-white/70 mt-2">
              Welcome back to Jeevan Care
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email Address"
              required
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
              value={password}
              onChange={handleChange}
              placeholder="Password"
              required
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

            <div className="flex justify-between items-center text-sm text-white/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="hover:text-blue-300 transition"
              >
                Forgot Password?
              </button>
            </div>

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
              SIGN IN
            </button>
          </form>

          <p className="text-center mt-6 text-white/70">
            Don't have an account?{" "}
            <NavLink
              to="/signup"
              className="text-blue-300 hover:text-blue-200 font-semibold"
            >
              Create Account
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

