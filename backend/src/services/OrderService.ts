// backend/src/services/OrderService.ts
import Order, { IOrder, IOrderItem } from '../models/Order'; // Adjust path
import { ICart } from '../models/Cart'; // Need Cart model
import { clearCart, getCart } from './CartService'; // Need Cart service functions
import mongoose from 'mongoose';

/**
 * Creates a new order for a user based on their current cart.
 * Clears the cart after successful order creation.
 * @param userId - The ID of the user placing the order.
 * @returns The newly created order document.
 * @throws Error if cart is empty or other issues occur.
 */
export const createOrder = async (userId: string): Promise<IOrder> => {
    // 1. Get the user's cart
    const cart: ICart = await getCart(userId); // Uses the existing getCart which finds or creates (but findOne might be better here)
    // const cart = await Cart.findOne({ userId }); // Alternative: Find only existing cart

    if (!cart || cart.items.length === 0) {
        throw new Error("Cannot create order: Cart is empty.");
    }

    // 2. Prepare order items (snapshotting data)
    const orderItems: IOrderItem[] = cart.items.map(cartItem => ({
        productId: cartItem.productId, // Assumes productId is ObjectId here
        name: cartItem.name,
        imageUrl: cartItem.imageUrl,
        quantity: cartItem.quantity,
        pricePerUnit: cartItem.pricePerUnit,
        unit: cartItem.unit,
        unitQuantity: cartItem.unitQuantity,
    }));

    // 3. Create the new order document
    const newOrder = new Order({
        userId: userId,
        items: orderItems,
        totalAmount: cart.totalPrice, // Take the total calculated by the cart service
        status: 'Confirmed', // Or 'Pending' if payment step is needed
        orderDate: new Date(),
    });

    // 4. Save the order to the database
    const savedOrder = await newOrder.save();

    // 5. Clear the user's cart *after* successfully saving the order
    try {
        await clearCart(userId);
        console.log(`Cart cleared for user ${userId} after order ${savedOrder._id} creation.`);
    } catch (clearCartError) {
        // Important: Handle case where order was saved but cart clear failed
        console.error(`CRITICAL: Order ${savedOrder._id} created, but failed to clear cart for user ${userId}:`, clearCartError);
        // Optionally: Implement retry logic or flag for manual cleanup
    }

    // 6. Return the saved order
    return savedOrder;
};

/**
 * Retrieves all orders for a specific user.
 * @param userId - The ID of the user whose orders to retrieve.
 * @returns An array of order documents, sorted by most recent first.
 */
export const getOrdersByUser = async (userId: string): Promise<IOrder[]> => {
    const orders = await Order.find({ userId })
        .sort({ orderDate: -1 }); // Sort by newest first
        // Optional: .populate('items.productId', 'name slug'); // If you need some original product info
    return orders;
};


/**
 * Retrieves a single order by ID, ensuring it belongs to the specified user.
 * @param userId - The ID of the user making the request.
 * @param orderId - The ID of the order to retrieve.
 * @returns The order document or null if not found or not owned by the user.
 */
export const getOrderById = async (userId: string, orderId: string): Promise<IOrder | null> => {
     if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error("Invalid Order ID format.");
     }

     const order = await Order.findOne({ _id: orderId, userId: userId });
     // Optional: .populate('items.productId', 'name slug');

     return order;
};