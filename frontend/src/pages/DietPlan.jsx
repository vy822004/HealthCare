import React, { useState, useEffect } from "react";
import axios from "axios";
import { foodLibrary } from "../assets/foods";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const GOALS = ["Weight Loss", "Muscle Gain", "Maintenance", "Healthy Eating"];
const CATEGORIES = ["All", ...new Set(foodLibrary.map((f) => f.category))];

const goalColors = {
  "Weight Loss": "bg-red-500",
  "Muscle Gain": "bg-blue-500",
  "Maintenance": "bg-green-500",
  "Healthy Eating": "bg-purple-500",
};

const macroColor = { calories: "text-orange-400", protein: "text-blue-400", carbs: "text-yellow-400", fat: "text-pink-400" };

const DietPlan = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [planName, setPlanName] = useState("My Diet Plan");
  const [goal, setGoal] = useState("Maintenance");
  const [meals, setMeals] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: [],
  });
  const [activeMeal, setActiveMeal] = useState("Breakfast");
  const [savedPlans, setSavedPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [expandedPlan, setExpandedPlan] = useState(null);

  const filteredFoods = foodLibrary.filter((food) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      term === "" ||
      food.name.toLowerCase().includes(term) ||
      food.tags?.some((t) => t.toLowerCase().includes(term));
    const matchesCat = selectedCategory === "All" || food.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  useEffect(() => { fetchSavedPlans(); }, []);

  const fetchSavedPlans = async () => {
    try {
      const res = await axios.get("/api/diet");
      setSavedPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch diet plans:", err);
    }
  };

  const addToMeal = (food) => {
    const exists = meals[activeMeal].find((f) => f.name === food.name);
    if (exists) return;
    setMeals({ ...meals, [activeMeal]: [...meals[activeMeal], food] });
  };

  const removeFromMeal = (mealType, foodName) => {
    setMeals({ ...meals, [mealType]: meals[mealType].filter((f) => f.name !== foodName) });
  };

  const getTotals = () => {
    let cals = 0, protein = 0, carbs = 0, fat = 0;
    Object.values(meals).flat().forEach((f) => {
      cals += f.calories || 0;
      protein += f.protein || 0;
      carbs += f.carbs || 0;
      fat += f.fat || 0;
    });
    return { calories: Math.round(cals), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  };

  const totalItems = Object.values(meals).flat().length;

  const savePlan = async () => {
    if (totalItems === 0) return;
    setSaving(true);
    try {
      const mealArray = MEAL_TYPES
        .filter((type) => meals[type].length > 0)
        .map((type) => ({ mealType: type, items: meals[type] }));

      await axios.post("/api/diet", { name: planName, goal, meals: mealArray });
      alert(`✅ "${planName}" saved successfully!`);
      setMeals({ Breakfast: [], Lunch: [], Dinner: [], Snack: [] });
      setPlanName("My Diet Plan");
      fetchSavedPlans();
      setActiveTab("saved");
    } catch {
      alert("Failed to create diet plan");
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this diet plan?")) return;
    try {
      await axios.delete(`/api/diet/${id}`);
      setSavedPlans(savedPlans.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const totals = getTotals();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Food Library ── */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">Diet Plan Builder</h1>
          <p className="text-slate-400 text-sm mb-6">Browse foods and add them to your daily meals</p>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search foods or tags (e.g. high-protein, vegan)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Meal Type Selector */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-slate-400 text-sm self-center mr-1">Add to:</span>
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveMeal(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeMeal === type ? "bg-green-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
              >
                {type} {meals[type].length > 0 && <span className="ml-1 opacity-70">({meals[type].length})</span>}
              </button>
            ))}
          </div>

          {/* Food List */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            {filteredFoods.length === 0 ? (
              <p className="text-slate-500 p-6 text-center">No foods found.</p>
            ) : (
              filteredFoods.map((food) => {
                const alreadyAdded = meals[activeMeal].find((f) => f.name === food.name);
                return (
                  <div
                    key={food.name}
                    className="flex justify-between items-center p-4 border-b border-slate-800 hover:bg-slate-800 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{food.name}</h3>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{food.category}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span className={macroColor.calories}>🔥 {food.calories} kcal</span>
                        <span className={macroColor.protein}>💪 {food.protein}g protein</span>
                        <span className={macroColor.carbs}>🌾 {food.carbs}g carbs</span>
                        <span className={macroColor.fat}>🥑 {food.fat}g fat</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToMeal(food)}
                      disabled={!!alreadyAdded}
                      className="ml-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-2 rounded-lg text-sm transition shrink-0"
                    >
                      {alreadyAdded ? "Added ✓" : `+ ${activeMeal}`}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div>
          <div className="sticky top-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setActiveTab("builder")}
                className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${activeTab === "builder" ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                Builder {totalItems > 0 && `(${totalItems})`}
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${activeTab === "saved" ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                Saved {savedPlans.length > 0 && `(${savedPlans.length})`}
              </button>
            </div>

            {/* ── Builder Tab ── */}
            {activeTab === "builder" && (
              <>
                <input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Plan Name"
                />

                {/* Goal Selector */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition ${goal === g ? `${goalColors[g]} text-white` : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* Macro Summary */}
                {totalItems > 0 && (
                  <div className="bg-slate-800 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center"><p className={`text-lg font-bold ${macroColor.calories}`}>{totals.calories}</p><p className="text-slate-400">kcal</p></div>
                    <div className="text-center"><p className={`text-lg font-bold ${macroColor.protein}`}>{totals.protein}g</p><p className="text-slate-400">protein</p></div>
                    <div className="text-center"><p className={`text-lg font-bold ${macroColor.carbs}`}>{totals.carbs}g</p><p className="text-slate-400">carbs</p></div>
                    <div className="text-center"><p className={`text-lg font-bold ${macroColor.fat}`}>{totals.fat}g</p><p className="text-slate-400">fat</p></div>
                  </div>
                )}

                {/* Meals */}
                {totalItems === 0 ? (
                  <p className="text-slate-500 text-sm">Select a meal type above and add foods from the library.</p>
                ) : (
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {MEAL_TYPES.map((type) =>
                      meals[type].length > 0 ? (
                        <div key={type} className="bg-slate-800 rounded-xl p-3">
                          <p className="font-semibold text-sm text-green-400 mb-2">{type}</p>
                          {meals[type].map((food) => (
                            <div key={food.name} className="flex justify-between items-center py-1 text-xs text-slate-300">
                              <span className="truncate flex-1">{food.name}</span>
                              <span className={`mx-2 ${macroColor.calories}`}>{food.calories} kcal</span>
                              <button onClick={() => removeFromMeal(type, food.name)} className="text-red-400 hover:text-red-500">✕</button>
                            </div>
                          ))}
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                <button
                  onClick={savePlan}
                  disabled={totalItems === 0 || saving}
                  className="w-full mt-5 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 py-3 rounded-xl font-semibold transition"
                >
                  {saving ? "Saving..." : "💾 Save Diet Plan"}
                </button>
              </>
            )}

            {/* ── Saved Plans Tab ── */}
            {activeTab === "saved" && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-400 p-1.5 rounded-lg">📋</span>
                  Saved Plans
                </h2>
                {savedPlans.length === 0 ? (
                  <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                    <p className="text-slate-400 font-medium">No saved plans yet.</p>
                    <p className="text-slate-500 text-sm mt-1">Build one or ask the AI to generate it!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                    {savedPlans.map((plan) => (
                      <div key={plan._id} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all duration-300 shadow-lg">
                        <div
                          className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-700/30 transition group"
                          onClick={() => setExpandedPlan(expandedPlan === plan._id ? null : plan._id)}
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold text-lg text-white group-hover:text-green-400 transition-colors">{plan.name}</p>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium tracking-wide shadow-sm text-white ${goalColors[plan.goal] || 'bg-slate-600'}`}>{plan.goal}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                              <span className="text-orange-400 font-semibold">🔥 {plan.totalCalories} kcal</span>
                              <span className="text-slate-600">•</span>
                              <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={(e) => { e.stopPropagation(); deletePlan(plan._id); }} className="p-2 bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                            <span className={`text-slate-500 transition-transform duration-300 ${expandedPlan === plan._id ? "rotate-180" : ""}`}>
                              ▼
                            </span>
                          </div>
                        </div>

                        {expandedPlan === plan._id && (
                          <div className="px-5 pb-5 pt-2 border-t border-slate-700/50 bg-slate-800/20">
                            {/* Macro bar */}
                            <div className="grid grid-cols-3 gap-3 my-4">
                              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-blue-400">{plan.totalProtein}g</p>
                                <p className="text-xs font-medium text-blue-400/60 uppercase tracking-wider mt-1">Protein</p>
                              </div>
                              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-yellow-400">{plan.totalCarbs}g</p>
                                <p className="text-xs font-medium text-yellow-400/60 uppercase tracking-wider mt-1">Carbs</p>
                              </div>
                              <div className="bg-pink-900/20 border border-pink-500/20 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-pink-400">{plan.totalFat}g</p>
                                <p className="text-xs font-medium text-pink-400/60 uppercase tracking-wider mt-1">Fat</p>
                              </div>
                            </div>
                            
                            <div className="space-y-4 mt-6">
                              {plan.meals.map((meal) => (
                                <div key={meal.mealType} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                  <p className="text-sm font-bold text-green-400 mb-3 border-b border-green-500/20 pb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    {meal.mealType}
                                  </p>
                                  <div className="space-y-2">
                                    {meal.items.map((item, i) => (
                                      <div key={i} className="flex justify-between items-center text-sm hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-lg transition-colors">
                                        <span className="text-slate-300 font-medium">{item.name}</span>
                                        <span className="text-orange-300/90 font-semibold bg-orange-500/10 px-2.5 py-1 rounded text-xs">{item.calories} kcal</span>
                                      </div>
                                    ))}
                                  </div>
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
    </div>
  );
};

export default DietPlan;
