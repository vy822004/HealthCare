import React from "react";

const Hero = () => {
  return (
    <div className="min-h-screen text-white px-6 py-10">

      {/* 🔥 HERO SECTION */}
      <div className="text-center mt-10">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-blue-400">JEEVANCARE</span> 
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          Your smart healthcare companion. Track health, manage appointments, and stay fit.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <button className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition">
            Get Started
          </button>
          <button className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10 transition">
            Learn More
          </button>
        </div>
      </div>

      {/* 🔥 FEATURES SECTION */}
      <div className="mt-20 grid md:grid-cols-3 gap-8">

        {/* Card 1 */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl text-center hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">Appointments</h2>
          <p className="text-gray-300 text-sm">
            Book and manage doctor appointments easily.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl text-center hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">Workouts</h2>
          <p className="text-gray-300 text-sm">
            Personalized workout plans for better health.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl text-center hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">Reports</h2>
          <p className="text-gray-300 text-sm">
            Access your medical reports anytime.
          </p>
        </div>
         {/* Card 4 */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl text-center hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
          <p className="text-gray-300 text-sm">
            Get instant health advice and support.
          </p>
        </div>

      </div>

      {/* 🔥 CTA SECTION */}
      <div className="mt-20 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Take Control of Your Health Today
        </h2>
       
      </div>

    </div>
  );
};

export default Hero;