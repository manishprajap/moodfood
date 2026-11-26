import type { ProductFields } from "./types";

// Cuisine is intentionally fixed to Awadhi; category is selected from admin-managed categories.
export const blankProduct: ProductFields = {
  name: "",
  slug: "",
  category: "",
  cuisine: "Awadhi",
  description: "",
  price: 0,
  pack: "500 g",
  weightGrams: 500,
  vegetarian: true,
  frozen: false,
  badge: null,
  image: "",
  ingredients: null,
  isActive: true,
};

export const blankNutrition = {
  caloriesKcal: "",
  proteinGrams: "",
  carbohydratesGrams: "",
  fatGrams: "",
};

// Suggested badges. Any badge already used on a product in the database is added automatically.
export const suggestedBadges = ["Hot", "Bestseller", "New", "Popular", "Chef's special", "Spicy"];
export const CUSTOM_OPTION = "__custom__";
export const STATIC_CUISINE = "Awadhi";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PRODUCTS_PER_PAGE = 10;

export const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Set to true if transactions.amount is stored in paise (Razorpay/PhonePe default).
export const AMOUNT_IN_PAISE = false;
export const SUCCESS_STATUSES = ["captured", "success", "processed"];
export const TX_STATUSES = ["created", "authorized", "captured", "success", "failed", "processed", "pending", "refunded"];
export const TX_PROVIDERS = ["phonepe", "razorpay", "cod", "manual"];
export const TRANSACTIONS_PER_PAGE = 10;
export const ROWS_PER_PAGE = 10;
