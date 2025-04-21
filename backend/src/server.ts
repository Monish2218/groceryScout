import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/AuthRoutes';
import productRoutes from './routes/ProductRoutes';
import seedDatabase from './utils/seedDatabase';
import recipeRoutes from './routes/RecipeRoutes';
import cartRoutes from './routes/CartRoutes';
import orderRoutes from './routes/OrderRoutes';

dotenv.config();

connectDB();
seedDatabase(); // (FOR DEV ONLY)

const app: Application = express();
const port = process.env.PORT ?? 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to GroceryScout Backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});