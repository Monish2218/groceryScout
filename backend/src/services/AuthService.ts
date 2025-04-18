import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Registers a new user.
 * @param userData - Object containing name, email, password.
 * @returns The newly created user object (without password).
 * @throws Error if email already exists or validation fails.
 */
export const registerUser = async (userData: Pick<IUser, 'name' | 'email' | 'password'>): Promise<UserResponse> => {
  const { name, email, password } = userData;

  let user = await User.findOne({ email });
  if (user) {
    throw new Error('User already exists with this email');
  }

  user = new User({
    name,
    email,
    password,
  });
  await user.save();

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

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.password) {
      throw new Error('User record is missing password hash.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    return userResponse;
};