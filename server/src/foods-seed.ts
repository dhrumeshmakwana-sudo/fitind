// FITIND food catalogue — first reviewed seed batch (Phase 2).
//
// Values are widely published standard reference values in the style of
// the Indian Food Composition Tables (IFCT 2017, NIN/ICMR) and standard
// dietetic references, per 100 g edible portion. Every seeded row is
// marked verification = "estimate" with the source text below: these
// are reference values, NOT lab-verified measurements of any specific
// plate. Home preparation (oil, ghee, portion of gravy vs solids)
// changes real values, and the notes say so where it matters most.
//
// Raw vs cooked is distinguished wherever the difference is large
// (rice, dals, chana, soya): cooking absorbs water, so cooked values
// per 100 g are far lower than raw.

export type SeedFood = {
  name: string;
  aliases: string;
  category: string;
  cuisine: string;
  dietFlag: "veg" | "vegan" | "eggetarian" | "non_veg";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  servingName: string;
  servingGrams: number;
  notes?: string;
};

export const FOOD_SOURCE =
  "Standard reference values (IFCT-style). Home preparation varies — treat as an estimate.";

export const FOOD_CATEGORIES = [
  "Breakfast",
  "Breads & Rice",
  "Dal & Legumes",
  "Sabzi & Curries",
  "South Indian",
  "Street Food & Snacks",
  "Dairy & Eggs",
  "Meat & Fish",
  "Fruits",
  "Vegetables",
  "Nuts, Seeds & Dry Fruits",
  "Sweets & Desserts",
  "Drinks",
  "Raw Ingredients",
] as const;

export const FOOD_CUISINES = [
  "Pan-Indian",
  "North Indian",
  "Punjabi",
  "Gujarati",
  "Maharashtrian",
  "South Indian",
  "Bengali",
] as const;

export const SEED_FOODS: SeedFood[] = [
  // ---------------------------------------------------------- Breakfast
  { name: "Poha", aliases: "pohe, beaten rice, avalakki, chivda (cooked)", category: "Breakfast", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 130, protein: 2.4, carbs: 24, fat: 2.8, fibre: 1.2, servingName: "1 plate", servingGrams: 150, notes: "With onion, peanuts and oil tempering." },
  { name: "Upma", aliases: "rava upma, uppittu, suji upma", category: "Breakfast", cuisine: "South Indian", dietFlag: "vegan", kcal: 132, protein: 3.4, carbs: 21, fat: 3.8, fibre: 1.6, servingName: "1 plate", servingGrams: 150 },
  { name: "Idli", aliases: "idly, rice cake", category: "Breakfast", cuisine: "South Indian", dietFlag: "vegan", kcal: 138, protein: 4.2, carbs: 27, fat: 1.2, fibre: 1.4, servingName: "1 piece", servingGrams: 40 },
  { name: "Vegetable Daliya", aliases: "dalia, broken wheat porridge, lapsi (savoury)", category: "Breakfast", cuisine: "North Indian", dietFlag: "vegan", kcal: 96, protein: 3.2, carbs: 17, fat: 1.6, fibre: 3.4, servingName: "1 bowl", servingGrams: 200 },
  { name: "Oats Porridge (with milk)", aliases: "oatmeal, oats", category: "Breakfast", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 96, protein: 3.9, carbs: 14, fat: 2.7, fibre: 1.7, servingName: "1 bowl", servingGrams: 200 },
  { name: "Aloo Paratha", aliases: "alu paratha, stuffed paratha", category: "Breakfast", cuisine: "Punjabi", dietFlag: "veg", kcal: 208, protein: 4.6, carbs: 30, fat: 7.8, fibre: 3.4, servingName: "1 paratha", servingGrams: 90, notes: "Pan-fried; ghee/oil used changes the fat a lot." },
  { name: "Methi Thepla", aliases: "thepla", category: "Breakfast", cuisine: "Gujarati", dietFlag: "vegan", kcal: 272, protein: 6.4, carbs: 38, fat: 10.5, fibre: 4.6, servingName: "1 thepla", servingGrams: 40 },
  { name: "Moong Dal Chilla", aliases: "moong cheela, pesarattu (no rice)", category: "Breakfast", cuisine: "North Indian", dietFlag: "vegan", kcal: 168, protein: 8.6, carbs: 21, fat: 5.4, fibre: 3.8, servingName: "1 chilla", servingGrams: 80 },
  { name: "Sabudana Khichdi", aliases: "sago khichdi, sabudana", category: "Breakfast", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 228, protein: 2.6, carbs: 36, fat: 8.2, fibre: 1.4, servingName: "1 plate", servingGrams: 150 },
  { name: "Bread (white), toasted", aliases: "toast, sandwich bread", category: "Breakfast", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 270, protein: 8.5, carbs: 49, fat: 3.6, fibre: 2.4, servingName: "1 slice", servingGrams: 25 },
  { name: "Bread (whole wheat)", aliases: "brown bread", category: "Breakfast", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 252, protein: 10, carbs: 43, fat: 3.4, fibre: 5.8, servingName: "1 slice", servingGrams: 25 },

  // ------------------------------------------------------ Breads & Rice
  { name: "Roti / Chapati", aliases: "chapati, phulka, roti", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 297, protein: 9.6, carbs: 54, fat: 3.9, fibre: 7.4, servingName: "1 roti", servingGrams: 30, notes: "Dry-roasted, no oil. With ghee smeared, add roughly 45 kcal per teaspoon of ghee." },
  { name: "Tandoori Roti", aliases: "tandoori roti", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "vegan", kcal: 282, protein: 8.8, carbs: 54, fat: 2.4, fibre: 5.2, servingName: "1 roti", servingGrams: 40 },
  { name: "Naan (plain)", aliases: "naan", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 310, protein: 8.6, carbs: 54, fat: 6.2, fibre: 2.6, servingName: "1 naan", servingGrams: 90 },
  { name: "Butter Naan", aliases: "naan with butter", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 336, protein: 8.4, carbs: 52, fat: 10, fibre: 2.6, servingName: "1 naan", servingGrams: 95 },
  { name: "Paratha (plain)", aliases: "plain paratha, layered paratha", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 325, protein: 6.8, carbs: 44, fat: 13.4, fibre: 4.2, servingName: "1 paratha", servingGrams: 60, notes: "Oil/ghee used in layering varies widely." },
  { name: "Puri", aliases: "poori", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 342, protein: 6.2, carbs: 44, fat: 15.6, fibre: 3.4, servingName: "1 puri", servingGrams: 20, notes: "Deep-fried; oil uptake varies." },
  { name: "Steamed Rice (cooked)", aliases: "cooked rice, plain rice, chawal", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, fibre: 0.4, servingName: "1 katori", servingGrams: 150 },
  { name: "Brown Rice (cooked)", aliases: "brown rice", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 112, protein: 2.6, carbs: 23, fat: 0.9, fibre: 1.8, servingName: "1 katori", servingGrams: 150 },
  { name: "Jeera Rice", aliases: "cumin rice", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 156, protein: 2.9, carbs: 27, fat: 4, fibre: 0.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Vegetable Pulao", aliases: "veg pulao, pilaf", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 148, protein: 3.6, carbs: 24, fat: 4.2, fibre: 1.8, servingName: "1 plate", servingGrams: 200 },
  { name: "Vegetable Biryani", aliases: "veg biryani, biriyani", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 164, protein: 4, carbs: 24, fat: 5.8, fibre: 2, servingName: "1 plate", servingGrams: 250, notes: "Oil and fried-onion topping vary a lot between kitchens." },
  { name: "Khichdi (moong dal)", aliases: "khichri, dal khichdi", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 118, protein: 4.4, carbs: 19, fat: 2.6, fibre: 2.2, servingName: "1 bowl", servingGrams: 250 },
  { name: "Curd Rice", aliases: "dahi chawal, thayir sadam", category: "Breads & Rice", cuisine: "South Indian", dietFlag: "veg", kcal: 108, protein: 3.4, carbs: 16, fat: 3.2, fibre: 0.4, servingName: "1 bowl", servingGrams: 200 },
  { name: "Lemon Rice", aliases: "nimbu chawal, chitranna", category: "Breads & Rice", cuisine: "South Indian", dietFlag: "vegan", kcal: 168, protein: 3.2, carbs: 26, fat: 5.6, fibre: 1, servingName: "1 plate", servingGrams: 200 },

  // ------------------------------------------------------ Dal & Legumes
  { name: "Dal Tadka (cooked)", aliases: "arhar dal, toor dal tadka, dal fry", category: "Dal & Legumes", cuisine: "North Indian", dietFlag: "vegan", kcal: 104, protein: 5.8, carbs: 14, fat: 2.8, fibre: 3.6, servingName: "1 katori", servingGrams: 150, notes: "Ghee tadka raises the fat; values assume a light oil tempering." },
  { name: "Dal Makhani", aliases: "kali dal, black dal", category: "Dal & Legumes", cuisine: "Punjabi", dietFlag: "veg", kcal: 138, protein: 5.6, carbs: 13, fat: 7.2, fibre: 3.8, servingName: "1 katori", servingGrams: 150, notes: "Butter and cream content varies widely." },
  { name: "Rajma Curry", aliases: "rajma masala, kidney bean curry", category: "Dal & Legumes", cuisine: "Punjabi", dietFlag: "vegan", kcal: 112, protein: 6.2, carbs: 16, fat: 2.6, fibre: 5.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Chole (cooked)", aliases: "chana masala, kabuli chana curry, chole masala", category: "Dal & Legumes", cuisine: "Punjabi", dietFlag: "vegan", kcal: 128, protein: 6.4, carbs: 18, fat: 3.6, fibre: 5.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Sambar", aliases: "sambhar", category: "Dal & Legumes", cuisine: "South Indian", dietFlag: "vegan", kcal: 64, protein: 3, carbs: 8.6, fat: 2, fibre: 2.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Moong Dal (cooked, plain)", aliases: "moong ki dal, split moong cooked", category: "Dal & Legumes", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 102, protein: 6.8, carbs: 15, fat: 1.6, fibre: 3.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Sprouted Moong (cooked)", aliases: "moong sprouts, ankurit moong", category: "Dal & Legumes", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 98, protein: 7, carbs: 14, fat: 1.4, fibre: 4.4, servingName: "1 katori", servingGrams: 100 },
  { name: "Kadhi", aliases: "gujarati kadhi, punjabi kadhi (no pakoda)", category: "Dal & Legumes", cuisine: "Gujarati", dietFlag: "veg", kcal: 72, protein: 2.6, carbs: 7, fat: 3.6, fibre: 0.6, servingName: "1 katori", servingGrams: 150, notes: "Without pakodas. With pakodas, values rise sharply." },

  // --------------------------------------------------- Sabzi & Curries
  { name: "Paneer Butter Masala", aliases: "paneer makhani, paneer curry", category: "Sabzi & Curries", cuisine: "Punjabi", dietFlag: "veg", kcal: 168, protein: 6.4, carbs: 6.4, fat: 13, fibre: 1.2, servingName: "1 katori", servingGrams: 150, notes: "Gravy is butter/cream based — richer versions go well above this." },
  { name: "Palak Paneer", aliases: "spinach paneer", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "veg", kcal: 116, protein: 6, carbs: 4.8, fat: 8.2, fibre: 2.4, servingName: "1 katori", servingGrams: 150 },
  { name: "Paneer Bhurji", aliases: "paneer scramble", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "veg", kcal: 172, protein: 11.4, carbs: 4.6, fat: 12, fibre: 0.8, servingName: "1 katori", servingGrams: 120 },
  { name: "Soya Chunks Curry", aliases: "soya curry, nutri curry, meal maker curry", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 136, protein: 12.6, carbs: 8.4, fat: 5.8, fibre: 3.4, servingName: "1 katori", servingGrams: 150 },
  { name: "Aloo Gobi", aliases: "potato cauliflower sabzi", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 92, protein: 2.2, carbs: 11, fat: 4.4, fibre: 2.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Bhindi Masala", aliases: "okra sabzi, bhindi ki sabzi", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 106, protein: 2.2, carbs: 7.6, fat: 7.6, fibre: 3.6, servingName: "1 katori", servingGrams: 120 },
  { name: "Baingan Bharta", aliases: "brinjal bharta, begun bhorta", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 88, protein: 1.8, carbs: 8, fat: 5.6, fibre: 3.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Mixed Vegetable Sabzi", aliases: "mix veg, mixed veg curry", category: "Sabzi & Curries", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 86, protein: 2.4, carbs: 9.4, fat: 4.4, fibre: 3, servingName: "1 katori", servingGrams: 150 },
  { name: "Pav Bhaji (bhaji only)", aliases: "bhaji, bombay bhaji", category: "Sabzi & Curries", cuisine: "Maharashtrian", dietFlag: "veg", kcal: 142, protein: 3.2, carbs: 14, fat: 8.2, fibre: 3.4, servingName: "1 plate bhaji", servingGrams: 200, notes: "Bhaji only — log the pav separately. Butter on top adds up fast." },
  { name: "Undhiyu", aliases: "undhiya, gujarati mixed veg", category: "Sabzi & Curries", cuisine: "Gujarati", dietFlag: "vegan", kcal: 148, protein: 3.8, carbs: 15, fat: 8.2, fibre: 4.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Misal (sprouts curry)", aliases: "misal, usal", category: "Sabzi & Curries", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 152, protein: 7.4, carbs: 17, fat: 6.2, fibre: 5, servingName: "1 bowl", servingGrams: 200, notes: "Without farsan topping and pav — log those separately." },
  { name: "Dhokla", aliases: "khaman dhokla, khaman", category: "Sabzi & Curries", cuisine: "Gujarati", dietFlag: "vegan", kcal: 112, protein: 4.6, carbs: 17, fat: 2.8, fibre: 1.6, servingName: "1 piece", servingGrams: 40 },

  // ------------------------------------------------------- South Indian
  { name: "Masala Dosa", aliases: "mysore masala dosa, dosa with aloo", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 168, protein: 3.8, carbs: 25, fat: 5.8, fibre: 2, servingName: "1 dosa", servingGrams: 180, notes: "Includes potato filling; ghee roast versions are higher in fat." },
  { name: "Plain Dosa", aliases: "sada dosa, dosai", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 214, protein: 4.4, carbs: 32, fat: 7.4, fibre: 1.4, servingName: "1 dosa", servingGrams: 100 },
  { name: "Rava Dosa", aliases: "rava dosai, semolina dosa", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 238, protein: 4.6, carbs: 33, fat: 9.6, fibre: 1.2, servingName: "1 dosa", servingGrams: 100 },
  { name: "Medu Vada", aliases: "vada, ulundu vadai, garelu", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 332, protein: 9.4, carbs: 31, fat: 18.6, fibre: 3.4, servingName: "1 vada", servingGrams: 35, notes: "Deep-fried; oil uptake varies." },
  { name: "Uttapam (onion)", aliases: "uttappa, onion uttapam", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 186, protein: 4.2, carbs: 27, fat: 6.6, fibre: 1.8, servingName: "1 uttapam", servingGrams: 130 },
  { name: "Pongal", aliases: "ven pongal, khara pongal", category: "South Indian", cuisine: "South Indian", dietFlag: "veg", kcal: 146, protein: 4.8, carbs: 20, fat: 5.2, fibre: 1.6, servingName: "1 bowl", servingGrams: 200 },
  { name: "Appam", aliases: "hoppers, aappam", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 118, protein: 2, carbs: 24, fat: 1.4, fibre: 0.6, servingName: "1 appam", servingGrams: 60 },
  { name: "Rasam", aliases: "tomato rasam, charu", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 32, protein: 1.2, carbs: 3.8, fat: 1.4, fibre: 0.8, servingName: "1 katori", servingGrams: 150 },
  { name: "Coconut Chutney", aliases: "nariyal chutney, thengai chutney", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 196, protein: 2.4, carbs: 6.4, fat: 18.4, fibre: 3, servingName: "2 tbsp", servingGrams: 30 },

  // --------------------------------------------- Street Food & Snacks
  { name: "Vada Pav", aliases: "vada pao, bombay burger", category: "Street Food & Snacks", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 286, protein: 5.6, carbs: 39, fat: 11.8, fibre: 2.8, servingName: "1 vada pav", servingGrams: 140, notes: "Whole sandwich: pav + batata vada + chutneys." },
  { name: "Samosa", aliases: "aloo samosa", category: "Street Food & Snacks", cuisine: "North Indian", dietFlag: "vegan", kcal: 262, protein: 4.2, carbs: 30, fat: 13.8, fibre: 2.6, servingName: "1 samosa", servingGrams: 100, notes: "Deep-fried; size and oil uptake vary a lot." },
  { name: "Bhel Puri", aliases: "bhel, bhelpuri", category: "Street Food & Snacks", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 158, protein: 3.6, carbs: 26, fat: 4.6, fibre: 2.4, servingName: "1 plate", servingGrams: 120 },
  { name: "Sev Puri", aliases: "sev poori", category: "Street Food & Snacks", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 238, protein: 4.8, carbs: 30, fat: 11, fibre: 2.6, servingName: "1 plate (6 puri)", servingGrams: 120 },
  { name: "Pani Puri", aliases: "golgappa, puchka, gupchup", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 152, protein: 3.4, carbs: 23, fat: 5.2, fibre: 2.2, servingName: "1 plate (6 puri)", servingGrams: 130 },
  { name: "Dabeli", aliases: "kutchi dabeli", category: "Street Food & Snacks", cuisine: "Gujarati", dietFlag: "vegan", kcal: 224, protein: 4.4, carbs: 34, fat: 7.8, fibre: 2.6, servingName: "1 dabeli", servingGrams: 110 },
  { name: "Aloo Tikki", aliases: "potato tikki, tikki chaat base", category: "Street Food & Snacks", cuisine: "North Indian", dietFlag: "vegan", kcal: 242, protein: 3, carbs: 27, fat: 13.6, fibre: 2.4, servingName: "1 tikki", servingGrams: 60, notes: "Shallow/deep fried; without curd and chutneys." },
  { name: "Onion Pakora", aliases: "pakoda, bhajiya, onion bhaji", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 292, protein: 5.4, carbs: 24, fat: 19.4, fibre: 3.2, servingName: "1 plate", servingGrams: 80, notes: "Deep-fried; oil uptake varies." },
  { name: "Roasted Makhana", aliases: "fox nuts, lotus seeds, phool makhana", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 348, protein: 9.7, carbs: 77, fat: 0.1, fibre: 14.5, servingName: "1 bowl", servingGrams: 30, notes: "Plain roasted. Ghee-roasted adds roughly 45 kcal per teaspoon of ghee used." },
  { name: "Roasted Chana", aliases: "bhuna chana, roasted gram", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 392, protein: 19.4, carbs: 58, fat: 9.2, fibre: 16.8, servingName: "1 handful", servingGrams: 40 },
  { name: "Khakhra", aliases: "khakhra (plain)", category: "Street Food & Snacks", cuisine: "Gujarati", dietFlag: "vegan", kcal: 402, protein: 9.8, carbs: 62, fat: 12.6, fibre: 5.4, servingName: "1 khakhra", servingGrams: 15 },
  { name: "Namkeen Mixture", aliases: "mixture, farsan, chivda mixture", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 528, protein: 9.4, carbs: 44, fat: 34.8, fibre: 4.2, servingName: "1 small bowl", servingGrams: 40, notes: "Fried snack mixes vary widely by brand and recipe." },

  // ------------------------------------------------------ Dairy & Eggs
  { name: "Milk (toned)", aliases: "toned milk, doodh", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 62, protein: 3.2, carbs: 4.8, fat: 3.3, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Milk (full cream)", aliases: "full cream milk, whole milk", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 68, protein: 3.3, carbs: 4.9, fat: 3.9, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Milk (skimmed)", aliases: "skim milk, double toned", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 35, protein: 3.4, carbs: 5, fat: 0.1, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Curd (dahi)", aliases: "dahi, yogurt, plain curd", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 62, protein: 3.1, carbs: 4.7, fat: 3.3, fibre: 0, servingName: "1 katori", servingGrams: 100 },
  { name: "Greek Yogurt (plain)", aliases: "greek yoghurt, hung curd (approx)", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 97, protein: 9, carbs: 3.6, fat: 5, fibre: 0, servingName: "1 cup", servingGrams: 150, notes: "Plain, unsweetened. Flavoured versions carry added sugar." },
  { name: "Paneer", aliases: "cottage cheese, fresh paneer", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 265, protein: 18.3, carbs: 3.6, fat: 20.8, fibre: 0, servingName: "1 serving (cubes)", servingGrams: 50, notes: "Whole-milk paneer. Low-fat paneer is leaner." },
  { name: "Chaas (buttermilk)", aliases: "buttermilk, masala chaas, taak", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 26, protein: 1.6, carbs: 3, fat: 0.8, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Sweet Lassi", aliases: "lassi, punjabi lassi", category: "Dairy & Eggs", cuisine: "Punjabi", dietFlag: "veg", kcal: 96, protein: 3.2, carbs: 13.4, fat: 3.4, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200, notes: "Sugar content varies by shop." },
  { name: "Cheese Slice (processed)", aliases: "cheese slice, processed cheese", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 302, protein: 16.8, carbs: 4.6, fat: 24, fibre: 0, servingName: "1 slice", servingGrams: 20 },
  { name: "Ghee", aliases: "clarified butter, desi ghee", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 900, protein: 0, carbs: 0, fat: 99.7, fibre: 0, servingName: "1 tsp", servingGrams: 5 },
  { name: "Butter", aliases: "makhan, table butter", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 717, protein: 0.9, carbs: 0.1, fat: 81, fibre: 0, servingName: "1 tsp", servingGrams: 5 },
  { name: "Egg (boiled, whole)", aliases: "boiled egg, anda", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 155, protein: 13.3, carbs: 1.1, fat: 10.6, fibre: 0, servingName: "1 egg", servingGrams: 50 },
  { name: "Egg White (boiled)", aliases: "egg white", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fibre: 0, servingName: "1 white", servingGrams: 33 },
  { name: "Omelette (2 eggs)", aliases: "omelet, anda omelette", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 184, protein: 11.8, carbs: 1.6, fat: 14.4, fibre: 0.2, servingName: "1 omelette", servingGrams: 110, notes: "Cooked in oil; amount of oil changes the fat." },
  { name: "Egg Bhurji", aliases: "anda bhurji, egg scramble indian", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 176, protein: 11.2, carbs: 2.8, fat: 13.2, fibre: 0.6, servingName: "1 katori", servingGrams: 120 },

  // ------------------------------------------------------- Meat & Fish
  { name: "Chicken Curry (home style)", aliases: "chicken masala, murgh curry", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "non_veg", kcal: 158, protein: 15.2, carbs: 3.6, fat: 9.2, fibre: 0.8, servingName: "1 katori (with bone pieces)", servingGrams: 150, notes: "Meat + gravy mix; skin-on and oil change values." },
  { name: "Butter Chicken", aliases: "murgh makhani", category: "Meat & Fish", cuisine: "Punjabi", dietFlag: "non_veg", kcal: 174, protein: 12.4, carbs: 5.6, fat: 11.4, fibre: 0.8, servingName: "1 katori", servingGrams: 150, notes: "Butter/cream gravy — restaurant versions run higher." },
  { name: "Chicken Biryani", aliases: "murgh biryani", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "non_veg", kcal: 178, protein: 7.8, carbs: 22, fat: 6.6, fibre: 1.2, servingName: "1 plate", servingGrams: 300 },
  { name: "Grilled Chicken Breast", aliases: "chicken breast grilled, tandoori breast", category: "Meat & Fish", cuisine: "Pan-Indian", dietFlag: "non_veg", kcal: 165, protein: 31, carbs: 0, fat: 3.6, fibre: 0, servingName: "1 breast piece", servingGrams: 120, notes: "Skinless, cooked weight." },
  { name: "Tandoori Chicken", aliases: "tandoori murgh", category: "Meat & Fish", cuisine: "Punjabi", dietFlag: "non_veg", kcal: 148, protein: 21.4, carbs: 2.4, fat: 5.6, fibre: 0.4, servingName: "1 leg piece", servingGrams: 130, notes: "Skinless pieces; with skin, fat is higher." },
  { name: "Egg Curry", aliases: "anda curry", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "eggetarian", kcal: 142, protein: 7.6, carbs: 4.2, fat: 10.6, fibre: 0.8, servingName: "1 katori (2 eggs + gravy)", servingGrams: 160 },
  { name: "Fish Curry (rohu)", aliases: "macher jhol, rohu curry", category: "Meat & Fish", cuisine: "Bengali", dietFlag: "non_veg", kcal: 118, protein: 13.2, carbs: 2.8, fat: 5.8, fibre: 0.6, servingName: "1 katori (1 piece + gravy)", servingGrams: 150 },
  { name: "Mutton Curry", aliases: "gosht curry, mutton masala", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "non_veg", kcal: 186, protein: 14.6, carbs: 3.2, fat: 12.8, fibre: 0.6, servingName: "1 katori", servingGrams: 150, notes: "Fat depends heavily on the cut and gravy oil." },

  // ------------------------------------------------------------- Fruits
  { name: "Banana", aliases: "kela, robosta banana", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fibre: 2.6, servingName: "1 medium banana", servingGrams: 100 },
  { name: "Apple", aliases: "seb", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fibre: 2.4, servingName: "1 medium apple", servingGrams: 150 },
  { name: "Mango (ripe)", aliases: "aam, alphonso (approx)", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, fibre: 1.6, servingName: "1 medium mango", servingGrams: 200 },
  { name: "Orange", aliases: "santra, nagpur orange", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fibre: 2.4, servingName: "1 orange", servingGrams: 130 },
  { name: "Papaya (ripe)", aliases: "papita", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fibre: 1.7, servingName: "1 bowl cubes", servingGrams: 150 },
  { name: "Guava", aliases: "amrood, peru", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 68, protein: 2.6, carbs: 14.3, fat: 1, fibre: 5.4, servingName: "1 guava", servingGrams: 100 },
  { name: "Pomegranate", aliases: "anar, dalimb", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fibre: 4, servingName: "1 fruit (arils)", servingGrams: 150 },
  { name: "Watermelon", aliases: "tarbooj, tarbuj", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fibre: 0.4, servingName: "1 bowl cubes", servingGrams: 200 },
  { name: "Grapes", aliases: "angoor", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fibre: 0.9, servingName: "1 small bunch", servingGrams: 100 },
  { name: "Chikoo (sapota)", aliases: "sapota, chiku", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 83, protein: 0.4, carbs: 19.9, fat: 1.1, fibre: 5.3, servingName: "1 fruit", servingGrams: 80 },

  // --------------------------------------------------------- Vegetables
  { name: "Potato (raw)", aliases: "aloo (raw)", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 77, protein: 2, carbs: 17.5, fat: 0.1, fibre: 2.1, servingName: "1 medium potato", servingGrams: 100, notes: "Raw weight — cooked sabzi values differ with oil." },
  { name: "Onion (raw)", aliases: "pyaaz, kanda", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fibre: 1.7, servingName: "1 medium onion", servingGrams: 70 },
  { name: "Tomato (raw)", aliases: "tamatar", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fibre: 1.2, servingName: "1 medium tomato", servingGrams: 90 },
  { name: "Spinach (palak, raw)", aliases: "palak, spinach leaves", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fibre: 2.2, servingName: "1 bunch", servingGrams: 100 },
  { name: "Cucumber", aliases: "kheera, kakdi", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fibre: 0.5, servingName: "1 cucumber", servingGrams: 100 },
  { name: "Carrot (raw)", aliases: "gajar", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fibre: 2.8, servingName: "1 carrot", servingGrams: 60 },
  { name: "Sweet Corn (boiled)", aliases: "makka, corn kernels", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 96, protein: 3.4, carbs: 21, fat: 1.5, fibre: 2.4, servingName: "1 small bowl", servingGrams: 100 },

  // --------------------------------------- Nuts, Seeds & Dry Fruits
  { name: "Almonds", aliases: "badam", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fibre: 12.5, servingName: "10 almonds", servingGrams: 12 },
  { name: "Cashews", aliases: "kaju", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fibre: 3.3, servingName: "10 cashews", servingGrams: 15 },
  { name: "Walnuts", aliases: "akhrot", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fibre: 6.7, servingName: "4 halves", servingGrams: 12 },
  { name: "Peanuts (roasted)", aliases: "moongphali, groundnuts roasted", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fibre: 8.5, servingName: "1 handful", servingGrams: 30 },
  { name: "Raisins", aliases: "kishmish, manuka", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 299, protein: 3.1, carbs: 79.2, fat: 0.5, fibre: 3.7, servingName: "1 tbsp", servingGrams: 15 },
  { name: "Dates (dried)", aliases: "khajoor, khajur", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 282, protein: 2.5, carbs: 75, fat: 0.4, fibre: 8, servingName: "3 dates", servingGrams: 24 },
  { name: "Flax Seeds", aliases: "alsi, linseed", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fibre: 27.3, servingName: "1 tbsp", servingGrams: 10 },
  { name: "Chia Seeds", aliases: "chia", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fibre: 34.4, servingName: "1 tbsp", servingGrams: 12 },
  { name: "Pumpkin Seeds", aliases: "kaddu ke beej", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 559, protein: 30.2, carbs: 10.7, fat: 49, fibre: 6, servingName: "1 tbsp", servingGrams: 12 },
  { name: "Peanut Butter", aliases: "peanut butter (unsweetened)", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 588, protein: 25.1, carbs: 19.6, fat: 50, fibre: 6, servingName: "1 tbsp", servingGrams: 16, notes: "Unsweetened. Sweetened spreads carry added sugar and oil." },

  // -------------------------------------------------- Sweets & Desserts
  { name: "Jalebi", aliases: "jilebi, imarti (similar)", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 412, protein: 1.8, carbs: 68, fat: 15.2, fibre: 0.4, servingName: "2 pieces", servingGrams: 50, notes: "Fried and syrup-soaked — among the most variable sweets." },
  { name: "Gulab Jamun", aliases: "gulab jamoon", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 382, protein: 4.4, carbs: 56, fat: 15.8, fibre: 0.6, servingName: "1 piece", servingGrams: 40 },
  { name: "Rasgulla", aliases: "rosogolla", category: "Sweets & Desserts", cuisine: "Bengali", dietFlag: "veg", kcal: 124, protein: 3.8, carbs: 22.4, fat: 2.2, fibre: 0, servingName: "1 piece", servingGrams: 50, notes: "Squeezed of excess syrup." },
  { name: "Kaju Katli", aliases: "kaju barfi", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 508, protein: 8.2, carbs: 56, fat: 28.4, fibre: 1.4, servingName: "1 piece", servingGrams: 12 },
  { name: "Besan Ladoo", aliases: "besan laddu", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 468, protein: 7.4, carbs: 54, fat: 25.2, fibre: 3.2, servingName: "1 ladoo", servingGrams: 30 },
  { name: "Sandesh", aliases: "sondesh", category: "Sweets & Desserts", cuisine: "Bengali", dietFlag: "veg", kcal: 148, protein: 6.8, carbs: 18.4, fat: 5.4, fibre: 0, servingName: "1 piece", servingGrams: 30 },

  // -------------------------------------------------------------- Drinks
  { name: "Masala Chai (with milk & sugar)", aliases: "chai, tea, cutting chai", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 46, protein: 1.4, carbs: 6.8, fat: 1.5, fibre: 0, servingName: "1 cup (150 ml)", servingGrams: 150, notes: "Assumes roughly 2 tsp sugar per cup. Unsweetened is about half the calories." },
  { name: "Filter Coffee (with milk & sugar)", aliases: "filter coffee, kaapi", category: "Drinks", cuisine: "South Indian", dietFlag: "veg", kcal: 52, protein: 1.6, carbs: 8.2, fat: 1.5, fibre: 0, servingName: "1 tumbler (150 ml)", servingGrams: 150 },
  { name: "Coconut Water", aliases: "nariyal pani, elaneer", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fibre: 1.1, servingName: "1 glass (250 ml)", servingGrams: 250 },
  { name: "Sugarcane Juice", aliases: "ganne ka ras", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 58, protein: 0.2, carbs: 14.6, fat: 0.1, fibre: 0.2, servingName: "1 glass (250 ml)", servingGrams: 250 },
  { name: "Orange Juice (fresh, unsweetened)", aliases: "orange juice", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 45, protein: 0.7, carbs: 10.4, fat: 0.2, fibre: 0.2, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Nimbu Pani (sweetened)", aliases: "shikanji, lemonade", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 24, protein: 0.1, carbs: 6.2, fat: 0, fibre: 0.1, servingName: "1 glass (250 ml)", servingGrams: 250, notes: "Salted/unsweetened nimbu pani is near zero calories." },

  // ----------------------------------------------------- Raw Ingredients
  { name: "Rice (raw, milled)", aliases: "raw rice, uncooked rice, chawal (raw)", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 360, protein: 6.8, carbs: 78.2, fat: 0.5, fibre: 2.8, servingName: "1 katori raw", servingGrams: 60, notes: "Raw weight. Cooked rice is roughly one-third of these values per 100 g." },
  { name: "Whole Wheat Flour (atta)", aliases: "atta, gehun ka atta, wheat flour", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 341, protein: 12.1, carbs: 69.4, fat: 1.7, fibre: 11.2, servingName: "1 cup", servingGrams: 120 },
  { name: "Toor Dal (raw)", aliases: "arhar dal raw, tur dal uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 335, protein: 22.3, carbs: 57.6, fat: 1.7, fibre: 15.2, servingName: "1 katori raw", servingGrams: 50, notes: "Raw weight. Cooked dal is roughly one-third of these values per 100 g." },
  { name: "Moong Dal (raw, split)", aliases: "moong dal uncooked, split green gram", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 347, protein: 24.5, carbs: 59.9, fat: 1.2, fibre: 16.3, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Chana Dal (raw)", aliases: "bengal gram dal uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 360, protein: 20.8, carbs: 59.8, fat: 5.6, fibre: 17.4, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Kabuli Chana (raw)", aliases: "white chickpeas uncooked, chole raw", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 364, protein: 19.3, carbs: 60.9, fat: 6, fibre: 17.4, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Rajma (raw)", aliases: "kidney beans uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 333, protein: 23.6, carbs: 60, fat: 0.8, fibre: 24.9, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Soya Chunks (dry)", aliases: "soya granules, nutri nuggets, meal maker dry", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 345, protein: 52, carbs: 32.8, fat: 0.5, fibre: 13, servingName: "1 katori dry", servingGrams: 40, notes: "Dry weight — chunks roughly triple in weight when soaked." },
  { name: "Besan (gram flour)", aliases: "chickpea flour, chana atta", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 387, protein: 22.4, carbs: 57.8, fat: 6.7, fibre: 10.8, servingName: "1 cup", servingGrams: 100 },
  { name: "Rolled Oats (dry)", aliases: "oats dry, oatmeal uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fibre: 10.6, servingName: "1 small bowl dry", servingGrams: 40 },
  { name: "Sugar", aliases: "cheeni, table sugar", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 387, protein: 0, carbs: 99.8, fat: 0, fibre: 0, servingName: "1 tsp", servingGrams: 4 },
  { name: "Jaggery", aliases: "gur, gud", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 383, protein: 0.4, carbs: 98.5, fat: 0.1, fibre: 0, servingName: "1 tsp", servingGrams: 5 },
  { name: "Honey", aliases: "shahad", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 304, protein: 0.3, carbs: 82.4, fat: 0, fibre: 0.2, servingName: "1 tbsp", servingGrams: 21 },
  { name: "Cooking Oil (generic)", aliases: "oil, vegetable oil, sunflower oil", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 900, protein: 0, carbs: 0, fat: 100, fibre: 0, servingName: "1 tsp", servingGrams: 5, notes: "All common cooking oils are ~900 kcal per 100 g." },
];
