import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';

import Footer from './components/Footer';
import Navbar from './components/Navbar';

import ChatBot from './pages/ChatBot';
import AnalyticalPage from './pages/AnalyticalPage';
import Exercises from './pages/Exercises';
import Profile from './pages/Profile';
import Info from './pages/Info';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/analytics" element={<AnalyticalPage />} />
          <Route path="/workouts" element={<Exercises />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/info/:type" element={<Info />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;