import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// Import User model if you want to attach the full user object (optional)
// import User, { IUser } from '../models/User';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

interface JwtPayload {
    user: {
        id: string;
    };
    // Add other properties if your payload includes them
    iat?: number; // Issued at
    exp?: number; // Expiration time
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // Check for token in Authorization header (Bearer <token>)
    if (req.headers.authorization?.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                res.status(401).json({ message: 'Not authorized, no token provided' });
                return;
            }

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            // --- Attach user to request object ---
            // Option 1: Attach only the user ID (simpler, usually sufficient)
            req.user = { id: decoded.user.id };

            // Option 2: Fetch user from DB and attach (more data, slight overhead)
            // Ensure user exists and potentially attach non-sensitive info.
            // const user = await User.findById(decoded.user.id).select('-password');
            // if (!user) {
            //   res.status(401).json({ message: 'Not authorized, user not found' });
            //   return;
            // }
            // // Attach user object (modify the interface in src/types/express/index.d.ts accordingly)
            // req.user = user; // Or specific fields: { id: user.id, name: user.name, email: user.email }

            next(); // Proceed to the next middleware/route handler

        } catch (error: unknown) {
            console.error('Token verification failed:', error);
             // Handle specific JWT errors
            if (error instanceof jwt.JsonWebTokenError) {
                 res.status(401).json({ message: 'Not authorized, token failed verification' });
            } else if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message: 'Not authorized, token expired' });
            }
            else {
                res.status(401).json({ message: 'Not authorized, invalid token' });
            }
            return; // Important to return after sending response
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Optional: Middleware to check for admin role (if you add roles later)
// export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (req.user && req.user.role === 'admin') { // Assuming you add 'role' to req.user
//      next();
//   } else {
//      res.status(403).json({ message: 'Not authorized as an admin' }); // 403 Forbidden
//   }
// };