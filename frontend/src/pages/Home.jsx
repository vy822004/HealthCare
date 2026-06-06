import React from "react";

const Home = () => {
  const stats = [
    {
      title: "Reports",
      value: "15",
      icon: "📄",
    },
    {
      title: "Health Score",
      value: "87%",
      icon: "❤️",
    },
    {
      title: "Workout Streak",
      value: "21 Days",
      icon: "🏋️",
    },
    {
      title: "AI Chats",
      value: "48",
      icon: "🤖",
    },
  ];

  return (
    <div className="min-h-screen text-white p-6">
      
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="text-white/60 mt-2">
          Here's your health overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="
              bg-white/10
              backdrop-blur-xl
              border border-white/20
              rounded-2xl
              p-6
              hover:scale-105
              transition
            "
          >
            <div className="text-3xl mb-3">
              {item.icon}
            </div>

            <h3 className="text-white/70">
              {item.title}
            </h3>

            <p className="text-3xl font-bold mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div
        className="
          bg-white/10
          backdrop-blur-xl
          border border-white/20
          rounded-2xl
          p-6
          mb-8
        "
      >
        <h2 className="text-2xl font-semibold mb-4">
          Health Analytics
        </h2>

        <div className="h-72 flex items-center justify-center text-white/50">
          Chart Goes Here
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid md:grid-cols-2 gap-6">

        <div
          className="
            bg-white/10
            backdrop-blur-xl
            border border-white/20
            rounded-2xl
            p-6
          "
        >
          <h2 className="text-xl font-semibold mb-4">
            Recent Reports
          </h2>

          <ul className="space-y-3 text-white/70">
            <li>📄 Blood Test Report</li>
            <li>📄 ECG Report</li>
            <li>📄 Cholesterol Report</li>
          </ul>
        </div>

        <div
          className="
            bg-white/10
            backdrop-blur-xl
            border border-white/20
            rounded-2xl
            p-6
          "
        >
          <h2 className="text-xl font-semibold mb-4">
            AI Suggestions
          </h2>

          <ul className="space-y-3 text-white/70">
            <li>🥗 Increase protein intake</li>
            <li>🚶 Walk 30 mins daily</li>
            <li>💧 Drink more water</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Home;