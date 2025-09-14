const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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

async function connectDB() {
  if (dbConnected) return;
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    dbConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Mongoose Schemas - matching the actual database structure
const eventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  thumbnail: { type: String, required: true },
  description: { type: String, required: true },
  eventType: { type: String, required: true },
  price: { type: String, required: true },
  duration: { type: String, required: true },
  capacity: { type: String, required: true },
  expectedParticipants: { type: String, required: true },
  ageRestriction: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: String, required: true },
  speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  agenda: [{ type: String }],
  skillStations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SkillStation' }],
  howItWorks: { type: String, required: true }
}, { timestamps: true });

const eventCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  events: [{ type: Number }]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
const EventCategory = mongoose.model('EventCategory', eventCategorySchema);

// Simple test endpoint
app.get('/api/simple', (req, res) => {
  res.json({ message: 'Simple API is working!' });
});

// Test API
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    corsOrigin: process.env.CORS_ORIGIN || 'Not set'
  });
});

// Categories endpoint - fetch from eventcategories collection
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Categories API: Starting request');
    await connectDB();
    
    // Get categories from eventcategories collection
    const categories = await EventCategory.find({});
    console.log(`Found ${categories.length} categories in database`);
    
    // Format categories for frontend
    const formattedCategories = categories.map((category) => ({
      _id: category._id.toString(),
      title: category.title,
      events: category.events || []
    }));
    
    console.log('Returning categories from eventcategories collection...');
    res.json(formattedCategories);
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ error: 'Failed to fetch categories from database' });
  }
});

// Category events endpoint - fetch from database
app.get('/api/categories/:title/events', async (req, res) => {
  try {
    const { title } = req.params;
    console.log(`Category events API: Fetching events for category: ${title}`);
    
    await connectDB();
    
    // First, find the category in eventcategories collection
    const category = await EventCategory.findOne({ title: title });
    console.log(`Found category:`, category);
    
    let events = [];
    
    if (category && category.events && category.events.length > 0) {
      // Get events by their IDs from the category
      const eventIds = category.events;
      console.log(`Fetching events with IDs:`, eventIds);
      
      events = await Event.find({ 
        id: { $in: eventIds }
      })
      .populate('organizer', 'firstName lastName email')
      .populate('speakers', 'firstName lastName email')
      .sort({ date: 1 })
      .limit(25);
    } else {
      console.log(`No category found or no events in category: ${title}`);
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event.id || event._id.toString(),
      name: event.name,
      date: event.date || '',
      time: event.time || '',
      thumbnail: event.thumbnail || `https://picsum.photos/800/600?random=${event.id || event._id}`,
      address: event.address || '',
      eventType: event.eventType || '',
      organizer: event.organizer,
      speakers: event.speakers || []
    }));
    
    console.log(`Returning ${formattedEvents.length} events for category: ${title}`);
    res.json(formattedEvents);
  } catch (error) {
    console.error('Category events API error:', error);
    res.status(500).json({ error: 'Failed to fetch events from database' });
  }
});

// All events endpoint - fetch from database
app.get('/api/events', async (req, res) => {
  try {
    console.log('Events API: Fetching all events');
    
    await connectDB();
    
    const events = await Event.find({})
      .populate('organizer', 'firstName lastName email')
      .populate('speakers', 'firstName lastName email')
      .sort({ date: 1 })
      .limit(25);
    
    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event.id || event._id.toString(),
      name: event.name,
      date: event.date || '',
      time: event.time || '',
      thumbnail: event.thumbnail || `https://picsum.photos/800/600?random=${event.id || event._id}`,
      address: event.address || '',
      eventType: event.eventType || '',
      organizer: event.organizer,
      speakers: event.speakers || []
    }));
    
    console.log(`Returning ${formattedEvents.length} events from database`);
    res.json(formattedEvents);
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ error: 'Failed to fetch events from database' });
  }
});

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health API: Request received');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    dbConnected: dbConnected
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;