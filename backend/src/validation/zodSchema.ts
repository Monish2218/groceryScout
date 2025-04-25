import mongoose from 'mongoose';
import {z} from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
    }),
});

export const loginSchema = z.object({
     body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'),
     }),
});

export const processRecipeSchema = z.object({
    body: z.object({
       recipeName: z.string({ required_error: 'Recipe name is required' }).min(3, 'Recipe name seems too short'),
       servings: z.number({ required_error: 'Servings are required', invalid_type_error: 'Servings must be a number' }).int().positive('Servings must be a positive number'),
    }),
});

export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

export const addItemsSchema = z.object({
    body: z.object({
        items: z.array(
            z.object({
                productId: objectIdSchema,
                quantity: z.number({ required_error: 'Item quantity is required'}).int().positive('Item quantity must be positive'),
            })
        ).min(1, 'Must provide at least one item to add'),
    }),
});

export const updateItemSchema = z.object({
    params: z.object({
        productId: objectIdSchema,
    }),
    body: z.object({
        quantity: z.number({ required_error: 'Quantity is required'}).int().positive('Quantity must be positive'),
    }),
});

export const removeItemSchema = z.object({
    params: z.object({
        productId: objectIdSchema,
    }),
});