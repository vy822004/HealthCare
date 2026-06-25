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

  useEffect(() => {
    fetchSavedWorkouts();
  }, []);

  const fetchSavedWorkouts = async () => {
    try {
      const res = await axios.get("/api/workouts");
      setSavedWorkouts(res.data);
    } catch (err) {
      console.error("Failed to fetch workouts:", err);
    }
  };

  const addToWorkout = (exercise) => {
    const exists = workout.find((e) => e.name === exercise.name);
    if (exists) return;
    setWorkout([...workout, { ...exercise, sets: "", reps: "", rest: "" }]);
  };

  const removeFromWorkout = (name) => {
    setWorkout(workout.filter((exercise) => exercise.name !== name));
  };

  const updateWorkoutExercise = (index, field, value) => {
    const updated = [...workout];
    updated[index] = { ...updated[index], [field]: value };
    setWorkout(updated);
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

  const deleteWorkout = async (id) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;
    try {
      await axios.delete(`/api/workouts/${id}`);
      setSavedWorkouts(savedWorkouts.filter((w) => w._id !== id));
    } catch (err) {
      alert("Failed to delete workout.");
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
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {workout.map((exercise, index) => (
                      <div key={exercise.name} className="bg-slate-800 rounded-xl p-4">
                        <div className="flex justify-between mb-3">
                          <span className="font-medium text-sm">{exercise.name}</span>
                          <button onClick={() => removeFromWorkout(exercise.name)} className="text-red-400 hover:text-red-500">✕</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" value={exercise.sets} onChange={(e) => updateWorkoutExercise(index, "sets", Number(e.target.value))} className="bg-slate-700 rounded-lg px-2 py-2 text-center text-sm" placeholder="Sets" />
                          <input value={exercise.reps} onChange={(e) => updateWorkoutExercise(index, "reps", e.target.value)} className="bg-slate-700 rounded-lg px-2 py-2 text-center text-sm" placeholder="Reps" />
                          <input value={exercise.rest} onChange={(e) => updateWorkoutExercise(index, "rest", e.target.value)} className="bg-slate-700 rounded-lg px-2 py-2 text-center text-sm" placeholder="Rest" />
                        </div>
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
                          onClick={() => setExpandedWorkout(expandedWorkout === w._id ? null : w._id)}
                        >
                          <div>
                            <p className="font-semibold">{w.name}</p>
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
                          <div className="px-4 pb-4 space-y-2 border-t border-slate-700 pt-3">
                            {w.exercises.map((ex, i) => (
                              <div key={i} className="flex justify-between text-sm text-slate-300">
                                <span>{ex.name}</span>
                                <span className="text-slate-500">
                                  {ex.sets && `${ex.sets} sets`}{ex.reps && ` × ${ex.reps}`}{ex.rest && ` · ${ex.rest} rest`}
                                </span>
                              </div>
                            ))}
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
    </div>
  );
};

export default Exercises;