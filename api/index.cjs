const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://sonder-swap.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE || 'sonderswap');
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB Connected successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'sonderswap-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  console.log('JWT_SECRET:', JWT_SECRET);
  console.log('Token received:', token ? 'Yes' : 'No');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { db } = await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isEmailVerified: false,
      profile: {
        bio: '',
        title: 'learner',
        interests: [],
        location: '',
        profileImage: '',
        socialMedia: {
          linkedin: '',
          twitter: '',
          github: ''
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);
    const userId = result.insertedId;

    // Generate JWT token
    const token = jwt.sign(
      { _id: userId, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: { ...userWithoutPassword, _id: userId },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { db } = await connectToDatabase();
    
    // Find user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
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
    dbConnected: !!cachedDb
  });
});

// Categories endpoint - fetch from eventcategories collection
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Categories API: Starting request');
    const { db } = await connectToDatabase();
    
    // Get categories from eventcategories collection
    const categories = await db.collection('eventcategories').find({}).toArray();
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
    res.status(500).json({ 
      error: 'Failed to fetch categories from database',
      details: error.message,
      type: error.name
    });
  }
});

// Category events endpoint - fetch from database
app.get('/api/categories/:title/events', async (req, res) => {
  try {
    const { title } = req.params;
    console.log(`Category events API: Fetching events for category: ${title}`);
    const { db } = await connectToDatabase();
    
    // First, find the category to get the event IDs
    const category = await db.collection('eventcategories').findOne({ title: title });
    console.log(`Found category:`, category);

    let events = [];
    if (category && category.events && category.events.length > 0) {
      const eventIds = category.events;
      console.log(`Fetching events with IDs:`, eventIds);
      
      // Convert numbers to strings for the query
      const eventIdStrings = eventIds.map(id => id.toString());
      
      // Find events with matching IDs
      events = await db.collection('events').find({
        id: { $in: eventIdStrings }
      }).toArray();
    } else {
      console.log(`No category found or no events in category: ${title}`);
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get organizer data for all events
    const eventIds = events.map(event => event.organizer).filter(Boolean);
    let organizersData = [];
    if (eventIds.length > 0) {
      try {
        organizersData = await db.collection('users').find({
          _id: { $in: eventIds }
        }).toArray();
      } catch (error) {
        console.log('Could not fetch organizers data:', error.message);
      }
    }
    
    // Create a map for quick organizer lookup
    const organizerMap = new Map();
    organizersData.forEach(organizer => {
      organizerMap.set(organizer._id.toString(), organizer);
    });
    
    // Format events for frontend
    const formattedEvents = events.map(event => {
      const organizerData = event.organizer ? organizerMap.get(event.organizer.toString()) : null;
      
      return {
        id: event.id || event._id.toString(),
        name: event.name,
        date: event.date || '',
        time: event.time || '',
        thumbnail: event.thumbnail || `https://picsum.photos/800/600?random=${event.id || event._id}`,
        address: event.address || '',
        eventType: event.eventType || '',
        organizer: organizerData ? {
          _id: organizerData._id,
          firstName: organizerData.firstName || 'Unknown',
          lastName: organizerData.lastName || 'User',
          email: organizerData.email || ''
        } : null,
        speakers: event.speakers || []
      };
    });
    
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
    const { db } = await connectToDatabase();
    
    const events = await db.collection('events').find({}).toArray();
    
    // Get organizer data for all events
    const eventIds = events.map(event => event.organizer).filter(Boolean);
    let organizersData = [];
    if (eventIds.length > 0) {
      try {
        organizersData = await db.collection('users').find({
          _id: { $in: eventIds }
        }).toArray();
      } catch (error) {
        console.log('Could not fetch organizers data:', error.message);
      }
    }
    
    // Create a map for quick organizer lookup
    const organizerMap = new Map();
    organizersData.forEach(organizer => {
      organizerMap.set(organizer._id.toString(), organizer);
    });
    
    // Format events for frontend
    const formattedEvents = events.map(event => {
      const organizerData = event.organizer ? organizerMap.get(event.organizer.toString()) : null;
      
      return {
        id: event.id || event._id.toString(),
        name: event.name,
        date: event.date || '',
        time: event.time || '',
        thumbnail: event.thumbnail || `https://picsum.photos/800/600?random=${event.id || event._id}`,
        address: event.address || '',
        eventType: event.eventType || '',
        organizer: organizerData ? {
          _id: organizerData._id,
          firstName: organizerData.firstName || 'Unknown',
          lastName: organizerData.lastName || 'User',
          email: organizerData.email || ''
        } : null,
        speakers: event.speakers || []
      };
    });
    
    console.log(`Returning ${formattedEvents.length} events from database`);
    res.json(formattedEvents);
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ error: 'Failed to fetch events from database' });
  }
});

// Single event endpoint - fetch by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Event detail API: Fetching event with ID: ${id}`);
    const { db } = await connectToDatabase();
    
    // Find event by ID (both string and number)
    const event = await db.collection('events').findOne({
      $or: [
        { id: id },
        { id: parseInt(id) },
        { _id: id }
      ]
    });
    
    if (!event) {
      console.log(`Event not found with ID: ${id}`);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get organizer details if organizer ID exists
    let organizerData = null;
    if (event.organizer) {
      try {
        organizerData = await db.collection('users').findOne({
          _id: event.organizer
        });
      } catch (error) {
        console.log('Could not fetch organizer data:', error.message);
      }
    }
    
    // Get speaker details if speakers exist
    let speakersData = [];
    if (event.speakers && event.speakers.length > 0) {
      try {
        speakersData = await db.collection('users').find({
          _id: { $in: event.speakers }
        }).toArray();
      } catch (error) {
        console.log('Could not fetch speakers data:', error.message);
      }
    }
    
    // Format event for frontend
    const formattedEvent = {
      id: event.id || event._id.toString(),
      name: event.name,
      date: event.date || '',
      time: event.time || '',
      thumbnail: event.thumbnail || `https://picsum.photos/800/600?random=${event.id || event._id}`,
      address: event.address || '',
      eventType: event.eventType || '',
      description: event.description || '',
      price: event.price || '',
      duration: event.duration || '',
      capacity: event.capacity || '',
      expectedParticipants: event.expectedParticipants || '',
      ageRestriction: event.ageRestriction || '',
      venue: event.venue || '',
      howItWorks: event.howItWorks || '',
      organizer: organizerData ? {
        _id: organizerData._id,
        firstName: organizerData.firstName || 'Unknown',
        lastName: organizerData.lastName || 'User',
        email: organizerData.email || ''
      } : null,
      speakers: speakersData.map(speaker => ({
        _id: speaker._id,
        firstName: speaker.firstName || 'Unknown',
        lastName: speaker.lastName || 'User',
        email: speaker.email || ''
      })),
      agenda: event.agenda || [],
      skillStations: event.skillStations || []
    };
    
    console.log(`Returning event: ${formattedEvent.name}`);
    res.json(formattedEvent);
  } catch (error) {
    console.error('Event detail API error:', error);
    res.status(500).json({ error: 'Failed to fetch event from database' });
  }
});

// Event participants endpoint
app.get('/api/events/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Event participants API: Fetching participants for event ID: ${id}`);
    const { db } = await connectToDatabase();
    
    // For now, return empty array since we don't have participants collection
    // This endpoint exists to prevent 404 errors
    const participants = [];
    
    console.log(`Returning ${participants.length} participants for event: ${id}`);
    res.json(participants);
  } catch (error) {
    console.error('Event participants API error:', error);
    res.status(500).json({ error: 'Failed to fetch participants from database' });
  }
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
