// backend/src/types/express/index.d.ts
import { IUser } from '../../models/User'; // Adjust path to your User model

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      // Add the 'user' property. You can make it optional 'user?:' if not all requests will have it.
      // Define the shape of the user object you want to attach.
      // Using 'any' is simpler but less type-safe. Defining a specific shape is better.
      user?: {
        id: string;
        // You could potentially add other non-sensitive user fields here if needed
        // email?: string;
        // name?: string;
      };
    }
  }
}

// Adding this empty export statement makes this file a module
// and allows augmenting the global namespace.
export {};