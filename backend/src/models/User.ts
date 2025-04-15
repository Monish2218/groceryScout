import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface representing a document in MongoDB.
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // Explicitly define _id type
  name: string;
  email: string;
  password?: string; // Make optional as it won't always be selected
  createdAt: Date;
  updatedAt: Date;
  // Method to compare passwords (added to the schema)
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema corresponding to the document interface.
const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      index: true, // Index for faster queries
      match: [/.+@.+\..+/, 'Please fill a valid email address'], // Basic email format validation
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Prevent password from being returned by default in queries
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to hash password before saving a new user
userSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next();
  } catch (err) {
    // Explicitly pass the error to the next middleware
     if (err instanceof Error) {
        return next(err);
    }
    return next(new Error('Error hashing password'));
  }
});

// Method to compare candidate password with the user's hashed password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
   // If password field was not selected, this method cannot run
    if (!this.password) {
        throw new Error('Password field not available for comparison.');
    }
  return bcrypt.compare(candidatePassword, this.password);
};


// Create and export the model
const User = mongoose.model<IUser>('User', userSchema);
export default User;