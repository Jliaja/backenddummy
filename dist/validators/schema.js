"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2, "First name must be at least 2 characters"),
        lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
        address: zod_1.z.string().optional()
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(1, "Password is required")
    })
});
exports.productSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Product name must be at least 2 characters"),
        description: zod_1.z.string().optional(),
        price: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().positive("Price must be positive")),
        stock: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().min(0, "Stock cannot be negative")),
        categoryId: zod_1.z.string().min(1, "Category ID is required"),
        imageUrl: zod_1.z.string().optional()
    })
});
