import mongoose, { Schema, Document } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
}

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
      type: [String],
      index: true,
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
      min: [0.1, 'Unit quantity must be positive'],
      default: 1,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({
    name: 'text',
    description: 'text',
    category: 'text',
    brand: 'text',
    tags: 'text'
}, {
    weights: {
        name: 10,
        tags: 5,
        brand: 3,
        category: 2,
        description: 1
    },
    name: "ProductTextIndex"
});

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;