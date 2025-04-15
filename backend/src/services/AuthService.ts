import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // Adjust path if needed
import dotenv from 'dotenv';

dotenv.config();

type UserResponse = {
  _id: string;
  name: string;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

/**
 * Generates a JWT token for a given user ID.
 * @param userId - The ID of the user.
 * @returns The generated JWT token.
 */
export const generateToken = (userId: string): string => {
  const payload = {
    user: {
      id: userId,
    },
  };

  // Sign the token
  // Consider adding an expiration time, e.g., { expiresIn: '1h' }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Example: Token expires in 7 days
};

/**
 * Registers a new user.
 * @param userData - Object containing name, email, password.
 * @returns The newly created user object (without password).
 * @throws Error if email already exists or validation fails.
 */
export const registerUser = async (userData: Pick<IUser, 'name' | 'email' | 'password'>): Promise<UserResponse> => {
  const { name, email, password } = userData;

  // 1. Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    throw new Error('User already exists with this email');
  }

  // 2. Create new user instance (password hashing happens via pre-save hook)
  user = new User({
    name,
    email,
    password, // Pass the plain password here
  });

  // 3. Save user to database
  await user.save();

  // 4. Return user data without the password
   const userResponse = {
     _id: user._id.toString(), // Convert ObjectId to string
     name: user.name,
     email: user.email,
   };

  return userResponse;
};

/**
 * Logs in a user.
 * @param credentials - Object containing email and password.
 * @returns The user object (without password).
 * @throws Error if credentials are invalid or user not found.
 */
export const loginUser = async (credentials: Pick<IUser, 'email' | 'password'>): Promise<UserResponse> => {
    const { email, password } = credentials;

    if (!password) {
         throw new Error('Password is required for login.');
    }

    // 1. Find user by email, explicitly selecting the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Invalid credentials'); // User not found
    }

    // 2. Compare provided password with stored hash
    //    Make sure user.password exists before calling comparePassword
    if (!user.password) {
         throw new Error('User record is missing password hash.'); // Should not happen if data is consistent
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials'); // Password doesn't match
    }

    // 3. Return user data without the password
    const userResponse = {
      _id: user._id.toString(), // Convert ObjectId to string
      name: user.name,
      email: user.email,
    };

    return userResponse;
};