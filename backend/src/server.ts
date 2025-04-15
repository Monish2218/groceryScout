import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/AuthRoutes';

// For env File
dotenv.config();

connectDB();

const app: Application = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// Basic Route for Testing
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to GroceryScout Backend!');
});

// Use API Routes
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth prefix


// TODO: Add other routes here (products, cart, etc.)

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});