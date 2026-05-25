import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
});

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    description: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().positive("Price must be positive")),
    stock: z.preprocess((val) => Number(val), z.number().int().min(0, "Stock cannot be negative")),
    categoryId: z.string().min(1, "Category ID is required"),
    imageUrl: z.string().optional()
  })
});
