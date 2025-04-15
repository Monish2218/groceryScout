import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('Error: MONGODB_URI is not defined in .env file');
      process.exit(1); // Exit process with failure
    }

    await mongoose.connect(mongoURI); // Removed deprecated options

    console.log('MongoDB Connected...');

    // Optional: Log MongoDB connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
      process.exit(1);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected.');
    });

  } catch (err: unknown) { // Type assertion for error handling
    if (err instanceof Error) {
        console.error(`MongoDB connection error: ${err.message}`);
    } else {
        console.error('An unknown error occurred during MongoDB connection');
    }
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;