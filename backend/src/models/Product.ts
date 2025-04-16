import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Product document
export interface IProduct extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  tags: string[];
  price: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack';
  unitQuantity: number;
  imageUrl?: string;
  // Optional stock management fields
  // inStock: boolean;
  // stockCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const productSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    tags: {
      type: [String], // Array of strings
      index: true, // Index tags for faster searching/mapping
      // Convert tags to lowercase before saving (optional but good for consistency)
      set: (tags: string[]) => tags.map(tag => tag.toLowerCase().trim()),
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: {
        values: ['g', 'kg', 'ml', 'l', 'piece', 'pack'],
        message: '{VALUE} is not a supported unit',
      },
    },
    unitQuantity: {
      type: Number,
      required: [true, 'Unit quantity is required (e.g., 200 for grams, 1 for piece/pack)'],
      min: [0.1, 'Unit quantity must be positive'], // Allow fractional for kg/l if needed, adjust min as necessary
      default: 1,
    },
    imageUrl: {
      type: String,
      // Basic URL validation (optional)
      // match: [/^(http|https):\/\/[^ "]+$/, 'Invalid URL format']
    },
    // Optional stock management
    // inStock: { type: Boolean, default: true },
    // stockCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create a text index for searching across multiple fields
// This helps with the manual search functionality later
productSchema.index({
    name: 'text',
    description: 'text',
    category: 'text',
    brand: 'text',
    tags: 'text'
}, {
    weights: { // Optional: Give more weight to certain fields in search results
        name: 10,
        tags: 5,
        brand: 3,
        category: 2,
        description: 1
    },
    name: "ProductTextIndex" // Name the index
});

// Create and export the Product model
const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;