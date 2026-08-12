import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
const Home = () => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedProgressWorkout, setSelectedProgressWorkout] = useState(null);
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [workoutRes, profileRes, reportsRes, chatRes] = await Promise.all([
          axios.get("/api/workouts/history"),
          axios.get("/api/profile"),
          axios.get("/api/reports"),
          axios.get("/api/chatbot/history")
        ]);
        
        setWorkoutHistory(workoutRes.data);
        setUser(profileRes.data.user);
        setPatient(profileRes.data.patient);
        setReports(reportsRes.data);
        setChatHistory(chatRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    }
    fetchData();
  }, []);

  // Calculate Health Score
  let healthScore = 80;
  if (patient?.weight && patient?.height) {
    const bmi = (patient.weight / ((patient.height/100)**2));
    if (bmi >= 18.5 && bmi <= 25) healthScore += 15;
    else healthScore -= 10;
  }
  if (patient?.medicalConditions?.length) {
    healthScore -= (patient.medicalConditions.length * 5);
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Calculate Streak
  let streak = 0;
  if (workoutHistory.length > 0) {
    const uniqueDates = [...new Set(workoutHistory.map(w => new Date(w.date).toDateString()))]
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    for (let d of uniqueDates) {
      const diffTime = Math.abs(currentDate - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays <= 1) {
        streak++;
        currentDate = d;
      } else {
        break;
      }
    }
  }

  const stats = [
    {
      title: "Reports",
      value: reports.length.toString(),
      icon: "📄",
    },
    {
      title: "Health Score",
      value: `${healthScore}%`,
      icon: "❤️",
    },
    {
      title: "Workout Streak",
      value: `${streak} Days`,
      icon: "🏋️",
    },
    {
      title: "AI Chats",
      value: chatHistory.length.toString(),
      icon: "🤖",
    },
  ];



  return (
    <div className="min-h-screen text-white p-6">
      
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Welcome Back{user?.name ? `, ${user.name.startsWith("Dr.") ? "Dr. " + (user.name.split(' ')[1] || "") : user.name.split(' ')[0]}` : ''} 👋
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

      {/* Analytics Drilldown */}
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
        {!selectedProgressWorkout ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]">📈</span>
              Workout Analytics
            </h2>
            
            {workoutHistory.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-xl">
                No workouts logged yet. Complete a workout to see analytics!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...new Set(workoutHistory.map(w => w.name))].map(name => {
                  const workoutsForName = workoutHistory.filter(w => w.name === name);
                  const totalSessions = workoutsForName.length;
                  return (
                    <div 
                      key={name}
                      onClick={() => setSelectedProgressWorkout(name)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 group"
                    >
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{name}</h3>
                      <p className="text-white/50 text-sm mt-1">{totalSessions} session{totalSessions !== 1 && 's'} recorded</p>
                      <div className="mt-4 text-sm font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View Progress <span>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          (() => {
            const filteredHistory = workoutHistory.filter(w => w.name === selectedProgressWorkout);

            let maxVolume = 0;
            let totalDuration = 0;

            const chartDataMap = {};
            
            filteredHistory.forEach(w => {
              const day = format(new Date(w.date), 'MMM dd');
              const sessionVolume = (w.exercises || []).reduce((sum, ex) => {
                return sum + (ex.sets || []).reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0);
              }, 0);
              
              if (!chartDataMap[day]) {
                chartDataMap[day] = { date: day, volume: 0, sessions: 0, rawDates: [] };
              }
              
              chartDataMap[day].volume += sessionVolume;
              chartDataMap[day].sessions += 1;
              chartDataMap[day].rawDates.push(w.date);
              
              totalDuration += w.duration;
            });

            const chartData = Object.values(chartDataMap).sort((a, b) => new Date(a.rawDates[0]) - new Date(b.rawDates[0]));
            
            chartData.forEach(d => {
              if (d.volume > maxVolume) maxVolume = d.volume;
            });

            const totalSessions = filteredHistory.length;
            const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
            
            const formatTime = (seconds) => {
              const m = Math.floor(seconds / 60).toString().padStart(2, '0');
              const s = (seconds % 60).toString().padStart(2, '0');
              return `${m}m ${s}s`;
            };

            const exerciseStats = {};
            filteredHistory.forEach(session => {
              (session.exercises || []).forEach(ex => {
                if (!exerciseStats[ex.name]) {
                  exerciseStats[ex.name] = { maxWeight: 0, totalReps: 0, totalSets: 0 };
                }
                const stats = exerciseStats[ex.name];
                
                (ex.sets || []).forEach(set => {
                  const w = set.weight || 0;
                  if (w > stats.maxWeight) {
                    stats.maxWeight = w;
                  }
                  stats.totalReps += (set.reps || 0);
                  stats.totalSets += 1;
                });
              });
            });

            return (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedProgressWorkout(null)}
                      className="bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors text-white/70 hover:text-white"
                    >
                      ← Back
                    </button>
                    <h2 className="text-2xl font-bold text-blue-400">
                      {selectedProgressWorkout} <span className="text-white">Analytics</span>
                    </h2>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Achievements */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-900/40 to-white/5 border border-blue-500/30 p-5 rounded-2xl flex items-center gap-4">
                      <div className="text-3xl bg-blue-500/20 p-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)]">🏆</div>
                      <div>
                        <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">Volume PR</p>
                        <p className="text-xl font-black text-white mt-0.5">{maxVolume} <span className="text-sm font-medium text-white/50">kg</span></p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-900/40 to-white/5 border border-emerald-500/30 p-5 rounded-2xl flex items-center gap-4">
                      <div className="text-3xl bg-emerald-500/20 p-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">🔥</div>
                      <div>
                        <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Consistency</p>
                        <p className="text-xl font-black text-white mt-0.5">{totalSessions} <span className="text-sm font-medium text-white/50">Sessions</span></p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/40 to-white/5 border border-purple-500/30 p-5 rounded-2xl flex items-center gap-4">
                      <div className="text-3xl bg-purple-500/20 p-3 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">⏱️</div>
                      <div>
                        <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">Avg Time</p>
                        <p className="text-xl font-black text-white mt-0.5">{formatTime(avgDuration)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Graph */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-lg">
                    <h3 className="text-sm font-bold text-white/80 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                      Volume Progression
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} kg`} tickMargin={10} width={60} />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
                                      {label} {data.sessions > 1 && `(${data.sessions} Sessions)`}
                                    </p>
                                    <p className="text-blue-400 font-bold text-2xl">
                                      {payload[0].value} <span className="text-sm font-medium text-white/50">kg Volume</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            cursor={{ stroke: 'rgba(96,165,250,0.2)', strokeWidth: 2, strokeDasharray: '3 3' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="volume" 
                            stroke="#60a5fa" 
                            strokeWidth={4} 
                            dot={{ r: 5, fill: '#0f172a', stroke: '#60a5fa', strokeWidth: 3 }} 
                            activeDot={{ r: 10, fill: '#fff', stroke: '#3b82f6', strokeWidth: 4, shadow: '0 0 10px rgba(59,130,246,1)' }} 
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Exercise Breakdown & PRs */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-lg mt-8">
                    <h3 className="text-sm font-bold text-white/80 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      Exercise Breakdown & PRs
                    </h3>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {Object.keys(exerciseStats).map(exName => {
                        const stats = exerciseStats[exName];
                        return (
                          <div key={exName} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:bg-white/10 transition-colors">
                            <div>
                              <p className="font-bold text-white">{exName}</p>
                              <p className="text-xs text-white/50 mt-1">{stats.totalSets} sets completed across all sessions</p>
                            </div>
                            <div className="flex items-center gap-6 text-right">
                              <div>
                                <p className="text-xs font-bold text-white/40 uppercase">Total Reps</p>
                                <p className="text-lg font-bold text-emerald-400">{stats.totalReps}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white/40 uppercase">Weight PR</p>
                                <p className="text-lg font-bold text-amber-400">{stats.maxWeight} <span className="text-sm text-amber-400/60">kg</span></p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}
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
            {reports.length > 0 ? (
              reports.slice(0, 3).map((r, i) => (
                <li key={i} className="truncate" title={r.title}>📄 {r.title}</li>
              ))
            ) : (
              <li className="italic text-white/40">No reports uploaded yet.</li>
            )}
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
            Personalized Suggestions
          </h2>

          <ul className="space-y-3 text-white/70">
            {patient?.weight && patient?.height && (patient.weight / ((patient.height/100)**2)) > 25 ? (
              <li>🥗 Consider a slight caloric deficit</li>
            ) : (
              <li>🥗 Maintain a balanced protein intake</li>
            )}
            
            {patient?.medicalConditions?.length > 0 ? (
              <li>🩺 Keep up with regular check-ups for your conditions</li>
            ) : null}

            <li>🚶 Aim for at least 8,000 steps daily</li>
            <li>💧 Stay hydrated: Drink 2-3L of water daily</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Home;