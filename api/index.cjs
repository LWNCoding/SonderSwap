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

// Category mapping for frontend compatibility
const categoryMapping = {
  'Technology': 'Technology & Innovation',
  'Design': 'Design & Creativity',
  'Business': 'Business & Entrepreneurship'
};

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
    const formattedCategories = categories.map((category, index) => ({
      _id: category._id.toString(),
      title: category.title,
      events: category.events || []
    }));
    
    console.log('Returning categories from eventcategories collection...');
    res.json(formattedCategories);
  } catch (error) {
    console.error('Categories API error:', error);
    // Fallback to mock data if database fails
    console.log('Falling back to mock categories...');
    const mockCategories = [
      { _id: '1', title: 'Technology', events: [1, 2, 3] },
      { _id: '2', title: 'Design', events: [4, 5] },
      { _id: '3', title: 'Business', events: [6, 7, 8, 9] }
    ];
    res.json(mockCategories);
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
      // If no category found or no events in category, try to find by eventType
      console.log(`No category found or no events in category, trying eventType: ${title}`);
      events = await Event.find({ 
        eventType: title
      })
      .populate('organizer', 'firstName lastName email')
      .populate('speakers', 'firstName lastName email')
      .sort({ date: 1 })
      .limit(25);
      
      // If still no events, return all events
      if (events.length === 0) {
        console.log(`No events found for eventType: ${title}, returning all events`);
        events = await Event.find({})
          .populate('organizer', 'firstName lastName email')
          .populate('speakers', 'firstName lastName email')
          .sort({ date: 1 })
          .limit(25);
      }
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
    // Fallback to mock data if database fails
    console.log('Falling back to mock events...');
    const mockEvents = {
      'Technology': [
        { id: '1', name: 'React Workshop', date: '2024-01-15', time: '10:00 AM', thumbnail: 'https://picsum.photos/800/600?random=1', address: 'San Francisco, CA' },
        { id: '2', name: 'Node.js Masterclass', date: '2024-01-20', time: '2:00 PM', thumbnail: 'https://picsum.photos/800/600?random=2', address: 'New York, NY' },
        { id: '3', name: 'Python for Beginners', date: '2024-01-25', time: '9:00 AM', thumbnail: 'https://picsum.photos/800/600?random=3', address: 'Los Angeles, CA' }
      ],
      'Design': [
        { id: '4', name: 'UI/UX Design Principles', date: '2024-01-18', time: '11:00 AM', thumbnail: 'https://picsum.photos/800/600?random=4', address: 'Chicago, IL' },
        { id: '5', name: 'Figma Workshop', date: '2024-01-22', time: '3:00 PM', thumbnail: 'https://picsum.photos/800/600?random=5', address: 'Boston, MA' }
      ],
      'Business': [
        { id: '6', name: 'Startup Pitch Workshop', date: '2024-01-16', time: '1:00 PM', thumbnail: 'https://picsum.photos/800/600?random=6', address: 'Seattle, WA' },
        { id: '7', name: 'Marketing Strategies', date: '2024-01-21', time: '10:30 AM', thumbnail: 'https://picsum.photos/800/600?random=7', address: 'Austin, TX' },
        { id: '8', name: 'Financial Planning', date: '2024-01-26', time: '2:30 PM', thumbnail: 'https://picsum.photos/800/600?random=8', address: 'Denver, CO' },
        { id: '9', name: 'Leadership Skills', date: '2024-01-28', time: '4:00 PM', thumbnail: 'https://picsum.photos/800/600?random=9', address: 'Portland, OR' }
      ]
    };
    
    const events = mockEvents[title] || [];
    res.json(events);
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
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    dbConnected: dbConnected
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;