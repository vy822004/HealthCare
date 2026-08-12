

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();
  const isChatbot = location.pathname === "/chatbot";
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/profile");
        if (res.data && res.data.user) {
          setUserRole(res.data.user.role);
        }
      } catch (err) {
        console.error("Failed to fetch profile for Navbar", err);
      }
    };
    fetchProfile();
  }, []);



  return (
    <nav className="sticky top-0 z-50 w-full flex items-center justify-between 
                    bg-white/10 backdrop-blur-lg border-b border-white/20 
                    text-white">

      <div className="flex items-center">
        {/* Conditional Logo for ChatBot page */}
        {isChatbot && (
          <div className="w-72 flex-shrink-0 px-6 py-4 flex items-center border-r border-white/10">
            <h1 className="text-2xl font-bold">
              JEEVAN<span className="text-blue-400">CARE</span>
            </h1>
          </div>
        )}
      
        {/* Links */}
        <div className="flex gap-6 px-6 py-4">

        <NavLink 
          to="/chatbot"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-semibold mx-4"
              : "hover:text-blue-300 transition mx-4"
          }
        >
          AI Doctor
        </NavLink>

        <NavLink 
          to="/appointment"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-semibold  mx-4"
              : "hover:text-blue-300 transition  mx-4"
          }
        >
          Consults
        </NavLink>

        {userRole === 'doctor' && (
          <NavLink 
            to="/doctor-dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold  mx-4"
                : "hover:text-blue-300 transition  mx-4"
            }
          >
            Doctor Dashboard
          </NavLink>
        )}


        

      </div>
      </div>

      {/* Auth Buttons */}
      <div className="flex gap-3 px-6 py-4">
        <NavLink 
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-2 ${
              isActive
                ? "text-blue-400 font-semibold"
                : "hover:text-blue-300 transition"
            }`
          }
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" title="Profile">
            <FaUser className="text-sm text-white" />
          </div>
        </NavLink>
      </div>

    </nav>
  );
};

export default Navbar;