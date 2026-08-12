import React, { useState, useEffect } from "react";
import axios from "axios";
import { exerciseLibrary } from "../assets/exercises";

const Exercises = () => {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [workoutName, setWorkoutName] = useState("My Workout");
  const [workout, setWorkout] = useState([]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [workoutHistory, setWorkoutHistory] = useState([]);

  // Active Workout State
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const timerRef = React.useRef(null);

  const muscles = [
    "All",
    ...new Set(exerciseLibrary.flatMap((exercise) => exercise.primaryMuscles)),
  ];

  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      exercise.name.toLowerCase().includes(searchTerm) ||
      exercise.category?.toLowerCase().includes(searchTerm) ||
      exercise.primaryMuscles?.some((muscle) =>
        muscle.toLowerCase().includes(searchTerm)
      );
    const matchesMuscle =
      selectedMuscle === "All" ||
      exercise.category === selectedMuscle ||
      exercise.primaryMuscles?.includes(selectedMuscle);
    return matchesSearch && matchesMuscle;
  });

  async function fetchSavedWorkouts() {
    try {
      const res = await axios.get("/api/workouts");
      setSavedWorkouts(res.data);
    } catch (err) {
      console.error("Failed to fetch saved workouts", err);
    }
  }

  async function fetchWorkoutHistory() {
    try {
      const res = await axios.get("/api/workouts/history");
      setWorkoutHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch workout history:", err);
    }
  }

  useEffect(() => {
    fetchSavedWorkouts();
    fetchWorkoutHistory();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startWorkout = (workoutToStart) => {
    setActiveWorkout(workoutToStart);
    setWorkoutTime(0);
    
    const initialSets = {};
    workoutToStart.exercises.forEach((ex, i) => {
      initialSets[i] = [{ weight: "", reps: "", done: false }];
    });
    setCompletedSets(initialSets);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setWorkoutTime((prev) => prev + 1);
    }, 1000);
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    setCompletedSets(prev => {
      const newSets = { ...prev };
      newSets[exIndex] = [...newSets[exIndex]];
      newSets[exIndex][setIndex] = { ...newSets[exIndex][setIndex], [field]: value };
      return newSets;
    });
  };

  const toggleSet = (exIndex, setIndex) => {
    setCompletedSets(prev => {
      const newSets = { ...prev };
      newSets[exIndex] = [...newSets[exIndex]];
      newSets[exIndex][setIndex] = { 
        ...newSets[exIndex][setIndex], 
        done: !newSets[exIndex][setIndex].done 
      };
      return newSets;
    });
  };

  const addSet = (exIndex) => {
    setCompletedSets(prev => {
      const newSets = { ...prev };
      const previousSet = newSets[exIndex][newSets[exIndex].length - 1];
      newSets[exIndex] = [...newSets[exIndex], { 
        weight: previousSet ? previousSet.weight : "", 
        reps: previousSet ? previousSet.reps : "", 
        done: false 
      }];
      return newSets;
    });
  };

  const finishWorkout = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Compile workout data
    const exercisesLog = activeWorkout.exercises.map((ex, exIndex) => {
      const sets = completedSets[exIndex] || [];
      const completedSetsOnly = sets.filter(s => s.done).map(s => ({
        weight: Number(s.weight),
        reps: Number(s.reps)
      }));
      return {
        name: ex.name,
        sets: completedSetsOnly
      };
    }).filter(ex => ex.sets.length > 0);

    if (exercisesLog.length > 0) {
      try {
        await axios.post("/api/workouts/history", {
          workoutId: activeWorkout._id,
          name: activeWorkout.name,
          duration: workoutTime,
          exercises: exercisesLog
        });
      } catch (err) {
        console.error("Failed to log workout", err);
      }
    }

    alert(`🎉 Workout Complete! Time: ${formatTime(workoutTime)}`);
    setActiveWorkout(null);
  };

  const deleteWorkout = async (id) => {
    try {
      await axios.delete(`/api/workouts/${id}`);
      fetchSavedWorkouts();
    } catch (err) {
      console.error("Failed to delete workout", err);
    }
  };

  const renameWorkout = async (id) => {
    if (!editedName.trim()) {
      setEditingWorkoutId(null);
      return;
    }
    try {
      await axios.put(`/api/workouts/${id}`, { name: editedName });
      setEditingWorkoutId(null);
      fetchSavedWorkouts();
    } catch (err) {
      console.error("Failed to rename workout", err);
    }
  };

  const addToWorkout = (exercise) => {
    const exists = workout.find((e) => e.name === exercise.name);
    if (exists) return;
    setWorkout([...workout, { ...exercise }]);
  };

  const removeFromWorkout = (name) => {
    setWorkout(workout.filter((exercise) => exercise.name !== name));
  };

  const saveWorkout = async () => {
    if (workout.length === 0) return;
    setSaving(true);
    try {
      await axios.post("/api/workouts", { name: workoutName, exercises: workout });
      alert(`✅ "${workoutName}" saved successfully!`);
      setWorkout([]);
      setWorkoutName("My Workout");
      fetchSavedWorkouts();
      setActiveTab("saved");
    } catch (err) {
      alert("❌ Failed to save workout. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Exercise Library */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Exercise Library</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search exercises..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
            >
              {muscles.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            {filteredExercises.length === 0 ? (
              <p className="text-slate-500 p-6 text-center">No exercises found.</p>
            ) : (
              filteredExercises.map((exercise) => (
                <div
                  key={`${exercise.name}-${exercise.category}`}
                  className="flex justify-between items-center p-4 border-b border-slate-800 hover:bg-slate-800 transition"
                >
                  <div>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <p className="text-sm text-slate-400">
                      {exercise.primaryMuscles.join(", ")}
                      {exercise.secondaryMuscles?.length > 0 && (
                        <span className="text-slate-600 ml-1">
                          · {exercise.secondaryMuscles.join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => addToWorkout(exercise)}
                    disabled={!!workout.find((e) => e.name === exercise.name)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-2 rounded-lg transition"
                  >
                    {workout.find((e) => e.name === exercise.name) ? "Added ✓" : "Add"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div>
          <div className="sticky top-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setActiveTab("builder")}
                className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${activeTab === "builder" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                Builder {workout.length > 0 && `(${workout.length})`}
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${activeTab === "saved" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                Saved {savedWorkouts.length > 0 && `(${savedWorkouts.length})`}
              </button>
            </div>

            {/* Builder Tab */}
            {activeTab === "builder" && (
              <>
                <input
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Workout Name"
                />
                <h2 className="text-xl font-bold mb-4">Workout Builder</h2>

                {workout.length === 0 ? (
                  <p className="text-slate-500 text-sm">Add exercises from the library to get started.</p>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {workout.map((exercise) => (
                      <div key={exercise.name} className="bg-slate-800 rounded-xl p-4 flex justify-between items-center border border-slate-700">
                        <span className="font-semibold text-sm">{exercise.name}</span>
                        <button onClick={() => removeFromWorkout(exercise.name)} className="text-red-400 hover:text-red-500 font-bold px-2 py-1">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={saveWorkout}
                  disabled={workout.length === 0 || saving}
                  className="w-full mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 py-3 rounded-xl font-semibold transition"
                >
                  {saving ? "Saving..." : "💾 Save Workout"}
                </button>
              </>
            )}

            {/* Saved Workouts Tab */}
            {activeTab === "saved" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Saved Workouts</h2>
                {savedWorkouts.length === 0 ? (
                  <p className="text-slate-500 text-sm">No saved workouts yet. Build one!</p>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {savedWorkouts.map((w) => (
                      <div key={w._id} className="bg-slate-800 rounded-xl overflow-hidden">
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-700 transition"
                          onClick={() => {
                            if (editingWorkoutId === w._id) return;
                            setExpandedWorkout(expandedWorkout === w._id ? null : w._id);
                          }}
                        >
                          <div className="flex-1 mr-4">
                            {editingWorkoutId === w._id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="bg-slate-900 border border-blue-500 rounded px-2 py-1 text-sm outline-none w-full"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') renameWorkout(w._id);
                                    if (e.key === 'Escape') setEditingWorkoutId(null);
                                  }}
                                  autoFocus
                                />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); renameWorkout(w._id); }}
                                  className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group">
                                <p className="font-semibold">{w.name}</p>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setEditingWorkoutId(w._id); 
                                    setEditedName(w.name);
                                  }}
                                  className="text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Rename Workout"
                                >
                                  ✏️
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-slate-400 mt-0.5">
                              {w.exercises.length} exercises · {new Date(w.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteWorkout(w._id); }}
                              className="text-red-400 hover:text-red-500 text-sm"
                            >
                              🗑
                            </button>
                            <span className="text-slate-400">{expandedWorkout === w._id ? "▲" : "▼"}</span>
                          </div>
                        </div>

                        {expandedWorkout === w._id && (
                          <div className="px-4 pb-4 space-y-4 border-t border-slate-700 pt-4">
                            <button
                              onClick={() => startWorkout(w)}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              Start Workout
                            </button>
                            <div className="space-y-2 mt-4">
                              {w.exercises.map((ex, i) => (
                                <div key={i} className="flex items-center text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                                  <span>{ex.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Active Workout Overlay */}
      {activeWorkout && (
        <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto custom-scrollbar flex justify-center p-6">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative mt-10 mb-10 h-max">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{activeWorkout.name}</h1>
                <p className="text-slate-400 mt-1 font-medium">{activeWorkout.exercises.length} Exercises</p>
              </div>
              <div className="bg-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                <span className="text-slate-400 font-medium tracking-widest uppercase text-xs">Elapsed Time</span>
                <span className="text-3xl font-mono text-blue-400 font-bold tracking-wider">{formatTime(workoutTime)}</span>
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-8">
              {activeWorkout.exercises.map((ex, exIndex) => {
                const sets = completedSets[exIndex] || [];
                
                // Find previous performance
                let previousPerformance = null;
                for (let i = workoutHistory.length - 1; i >= 0; i--) {
                  const pastSession = workoutHistory[i];
                  if (!pastSession.exercises) continue;
                  const pastEx = pastSession.exercises.find(e => e.name === ex.name);
                  if (pastEx && pastEx.sets && pastEx.sets.length > 0) {
                    previousPerformance = pastEx.sets.map(s => `${s.weight || 0}kg x ${s.reps || 0}`).join(", ");
                    break;
                  }
                }
                
                return (
                  <div key={exIndex} className="bg-slate-800/50 pt-5 pb-2 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="px-6 mb-5 flex flex-col md:flex-row md:justify-between md:items-end gap-2">
                      <h3 className="text-xl font-bold text-blue-100 tracking-wide">{ex.name}</h3>
                      {previousPerformance && (
                        <p className="text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 inline-block">
                          <span className="font-semibold text-slate-300">Last time:</span> {previousPerformance}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {/* Table Header */}
                      <div className="grid grid-cols-[3rem_1fr_1fr_3rem] gap-4 px-6 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700/50">
                        <div className="text-center">Set</div>
                        <div className="text-center">Weight</div>
                        <div className="text-center">Reps</div>
                        <div className="text-center">Done</div>
                      </div>
                      
                      {/* Sets */}
                      {sets.map((set, setIndex) => (
                        <div 
                          key={setIndex} 
                          className={`grid grid-cols-[3rem_1fr_1fr_3rem] gap-4 items-center px-6 py-2 transition-colors duration-300 ${
                            set.done ? "bg-green-500/10" : "hover:bg-slate-800"
                          }`}
                        >
                          <div className={`text-center font-bold text-sm ${set.done ? "text-green-400" : "text-slate-400"}`}>
                            {setIndex + 1}
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              placeholder="0" 
                              value={set.weight}
                              onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                              disabled={set.done}
                              className={`bg-slate-900 border ${set.done ? "border-green-500/30 text-green-100" : "border-slate-700 text-white"} rounded-lg px-2 py-2.5 outline-none text-center text-sm w-full focus:border-blue-500 transition-colors disabled:opacity-70`} 
                            />
                            <span className="absolute right-3 top-3 text-xs text-slate-500 pointer-events-none">kg</span>
                          </div>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={set.reps}
                            onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                            disabled={set.done}
                            className={`bg-slate-900 border ${set.done ? "border-green-500/30 text-green-100" : "border-slate-700 text-white"} rounded-lg px-3 py-2.5 outline-none text-center text-sm w-full focus:border-blue-500 transition-colors disabled:opacity-70`} 
                          />
                          <button 
                            onClick={() => toggleSet(exIndex, setIndex)}
                            className={`w-8 h-8 mx-auto rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                              set.done ? "bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "border-slate-600 bg-slate-900 hover:border-blue-500"
                            }`}
                          >
                            {set.done && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                          </button>
                        </div>
                      ))}
                      
                      {/* Add Set Button */}
                      <div className="px-6 py-3">
                        <button 
                          onClick={() => addSet(exIndex)}
                          className="w-full py-2.5 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition text-center border border-dashed border-blue-500/30"
                        >
                          + Add Set
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="mt-10 pt-6 border-t border-slate-800 flex gap-4">
              <button 
                onClick={() => {
                  if(confirm("Are you sure you want to cancel this workout?")) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setActiveWorkout(null);
                  }
                }}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
              >
                Cancel Workout
              </button>
              <button 
                onClick={finishWorkout}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition"
              >
                Finish Workout
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercises;