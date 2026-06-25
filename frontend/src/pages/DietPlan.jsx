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
    } catch (err) {
      alert("❌ Failed to save diet plan.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this diet plan?")) return;
    try {
      await axios.delete(`/api/diet/${id}`);
      setSavedPlans(savedPlans.filter((p) => p._id !== id));
    } catch (err) {
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
                <h2 className="text-xl font-bold mb-4">Saved Plans</h2>
                {savedPlans.length === 0 ? (
                  <p className="text-slate-500 text-sm">No saved plans yet. Build one!</p>
                ) : (
                  <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                    {savedPlans.map((plan) => (
                      <div key={plan._id} className="bg-slate-800 rounded-xl overflow-hidden">
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-700 transition"
                          onClick={() => setExpandedPlan(expandedPlan === plan._id ? null : plan._id)}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{plan.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${goalColors[plan.goal]}`}>{plan.goal}</span>
                            </div>
                            <p className="text-xs text-slate-400">
                              🔥 {plan.totalCalories} kcal · {new Date(plan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); deletePlan(plan._id); }} className="text-red-400 hover:text-red-500 text-sm">🗑</button>
                            <span className="text-slate-400 text-xs">{expandedPlan === plan._id ? "▲" : "▼"}</span>
                          </div>
                        </div>

                        {expandedPlan === plan._id && (
                          <div className="px-4 pb-4 border-t border-slate-700 pt-3 space-y-3">
                            {/* Macro bar */}
                            <div className="grid grid-cols-3 gap-2 text-xs text-center">
                              <div><p className={`font-bold ${macroColor.protein}`}>{plan.totalProtein}g</p><p className="text-slate-500">protein</p></div>
                              <div><p className={`font-bold ${macroColor.carbs}`}>{plan.totalCarbs}g</p><p className="text-slate-500">carbs</p></div>
                              <div><p className={`font-bold ${macroColor.fat}`}>{plan.totalFat}g</p><p className="text-slate-500">fat</p></div>
                            </div>
                            {plan.meals.map((meal) => (
                              <div key={meal.mealType}>
                                <p className="text-xs font-semibold text-green-400 mb-1">{meal.mealType}</p>
                                {meal.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-xs text-slate-300 py-0.5">
                                    <span>{item.name}</span>
                                    <span className={macroColor.calories}>{item.calories} kcal</span>
                                  </div>
                                ))}
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

export default DietPlan;
