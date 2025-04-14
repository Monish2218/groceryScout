import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors

// For env File
dotenv.config();

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

// TODO: Add other routes here (e.g., app.use('/api/auth', authRoutes);)

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});