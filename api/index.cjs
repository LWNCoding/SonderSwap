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

// Category events endpoint
app.get('/api/categories/:title/events', (req, res) => {
  const { title } = req.params;
  console.log(`Category events API: Fetching events for category: ${title}`);
  
  // Mock events data based on category
  const mockEvents = {
    'Technology': [
      { id: '1', name: 'React Workshop', date: '2024-01-15', time: '10:00 AM', thumbnail: 'https://picsum.photos/800/600?random=1' },
      { id: '2', name: 'Node.js Masterclass', date: '2024-01-20', time: '2:00 PM', thumbnail: 'https://picsum.photos/800/600?random=2' },
      { id: '3', name: 'Python for Beginners', date: '2024-01-25', time: '9:00 AM', thumbnail: 'https://picsum.photos/800/600?random=3' }
    ],
    'Design': [
      { id: '4', name: 'UI/UX Design Principles', date: '2024-01-18', time: '11:00 AM', thumbnail: 'https://picsum.photos/800/600?random=4' },
      { id: '5', name: 'Figma Workshop', date: '2024-01-22', time: '3:00 PM', thumbnail: 'https://picsum.photos/800/600?random=5' }
    ],
    'Business': [
      { id: '6', name: 'Startup Pitch Workshop', date: '2024-01-16', time: '1:00 PM', thumbnail: 'https://picsum.photos/800/600?random=6' },
      { id: '7', name: 'Marketing Strategies', date: '2024-01-21', time: '10:30 AM', thumbnail: 'https://picsum.photos/800/600?random=7' },
      { id: '8', name: 'Financial Planning', date: '2024-01-26', time: '2:30 PM', thumbnail: 'https://picsum.photos/800/600?random=8' },
      { id: '9', name: 'Leadership Skills', date: '2024-01-28', time: '4:00 PM', thumbnail: 'https://picsum.photos/800/600?random=9' }
    ]
  };
  
  const events = mockEvents[title] || [];
  console.log(`Returning ${events.length} events for category: ${title}`);
  res.json(events);
});

// All events endpoint (mock data)
app.get('/api/events', (req, res) => {
  console.log('Events API: Fetching all events');
  
  const mockEvents = [
    { id: '1', name: 'React Workshop', date: '2024-01-15', time: '10:00 AM', thumbnail: 'https://picsum.photos/800/600?random=1', eventType: 'Technology' },
    { id: '2', name: 'Node.js Masterclass', date: '2024-01-20', time: '2:00 PM', thumbnail: 'https://picsum.photos/800/600?random=2', eventType: 'Technology' },
    { id: '3', name: 'Python for Beginners', date: '2024-01-25', time: '9:00 AM', thumbnail: 'https://picsum.photos/800/600?random=3', eventType: 'Technology' },
    { id: '4', name: 'UI/UX Design Principles', date: '2024-01-18', time: '11:00 AM', thumbnail: 'https://picsum.photos/800/600?random=4', eventType: 'Design' },
    { id: '5', name: 'Figma Workshop', date: '2024-01-22', time: '3:00 PM', thumbnail: 'https://picsum.photos/800/600?random=5', eventType: 'Design' },
    { id: '6', name: 'Startup Pitch Workshop', date: '2024-01-16', time: '1:00 PM', thumbnail: 'https://picsum.photos/800/600?random=6', eventType: 'Business' },
    { id: '7', name: 'Marketing Strategies', date: '2024-01-21', time: '10:30 AM', thumbnail: 'https://picsum.photos/800/600?random=7', eventType: 'Business' },
    { id: '8', name: 'Financial Planning', date: '2024-01-26', time: '2:30 PM', thumbnail: 'https://picsum.photos/800/600?random=8', eventType: 'Business' },
    { id: '9', name: 'Leadership Skills', date: '2024-01-28', time: '4:00 PM', thumbnail: 'https://picsum.photos/800/600?random=9', eventType: 'Business' }
  ];
  
  console.log(`Returning ${mockEvents.length} mock events`);
  res.json(mockEvents);
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
