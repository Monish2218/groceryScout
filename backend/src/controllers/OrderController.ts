// backend/src/controllers/OrderController.ts
import { Request, Response } from 'express';
import * as OrderService from '../services/OrderService'; // Adjust path

// Create a new order from the user's cart
export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const order = await OrderService.createOrder(req.user.id);
        res.status(201).json(order);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Create Order Error:', error);
        if (errorMessage.includes("Cart is empty")) {
             res.status(400).json({ message: errorMessage });
        } else {
            res.status(500).json({ message: 'Server error creating order', error: errorMessage });
        }
    }
};

// Get all orders for the logged-in user
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const orders = await OrderService.getOrdersByUser(req.user.id);
        res.status(200).json(orders);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Get User Orders Error:', error);
        res.status(500).json({ message: 'Server error retrieving orders', error: errorMessage });
    }
};

// Get a specific order by ID for the logged-in user
export const getUserOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user?.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { orderId } = req.params;
        const order = await OrderService.getOrderById(req.user.id, orderId);

        if (!order) {
            // Either not found or doesn't belong to the user
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json(order);

    } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
         console.error('Get User Order By ID Error:', error);
         if (errorMessage.includes("Invalid Order ID format")) {
              res.status(400).json({ message: errorMessage });
         } else {
            res.status(500).json({ message: 'Server error retrieving order', error: errorMessage });
         }
    }
};