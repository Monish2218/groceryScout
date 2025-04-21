// backend/src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

// Interface for embedded order items (snapshot of product details at time of order)
export interface IOrderItem {
    productId: mongoose.Schema.Types.ObjectId; // Reference original product (optional but good)
    name: string;       // Denormalized name at time of order
    imageUrl?: string;  // Denormalized image URL
    quantity: number;
    pricePerUnit: number; // Price paid per unit at time of order
    unit: string;       // Denormalized unit
    unitQuantity: number; // Denormalized unit quantity
}

// Interface for the Order document
export interface IOrder extends Document {
    userId: mongoose.Schema.Types.ObjectId; // Reference to the User
    items: IOrderItem[];
    totalAmount: number; // Final total amount for the order
    status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; // Order status
    orderDate: Date; // Automatically set by timestamps usually
    // Add shippingAddress, paymentDetails later if needed
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose Schema for embedded Order Items
const orderItemSchema: Schema<IOrderItem> = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    unitQuantity: { type: Number, required: true },
}, { _id: false });

// Mongoose Schema for the Order
const orderSchema: Schema<IOrder> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Confirmed', // Default status when order is created
            index: true,
        },
        orderDate: { // Explicitly set orderDate on creation if needed separate from createdAt
             type: Date,
             default: Date.now,
             index: true,
        },
        // Add other fields like shipping address, payment ID later
        // shippingAddress: { type: addressSchema } // Example
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Create and export the Order model
const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;