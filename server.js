const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://expense-tracker-6ffd79yom-sumanth-ms-projects-bb61e3d2.vercel.app',
    'https://expense-tracker-sumanth-ms-projects-bb61e3d2.vercel.app',
    'https://mernexpensetrack.netlify.app',
    /https:\/\/.*\.netlify\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Tracker API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB successfully!');
    } else {
      console.log('⚠️  No MongoDB URI provided, running without database');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Server will continue running without database');
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
});