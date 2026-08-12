import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  HeartPulse,
  Dumbbell,
  Salad,
  Bot,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login");
    }
  };

  const navItems = [
    {
      name: "Overview",
      path: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Records",
      path: "/reports",
      icon: <FileText size={20} />,
    },
    {
      name: "Fitness",
      path: "/exercises",
      icon: <Dumbbell size={20} />,
    },
    {
      name: "Nutrition",
      path: "/diet",
      icon: <Salad size={20} />,
    },
    {
      name: "Settings",
      path: "/profile",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <aside
      className="
        h-screen
        w-72
        bg-white/10
        backdrop-blur-xl
        border-r border-white/20
        text-white
        flex
        flex-col
        fixed
        left-0
        top-0
      "
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/20">
        <h1 className="text-2xl font-bold">
          JEEVAN<span className="text-blue-400">CARE</span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3
                  px-4 py-3 rounded-xl
                  transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-white/10"
                  }
                `
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            hover:bg-red-500/20
            transition
          "
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;