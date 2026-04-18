import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Configure __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Validate critical env variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Main Router
import apiRoutes from './Routes/index.js';

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Standard Middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbStatus: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'NOT CONNECTED'
  });
});

// Root Route & Static Files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../Frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'College Smart Account API (ESM MERN) is running!' });
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});