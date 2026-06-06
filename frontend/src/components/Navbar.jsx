

import React from "react";
import { NavLink } from "react-router-dom";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between 
                    bg-white/10 backdrop-blur-lg border-b border-white/20 
                    text-white">

     
      {/* Links */}
      <div className="flex gap-6">

        <NavLink 
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-semibold mx-4"
              : "hover:text-blue-300 transition mx-4"
          }
        >
          Home
        </NavLink> 

        <NavLink 
          to="/appointment"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-semibold  mx-4"
              : "hover:text-blue-300 transition  mx-4"
          }
        >
          Appointments
        </NavLink>

        <NavLink 
          to="/workouts"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-semibold mx-4"
              : "hover:text-blue-300 transition mx-4"
          }
        >
          Workouts
        </NavLink>
        <NavLink 
          to="/chatbot"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-semibold  mx-4"
              : "hover:text-blue-300 transition mx-4"
          }
        >
          AI Assistant
        </NavLink>

        

      </div>

      {/* Auth Buttons */}
      <div className="flex gap-3">
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
  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
    <FaUser className="text-sm text-white" />
  </div>

</NavLink>

        

      </div>

    </nav>
  );
};

export default Navbar;