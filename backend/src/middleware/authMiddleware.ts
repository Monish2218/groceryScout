import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

interface JwtPayload {
    user: {
        id: string;
    };
    iat?: number;
    exp?: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'Not authorized, no token provided' });
                return;
            }

            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            req.user = { id: decoded.user.id };
            next();
        } catch (error: unknown) {
            console.error('Token verification failed:', error);
            if (error instanceof jwt.JsonWebTokenError) {
                 res.status(401).json({ message: 'Not authorized, token failed verification' });
            } else if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message: 'Not authorized, token expired' });
            }
            else {
                res.status(401).json({ message: 'Not authorized, invalid token' });
            }
            return;
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};