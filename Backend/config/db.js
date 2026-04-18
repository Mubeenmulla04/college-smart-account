import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
