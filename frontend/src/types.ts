export interface Recipe {
  id: number;
  title: string;
  description?: string;
  category?: string;
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  instructions?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Ingredient {
  id: number;
  recipeId: number;
  name: string;
  quantity?: number;
  unit?: string;
  aisle?: string;
}

export interface Nutrition {
  id: number;
  recipeId: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

export interface MealPlan {
  id: number;
  recipeId: number;
  date: string;
  mealType: string;
  servings: number;
}

export interface GroceryItem {
  id: number;
  name: string;
  quantity?: number;
  unit?: string;
  aisle?: string;
  checked: boolean;
  weekStart: string;
}

// API response types
export interface RecipeListItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  imageUrl?: string;
  createdAt: string;
}

export interface RecipeDetail {
  id: number;
  title: string;
  description?: string;
  category?: string;
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  instructions?: string;
  imageUrl?: string;
  ingredients: Omit<Ingredient, 'recipeId'>[];
  nutrition?: Omit<Nutrition, 'id' | 'recipeId'>;
}

export interface CreateRecipeDto {
  title: string;
  description?: string;
  category?: string;
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  instructions?: string;
  imageUrl?: string;
  ingredients: { name: string; quantity?: number; unit?: string; aisle?: string }[];
  nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number; sugar?: number };
}

export interface UpdateRecipeDto {
  title?: string;
  description?: string;
  category?: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  instructions?: string;
  imageUrl?: string;
  ingredients?: { name: string; quantity?: number; unit?: string; aisle?: string }[];
  nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number; sugar?: number };
}

export interface CreateMealPlanDto {
  recipeId: number;
  date: string;
  mealType: string;
  servings?: number;
}

export interface MealPlanWithRecipe extends MealPlan {
  recipe: { id: number; title: string; imageUrl?: string };
}

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}