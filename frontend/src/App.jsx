import React from 'react';
import { Routes, Route ,useLocation} from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';


import Navbar from './components/Navbar';

import Layout from './components/Layout';

import ChatBot from './pages/ChatBot';
import AnalyticalPage from './pages/AnalyticalPage';
import Exercises from './pages/Exercises';
import Profile from './pages/Profile';
import Info from './pages/Info';
import Appointment from './pages/Appointment';

function App() {
  const location = useLocation();
     const hideLayoutRoutes = ["/login", "/signup"];

  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);
  return (
    <div className="min-h-screen flex flex-col">


      {/* Main Content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/chatbot" element={<ChatBot />} />
            <Route path="/analytics" element={<AnalyticalPage />} />
            <Route path="/workouts" element={<Exercises />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointment" element={<Appointment />} />
          </Route>
          <Route path="/info/:type" element={<Info />} />
        </Routes>
      </div>



    </div>
  );
}

export default App;