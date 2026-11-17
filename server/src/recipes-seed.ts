// FITIND recipe library — Phase 4 seed batch.
//
// Every ingredient references a food that already exists in the Phase 2
// catalogue (matched by exact name at seed time). A recipe's nutrition
// is NEVER stored: it is calculated from its ingredients' catalogue
// per-100 g values × ingredient grams ÷ servings, so a recipe can never
// drift from the catalogue. Values are therefore estimates in exactly
// the same sense as the catalogue itself — home preparation varies.

export type SeedRecipeIngredient = {
  foodName: string;
  grams: number;
};

export type SeedRecipe = {
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "snacks";
  dietFlag: "veg" | "vegan" | "eggetarian" | "non_veg";
  servings: number;
  prepMinutes: number;
  cookMinutes: number | null;
  budget: boolean;
  steps: string[];
  ingredients: SeedRecipeIngredient[];
};

export const SEED_RECIPES: SeedRecipe[] = [
  // ---------------------------------------------------------- breakfast
  {
    name: "Besan Chilla with Onion & Tomato",
    description: "Savoury gram-flour pancakes — crisp edges, soft middle.",
    category: "breakfast",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: true,
    steps: [
      "Whisk the besan with about 250 ml water, salt, turmeric and chilli into a pourable batter. Rest 10 minutes.",
      "Stir in the finely chopped onion and tomato.",
      "Heat a tawa, grease lightly with oil, and spread a ladle of batter like a dosa.",
      "Cook 2–3 minutes per side until golden at the edges. Repeat for the rest.",
      "Serve hot with green chutney or curd.",
    ],
    ingredients: [
      { foodName: "Besan (gram flour)", grams: 120 },
      { foodName: "Onion (raw)", grams: 60 },
      { foodName: "Tomato (raw)", grams: 60 },
      { foodName: "Cooking Oil (generic)", grams: 10 },
    ],
  },
  {
    name: "Protein Oats Bowl",
    description: "Oats cooked in milk with banana, peanut butter and chia.",
    category: "breakfast",
    dietFlag: "veg",
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 8,
    budget: false,
    steps: [
      "Simmer the oats in the milk for 6–8 minutes, stirring, until thick.",
      "Take off the heat and stir in the peanut butter.",
      "Top with sliced banana and the chia seeds. Eat warm.",
    ],
    ingredients: [
      { foodName: "Rolled Oats (dry)", grams: 40 },
      { foodName: "Milk (toned)", grams: 250 },
      { foodName: "Banana", grams: 100 },
      { foodName: "Peanut Butter", grams: 16 },
      { foodName: "Chia Seeds", grams: 10 },
    ],
  },
  {
    name: "Sprouted Moong Chaat",
    description: "Crunchy sprouts with onion, tomato and roasted peanuts.",
    category: "breakfast",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: null,
    budget: true,
    steps: [
      "Steam the sprouted moong for 4–5 minutes if you prefer it softer; it is fine raw too.",
      "Toss with chopped onion, tomato and cucumber.",
      "Season with salt, chaat masala and lemon juice. Top with peanuts.",
    ],
    ingredients: [
      { foodName: "Sprouted Moong (cooked)", grams: 300 },
      { foodName: "Onion (raw)", grams: 60 },
      { foodName: "Tomato (raw)", grams: 100 },
      { foodName: "Cucumber", grams: 100 },
      { foodName: "Peanuts (roasted)", grams: 30 },
    ],
  },
  {
    name: "Masala Egg Bhurji Toast",
    description: "Spiced scrambled eggs on whole-wheat toast.",
    category: "breakfast",
    dietFlag: "eggetarian",
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Soften the onion in oil, add tomato and cook down to a masala.",
      "Pour in beaten eggs with salt and turmeric; scramble on low heat until just set.",
      "Pile onto toasted bread and serve immediately.",
    ],
    ingredients: [
      { foodName: "Egg (boiled, whole)", grams: 100 },
      { foodName: "Onion (raw)", grams: 50 },
      { foodName: "Tomato (raw)", grams: 50 },
      { foodName: "Cooking Oil (generic)", grams: 5 },
      { foodName: "Bread (whole wheat)", grams: 50 },
    ],
  },
  {
    name: "Paneer Stuffed Paratha",
    description: "Whole-wheat parathas with a spiced paneer filling and curd.",
    category: "breakfast",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 20,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Knead the atta with water and a pinch of salt into a soft dough. Rest 15 minutes.",
      "Crumble the paneer with salt, green chilli and coriander.",
      "Roll, fill, seal and roll again gently so the filling stays in.",
      "Cook on a hot tawa with a little ghee until both sides are spotted and crisp.",
      "Serve with the curd on the side.",
    ],
    ingredients: [
      { foodName: "Whole Wheat Flour (atta)", grams: 120 },
      { foodName: "Paneer", grams: 100 },
      { foodName: "Ghee", grams: 10 },
      { foodName: "Curd (dahi)", grams: 100 },
    ],
  },
  {
    name: "Idli Sambar Plate",
    description: "Soft idlis with a bowl of hot sambar for dipping.",
    category: "breakfast",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 15,
    budget: true,
    steps: [
      "Steam the idlis until a knife comes out clean (about 12–15 minutes).",
      "Warm the sambar until it just boils; check salt.",
      "Serve three idlis per plate with sambar poured over and more on the side.",
    ],
    ingredients: [
      { foodName: "Idli", grams: 240 },
      { foodName: "Sambar", grams: 300 },
    ],
  },

  // -------------------------------------------------------------- lunch
  {
    name: "Rajma Chawal",
    description: "Kidney-bean curry over steamed rice. Sunday food.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 40,
    budget: true,
    steps: [
      "Soak the rajma overnight; pressure-cook until soft, keeping the cooking water.",
      "Brown the onion in oil, add tomato and cook to a thick masala with ginger, garlic and spices.",
      "Add rajma with its water; simmer 15 minutes, mashing a few beans to thicken.",
      "Serve over the steamed rice.",
    ],
    ingredients: [
      { foodName: "Rajma (raw)", grams: 200 },
      { foodName: "Steamed Rice (cooked)", grams: 600 },
      { foodName: "Onion (raw)", grams: 100 },
      { foodName: "Tomato (raw)", grams: 150 },
      { foodName: "Cooking Oil (generic)", grams: 20 },
    ],
  },
  {
    name: "Chole with Brown Rice",
    description: "Amritsari-style chickpeas, tangy and dark, with brown rice.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 45,
    budget: true,
    steps: [
      "Soak the chana overnight; pressure-cook with a tea bag or amla for colour.",
      "Cook onion and tomato down with chole masala until the oil separates.",
      "Add chana with its water; simmer 15–20 minutes.",
      "Serve over brown rice with sliced onion and lemon.",
    ],
    ingredients: [
      { foodName: "Kabuli Chana (raw)", grams: 200 },
      { foodName: "Brown Rice (cooked)", grams: 600 },
      { foodName: "Onion (raw)", grams: 100 },
      { foodName: "Tomato (raw)", grams: 150 },
      { foodName: "Cooking Oil (generic)", grams: 20 },
    ],
  },
  {
    name: "Palak Paneer with Roti",
    description: "Spinach and paneer, lightly spiced, with two rotis.",
    category: "lunch",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 15,
    cookMinutes: 20,
    budget: false,
    steps: [
      "Blanch the spinach, cool and blend coarse — keep some texture.",
      "Soften onion and tomato in oil with cumin, ginger and garlic.",
      "Add the spinach, simmer 5 minutes, then fold in paneer cubes.",
      "Serve with hot rotis.",
    ],
    ingredients: [
      { foodName: "Spinach (palak, raw)", grams: 300 },
      { foodName: "Paneer", grams: 150 },
      { foodName: "Onion (raw)", grams: 60 },
      { foodName: "Tomato (raw)", grams: 80 },
      { foodName: "Cooking Oil (generic)", grams: 10 },
      { foodName: "Roti / Chapati", grams: 120 },
    ],
  },
  {
    name: "Soya Chunks Curry with Rice",
    description: "The budget protein hero — meaty soya in a tomato-onion gravy.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 25,
    budget: true,
    steps: [
      "Boil the soya chunks 5 minutes, cool and squeeze dry.",
      "Brown onion in oil, add tomato and spices; cook to a masala.",
      "Add the chunks with a splash of water; simmer 10 minutes so they drink the gravy.",
      "Serve over steamed rice.",
    ],
    ingredients: [
      { foodName: "Soya Chunks (dry)", grams: 80 },
      { foodName: "Onion (raw)", grams: 80 },
      { foodName: "Tomato (raw)", grams: 100 },
      { foodName: "Cooking Oil (generic)", grams: 10 },
      { foodName: "Steamed Rice (cooked)", grams: 300 },
    ],
  },
  {
    name: "Dal Tadka with Jeera Rice",
    description: "Ghee-garlic tadka dal over cumin rice.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the dal tadka and jeera rice.",
      "For a fresh tadka: sizzle garlic, dried red chilli and cumin in a spoon of oil and pour over the dal.",
      "Serve the dal over the rice with a wedge of lemon.",
    ],
    ingredients: [
      { foodName: "Dal Tadka (cooked)", grams: 300 },
      { foodName: "Jeera Rice", grams: 300 },
    ],
  },
  {
    name: "Home-Style Chicken Curry with Rice",
    description: "Thin, spicy, everyday chicken curry — not the restaurant kind.",
    category: "lunch",
    dietFlag: "non_veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Warm the chicken curry until the gravy is bubbling.",
      "Rest 5 minutes so the chicken stays juicy.",
      "Serve over steamed rice with onion and lemon on the side.",
    ],
    ingredients: [
      { foodName: "Chicken Curry (home style)", grams: 300 },
      { foodName: "Steamed Rice (cooked)", grams: 300 },
    ],
  },
  {
    name: "Khichdi with Kadhi",
    description: "Soft moong-dal khichdi with a bowl of tangy kadhi. Comfort food.",
    category: "lunch",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the khichdi; loosen with a little hot water if it has set.",
      "Warm the kadhi gently — do not boil hard or it can split.",
      "Serve kadhi poured beside (or over) the khichdi, with papad if you have it.",
    ],
    ingredients: [
      { foodName: "Khichdi (moong dal)", grams: 400 },
      { foodName: "Kadhi", grams: 200 },
    ],
  },
  {
    name: "Curd Rice with Pomegranate",
    description: "Cool, tempered curd rice — the South Indian reset button.",
    category: "lunch",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 5,
    budget: true,
    steps: [
      "Mash the warm rice slightly and mix with the curd and salt.",
      "Temper mustard seeds, curry leaves and a dried chilli in the oil; pour over.",
      "Fold in the pomegranate seeds. Serve cool.",
    ],
    ingredients: [
      { foodName: "Steamed Rice (cooked)", grams: 300 },
      { foodName: "Curd (dahi)", grams: 200 },
      { foodName: "Pomegranate", grams: 40 },
      { foodName: "Cooking Oil (generic)", grams: 5 },
    ],
  },

  // ------------------------------------------------------------- dinner
  {
    name: "Grilled Chicken with Corn & Salad",
    description: "High-protein plate: grilled chicken, sweet corn, crunchy salad.",
    category: "dinner",
    dietFlag: "non_veg",
    servings: 1,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Grill or pan-sear the chicken until cooked through; rest 5 minutes and slice.",
      "Warm the sweet corn with a pinch of salt and chilli flakes.",
      "Plate with carrot sticks and cucumber, lemon over everything.",
    ],
    ingredients: [
      { foodName: "Grilled Chicken Breast", grams: 150 },
      { foodName: "Sweet Corn (boiled)", grams: 100 },
      { foodName: "Carrot (raw)", grams: 80 },
      { foodName: "Cucumber", grams: 100 },
    ],
  },
  {
    name: "Moong Dal Soup with Toast",
    description: "Light, peppery dal soup — a gentle dinner.",
    category: "dinner",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Thin the cooked moong dal with hot water to a soup consistency.",
      "Simmer with black pepper, cumin and a squeeze of lemon.",
      "Serve with crisp whole-wheat toast soldiers.",
    ],
    ingredients: [
      { foodName: "Moong Dal (cooked, plain)", grams: 600 },
      { foodName: "Bread (whole wheat)", grams: 50 },
    ],
  },
  {
    name: "Mixed Veg Sabzi with Roti",
    description: "Whatever's in the fridge, cooked dry-style with rotis.",
    category: "dinner",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the mixed vegetable sabzi.",
      "Puff the rotis directly on the flame or a dry tawa.",
      "Serve with a small bowl of curd or pickle if you like.",
    ],
    ingredients: [
      { foodName: "Mixed Vegetable Sabzi", grams: 300 },
      { foodName: "Roti / Chapati", grams: 120 },
    ],
  },
  {
    name: "Egg Curry with Rice",
    description: "Boiled eggs simmered in a tomato-onion curry, over rice.",
    category: "dinner",
    dietFlag: "eggetarian",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the egg curry until the gravy bubbles gently.",
      "Serve over steamed rice with fresh coriander.",
    ],
    ingredients: [
      { foodName: "Egg Curry", grams: 250 },
      { foodName: "Steamed Rice (cooked)", grams: 300 },
    ],
  },
  {
    name: "Tandoori Chicken Plate",
    description: "Smoky tandoori chicken with onion and cucumber salad.",
    category: "dinner",
    dietFlag: "non_veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Roast or grill the tandoori chicken until charred at the edges.",
      "Rest, then serve with raw onion rings and cucumber, lemon over the top.",
    ],
    ingredients: [
      { foodName: "Tandoori Chicken", grams: 200 },
      { foodName: "Onion (raw)", grams: 50 },
      { foodName: "Cucumber", grams: 100 },
    ],
  },
  {
    name: "Bhindi Masala, Dal & Roti",
    description: "A full home thali: bhindi, dal tadka and rotis.",
    category: "dinner",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 12,
    budget: true,
    steps: [
      "Warm the bhindi masala and dal tadka.",
      "Puff the rotis fresh.",
      "Serve as a thali with onion and lemon.",
    ],
    ingredients: [
      { foodName: "Bhindi Masala", grams: 200 },
      { foodName: "Dal Tadka (cooked)", grams: 200 },
      { foodName: "Roti / Chapati", grams: 90 },
    ],
  },

  // ------------------------------------------------------------- snacks
  {
    name: "Roasted Makhana Chaat",
    description: "Fox-nut chaat — crunchy, tangy, very snackable.",
    category: "snacks",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: true,
    steps: [
      "Toss the roasted makhana with chopped onion and tomato.",
      "Season with chaat masala, salt and lemon juice. Eat immediately, before it softens.",
    ],
    ingredients: [
      { foodName: "Roasted Makhana", grams: 50 },
      { foodName: "Onion (raw)", grams: 30 },
      { foodName: "Tomato (raw)", grams: 40 },
    ],
  },
  {
    name: "Greek Yogurt Fruit Bowl",
    description: "Thick yogurt with banana, apple, honey and walnuts.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: false,
    steps: [
      "Spoon the Greek yogurt into bowls.",
      "Top with chopped banana and apple.",
      "Drizzle the honey and scatter the walnuts.",
    ],
    ingredients: [
      { foodName: "Greek Yogurt (plain)", grams: 200 },
      { foodName: "Banana", grams: 80 },
      { foodName: "Apple", grams: 80 },
      { foodName: "Honey", grams: 10 },
      { foodName: "Walnuts", grams: 10 },
    ],
  },
  {
    name: "Peanut Chaat",
    description: "Roasted peanuts with raw onion, tomato and cucumber.",
    category: "snacks",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: true,
    steps: [
      "Mix the peanuts with finely chopped onion, tomato and cucumber.",
      "Add salt, chilli and lemon juice. Serve at once.",
    ],
    ingredients: [
      { foodName: "Peanuts (roasted)", grams: 60 },
      { foodName: "Onion (raw)", grams: 40 },
      { foodName: "Tomato (raw)", grams: 50 },
      { foodName: "Cucumber", grams: 50 },
    ],
  },
  {
    name: "Chaas & Roasted Chana",
    description: "Spiced buttermilk with a handful of roasted chana.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: true,
    steps: [
      "Whisk the chaas with roasted cumin powder and black salt.",
      "Serve cold with the roasted chana on the side.",
    ],
    ingredients: [
      { foodName: "Chaas (buttermilk)", grams: 400 },
      { foodName: "Roasted Chana", grams: 40 },
    ],
  },
  {
    name: "Dahi Paneer Chaat",
    description: "Chilled paneer cubes folded through spiced curd.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: null,
    budget: false,
    steps: [
      "Whisk the curd with salt, roasted cumin and a pinch of sugar.",
      "Fold in paneer cubes and chill 10 minutes.",
      "Top with chilli flakes or chaat masala and serve cold.",
    ],
    ingredients: [
      { foodName: "Paneer", grams: 200 },
      { foodName: "Curd (dahi)", grams: 50 },
    ],
  },
  {
    name: "Sweet Corn Chaat",
    description: "Buttered sweet corn with onion, tomato and chaat masala.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 5,
    budget: true,
    steps: [
      "Warm the sweet corn with the butter until glossy.",
      "Toss with onion, tomato, chaat masala and lemon juice.",
    ],
    ingredients: [
      { foodName: "Sweet Corn (boiled)", grams: 200 },
      { foodName: "Onion (raw)", grams: 30 },
      { foodName: "Tomato (raw)", grams: 40 },
      { foodName: "Butter", grams: 5 },
    ],
  },
];
