export const foodLibrary = [
  // --- Proteins ---
  { name: "Chicken Breast (100g)", category: "Protein", calories: 165, protein: 31, carbs: 0, fat: 3.6, tags: ["high-protein", "lean", "muscle-gain"] },
  { name: "Eggs (2 large)", category: "Protein", calories: 143, protein: 13, carbs: 1, fat: 10, tags: ["high-protein", "breakfast"] },
  { name: "Greek Yogurt (150g)", category: "Protein", calories: 130, protein: 15, carbs: 9, fat: 4, tags: ["high-protein", "probiotic", "snack"] },
  { name: "Tuna (100g, canned)", category: "Protein", calories: 116, protein: 26, carbs: 0, fat: 1, tags: ["high-protein", "lean", "omega-3"] },
  { name: "Salmon (100g)", category: "Protein", calories: 208, protein: 20, carbs: 0, fat: 13, tags: ["high-protein", "omega-3", "heart-health"] },
  { name: "Cottage Cheese (150g)", category: "Protein", calories: 130, protein: 17, carbs: 5, fat: 4, tags: ["high-protein", "low-fat", "snack"] },
  { name: "Tofu (100g)", category: "Protein", calories: 76, protein: 8, carbs: 2, fat: 4.8, tags: ["vegan", "plant-protein"] },
  { name: "Lentils (cooked, 100g)", category: "Protein", calories: 116, protein: 9, carbs: 20, fat: 0.4, tags: ["vegan", "high-fiber", "plant-protein"] },
  { name: "Chickpeas (100g)", category: "Protein", calories: 164, protein: 9, carbs: 27, fat: 2.6, tags: ["vegan", "high-fiber", "plant-protein"] },
  { name: "Paneer (100g)", category: "Protein", calories: 265, protein: 18, carbs: 1.2, fat: 21, tags: ["vegetarian", "high-protein"] },

  // --- Carbohydrates ---
  { name: "Brown Rice (cooked, 150g)", category: "Carbs", calories: 216, protein: 4.5, carbs: 45, fat: 1.8, tags: ["complex-carb", "energy", "gluten-free"] },
  { name: "Oats (dry, 50g)", category: "Carbs", calories: 190, protein: 6.5, carbs: 33, fat: 3.4, tags: ["complex-carb", "breakfast", "high-fiber"] },
  { name: "Sweet Potato (100g)", category: "Carbs", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, tags: ["complex-carb", "vitamin-a", "energy"] },
  { name: "Whole Wheat Bread (2 slices)", category: "Carbs", calories: 160, protein: 7, carbs: 30, fat: 2.5, tags: ["complex-carb", "breakfast"] },
  { name: "Banana (1 medium)", category: "Carbs", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, tags: ["quick-energy", "pre-workout", "fruit"] },
  { name: "Quinoa (cooked, 150g)", category: "Carbs", calories: 222, protein: 8, carbs: 39, fat: 3.6, tags: ["complex-carb", "gluten-free", "complete-protein"] },
  { name: "White Rice (cooked, 150g)", category: "Carbs", calories: 194, protein: 3.5, carbs: 43, fat: 0.3, tags: ["energy", "easy-digest"] },

  // --- Vegetables ---
  { name: "Broccoli (100g)", category: "Vegetables", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, tags: ["vitamin-c", "fiber", "anti-inflammatory"] },
  { name: "Spinach (100g)", category: "Vegetables", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, tags: ["iron", "vitamin-k", "low-calorie"] },
  { name: "Mixed Salad (100g)", category: "Vegetables", calories: 20, protein: 1.5, carbs: 3, fat: 0.3, tags: ["low-calorie", "fiber", "vitamins"] },
  { name: "Bell Peppers (100g)", category: "Vegetables", calories: 31, protein: 1, carbs: 6, fat: 0.3, tags: ["vitamin-c", "antioxidant", "low-calorie"] },
  { name: "Cucumber (100g)", category: "Vegetables", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, tags: ["hydrating", "low-calorie"] },
  { name: "Tomatoes (100g)", category: "Vegetables", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, tags: ["lycopene", "vitamin-c", "low-calorie"] },

  // --- Healthy Fats ---
  { name: "Avocado (half)", category: "Healthy Fats", calories: 161, protein: 2, carbs: 9, fat: 15, tags: ["heart-health", "monounsaturated", "fiber"] },
  { name: "Almonds (30g)", category: "Healthy Fats", calories: 173, protein: 6.3, carbs: 6, fat: 15, tags: ["healthy-fats", "snack", "vitamin-e"] },
  { name: "Olive Oil (1 tbsp)", category: "Healthy Fats", calories: 119, protein: 0, carbs: 0, fat: 14, tags: ["heart-health", "monounsaturated"] },
  { name: "Chia Seeds (2 tbsp)", category: "Healthy Fats", calories: 138, protein: 4.7, carbs: 12, fat: 8.7, tags: ["omega-3", "fiber", "calcium"] },
  { name: "Peanut Butter (2 tbsp)", category: "Healthy Fats", calories: 188, protein: 8, carbs: 6, fat: 16, tags: ["healthy-fats", "protein", "snack"] },
  { name: "Walnuts (30g)", category: "Healthy Fats", calories: 196, protein: 4.6, carbs: 4, fat: 20, tags: ["omega-3", "brain-health", "snack"] },

  // --- Dairy ---
  { name: "Whole Milk (250ml)", category: "Dairy", calories: 149, protein: 8, carbs: 12, fat: 8, tags: ["calcium", "vitamin-d", "muscle-recovery"] },
  { name: "Low-Fat Milk (250ml)", category: "Dairy", calories: 102, protein: 8, carbs: 12, fat: 2.5, tags: ["calcium", "low-fat", "muscle-recovery"] },
  { name: "Cheddar Cheese (30g)", category: "Dairy", calories: 120, protein: 7, carbs: 0.4, fat: 10, tags: ["calcium", "protein"] },

  // --- Drinks ---
  { name: "Protein Shake (1 scoop)", category: "Supplements", calories: 130, protein: 25, carbs: 5, fat: 2, tags: ["post-workout", "muscle-gain", "high-protein"] },
  { name: "Green Tea (240ml)", category: "Drinks", calories: 2, protein: 0, carbs: 0.5, fat: 0, tags: ["antioxidant", "metabolism", "calorie-free"] },
  { name: "Black Coffee (240ml)", category: "Drinks", calories: 5, protein: 0.3, carbs: 0, fat: 0, tags: ["pre-workout", "metabolism", "calorie-free"] },
];
