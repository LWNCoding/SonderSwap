const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Simple test endpoint
app.get('/api/simple', (req, res) => {
  res.json({ message: 'Simple API is working!' });
});

// Test endpoint with environment info
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Test API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    corsOrigin: process.env.CORS_ORIGIN || 'Not set'
  });
});

// Categories endpoint with mock data
app.get('/api/categories', (req, res) => {
  console.log('Categories API: Starting request');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
  
  const mockCategories = [
    { _id: '1', title: 'Technology', events: [1, 2, 3] },
    { _id: '2', title: 'Design', events: [4, 5] },
    { _id: '3', title: 'Business', events: [6, 7, 8, 9] }
  ];
  
  console.log('Returning mock categories...');
  res.json(mockCategories);
});

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health API: Request received');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
