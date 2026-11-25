import { z } from "zod";

export const productInput = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  category: z.string().trim().min(2).max(80),
  cuisine: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(2000),
  price: z.number().int().positive().max(100000),
  pack: z.string().trim().min(1).max(60),
  weightGrams: z.number().int().positive().max(100000),
  vegetarian: z.boolean(),
  frozen: z.boolean(),
  badge: z.string().trim().max(80).nullable(),
  image: z.string().trim().url().max(500),
  ingredients: z.string().max(5000).nullable(),
  nutrition: z
    .object({
      caloriesKcal: z.number().nonnegative().max(10000),
      proteinGrams: z.number().nonnegative().max(1000),
      carbohydratesGrams: z.number().nonnegative().max(1000),
      fatGrams: z.number().nonnegative().max(1000),
    })
    .nullable(),
  isActive: z.boolean(),
});

export const promotionInput = z.object({
  title: z.string().trim().min(2).max(160),
  code: z.string().trim().max(40).nullable(),
  message: z.string().trim().min(3).max(2000),
  enabled: z.boolean(),
});
