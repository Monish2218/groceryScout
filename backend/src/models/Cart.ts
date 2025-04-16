// backend/src/models/Cart.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product'; // Import Product interface if needed for reference type

// Interface for embedded cart items
export interface ICartItem {
    productId: mongoose.Schema.Types.ObjectId; // Reference to the original Product
    name: string;       // Denormalized product name
    imageUrl?: string;  // Denormalized image URL
    quantity: number;   // How many units of this product
    pricePerUnit: number; // Price per product.unitQuantity at time of adding
    unit: string;       // Denormalized unit (e.g., 'g', 'kg', 'piece')
    unitQuantity: number; // Denormalized unit quantity (e.g., 200 for 'g', 1 for 'piece')
}

// Interface for the Cart document
export interface ICart extends Document {
    userId: mongoose.Schema.Types.ObjectId; // Reference to the User
    items: ICartItem[];
    totalPrice: number; // Calculated total price of all items in the cart
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose Schema for embedded Cart Items
const cartItemSchema: Schema<ICartItem> = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference the Product model
        required: true,
    },
    name: { type: String, required: true },
    imageUrl: { type: String },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    pricePerUnit: { type: Number, required: true }, // Store price snapshot
    unit: { type: String, required: true },
    unitQuantity: { type: Number, required: true },
}, { _id: false }); // No separate _id needed for embedded documents

// Mongoose Schema for the Cart
const cartSchema: Schema<ICart> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference the User model
            required: true,
            unique: true, // Each user has only one cart
            index: true,
        },
        items: [cartItemSchema], // Array of embedded cart items
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Helper method to recalculate total price (optional, can also do in service)
// cartSchema.methods.calculateTotal = function(): number {
//     this.totalPrice = this.items.reduce((acc, item) => {
//         return acc + (item.quantity * item.pricePerUnit);
//     }, 0);
//     return this.totalPrice;
// };

// Create and export the Cart model
const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;