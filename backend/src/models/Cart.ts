import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    productId: mongoose.Schema.Types.ObjectId;
    name: string;
    imageUrl?: string;
    quantity: number; 
    pricePerUnit: number; 
    unit: string;     
    unitQuantity: number;
}

export interface ICart extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    items: ICartItem[];
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema: Schema<ICartItem> = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    imageUrl: { type: String },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    pricePerUnit: { type: Number, required: true },
    unit: { type: String, required: true },
    unitQuantity: { type: Number, required: true },
}, { _id: false });

const cartSchema: Schema<ICart> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: [cartItemSchema],
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;