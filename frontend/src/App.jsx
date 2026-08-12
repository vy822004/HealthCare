import React from 'react';
import { Routes, Route ,useLocation} from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';


import Navbar from './components/Navbar';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import ChatBot from './pages/ChatBot';

import Exercises from './pages/Exercises';
import DietPlan from './pages/DietPlan';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Info from './pages/Info';
import Appointment from './pages/Appointment';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  return (
    <div className="min-h-screen flex flex-col">


      {/* Main Content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chatbot" element={<ChatBot />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />

              <Route path="/workouts" element={<Exercises />} />
              <Route path="/diet" element={<DietPlan />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/exercises" element={<Exercises />} />
            </Route>
            <Route path="/info/:type" element={<Info />} />
          </Route>
        </Routes>
      </div>



    </div>
  );
}

export default App;