import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('Error: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected...');

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
      process.exit(1);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected.');
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
        console.error(`MongoDB connection error: ${err.message}`);
    } else {
        console.error('An unknown error occurred during MongoDB connection');
    }
    process.exit(1);
  }
};

export default connectDB;