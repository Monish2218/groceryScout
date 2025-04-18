import { Request, Response } from 'express';
import * as AuthService from '../services/AuthService';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Please provide name, email, and password' });
    return;
  }

  try {
    const newUser = await AuthService.registerUser({ name, email, password });
    const token = AuthService.generateToken(newUser._id.toString());
    res.status(201).json({ token, user: newUser });
  } catch (error: unknown) {
     console.error('Registration Error:', error);
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
     if (errorMessage === 'User already exists with this email') {
         res.status(400).json({ message: errorMessage });
     } else {
         res.status(500).json({ message: 'Server error during registration', error: errorMessage });
     }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Please provide email and password' });
    return;
  }

  try {
    const user = await AuthService.loginUser({ email, password });
    const token = AuthService.generateToken(user._id.toString());
    res.status(200).json({ token, user });
  } catch (error: unknown) {
     console.error('Login Error:', error);
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
     if (errorMessage === 'Invalid credentials' || errorMessage.includes('User record is missing password hash')) {
         res.status(401).json({ message: 'Invalid credentials' });
     } else {
        res.status(500).json({ message: 'Server error during login', error: errorMessage });
     }
  }
};