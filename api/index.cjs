const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('../lib/db.js');

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

// Database connection
let dbConnected = false;

async function ensureDBConnection() {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
}

// Define schemas
const eventSchema = new mongoose.Schema({
  id: String,
  name: String,
  address: String,
  date: String,
  time: String,
  thumbnail: String,
  description: String,
  eventType: String,
  price: String,
  duration: String,
  capacity: String,
  expectedParticipants: String,
  ageRestriction: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  venue: String,
  speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skillStations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SkillStation' }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'EventCategory' }
});

const eventCategorySchema = new mongoose.Schema({
  title: String,
  events: [String]
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
const EventCategory = mongoose.models.EventCategory || mongoose.model('EventCategory', eventCategorySchema);

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

// Categories endpoint with real data
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Categories API: Starting request');
    await ensureDBConnection();
    
    // Return the categories that the frontend expects
    const frontendCategories = [
      { _id: '1', title: 'Technology', events: [] },
      { _id: '2', title: 'Design', events: [] },
      { _id: '3', title: 'Business', events: [] },
      { _id: '4', title: 'Arts', events: [] },
      { _id: '5', title: 'Education', events: [] },
      { _id: '6', title: 'Health', events: [] },
      { _id: '7', title: 'Sports', events: [] },
      { _id: '8', title: 'Food', events: [] }
    ];
    
    console.log(`Returning ${frontendCategories.length} frontend categories`);
    res.json(frontendCategories);
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Category events endpoint with real data
app.get('/api/categories/:title/events', async (req, res) => {
  try {
    const { title } = req.params;
    console.log(`Category events API: Fetching events for category: ${title}`);
    
    await ensureDBConnection();
    
    // Map frontend category names to database category names
    const categoryMapping = {
      'Technology': 'Technology & Innovation',
      'Design': 'Arts & Culture', 
      'Business': 'Technology & Innovation',
      'Arts': 'Arts & Culture',
      'Education': 'Technology & Innovation',
      'Health': 'Wellness & Nature',
      'Sports': 'Adventure & Sports',
      'Food': 'Food & Drink'
    };
    
    const dbCategoryName = categoryMapping[title] || title;
    
    // First try to find by exact title
    let category = await EventCategory.findOne({ title: dbCategoryName });
    
    // If not found, try to find by partial match
    if (!category) {
      category = await EventCategory.findOne({ 
        title: { $regex: title, $options: 'i' } 
      });
    }
    
    // If still not found, return all events (fallback)
    if (!category) {
      console.log(`Category ${title} not found, returning all events`);
      const allEvents = await Event.find({})
        .populate('organizer', 'firstName lastName email')
        .populate('speakers', 'firstName lastName email');
      return res.json(allEvents);
    }
    
    const eventIds = category.events.map(id => id.toString());
    const events = await Event.find({ id: { $in: eventIds } })
      .populate('organizer', 'firstName lastName email')
      .populate('speakers', 'firstName lastName email');
    
    console.log(`Found ${events.length} events for category: ${title} (${dbCategoryName})`);
    res.json(events);
  } catch (error) {
    console.error('Category events API error:', error);
    res.status(500).json({ error: 'Failed to fetch category events' });
  }
});

// All events endpoint
app.get('/api/events', async (req, res) => {
  try {
    console.log('Events API: Fetching all events');
    await ensureDBConnection();
    
    const events = await Event.find({})
      .populate('organizer', 'firstName lastName email')
      .populate('speakers', 'firstName lastName email');
    
    console.log(`Found ${events.length} events in database`);
    res.json(events);
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
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
