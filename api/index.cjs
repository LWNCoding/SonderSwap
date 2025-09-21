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
const JWT_SECRET = process.env.JWT_SECRET || 'sonderswap-jwt-secret-2024-very-secure-key-abc123def456';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Simple middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Backend Debug - JWT token decoded:', decoded);
    console.log('Backend Debug - User ID from token:', decoded._id);
    console.log('Backend Debug - User ID type:', typeof decoded._id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
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
    console.log('Login: Using JWT_SECRET length:', JWT_SECRET.length);
    console.log('Login: JWT_SECRET prefix:', JWT_SECRET.substring(0, 10));
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

app.get('/api/auth/me', async (req, res) => {
  try {
    console.log('Auth me endpoint called');
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('About to verify token in auth/me');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully in auth/me:', decoded);
    
    // Get actual user data from database
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded._id) 
    });
    
    if (!user) {
      console.log('User not found in database for ID:', decoded._id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Found user in database:', user);
    
    // Return actual user data from database
    res.json({ 
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified || false,
        profile: user.profile || {
          bio: '',
          title: 'learner',
          interests: [],
          location: '',
          socialMedia: {},
          profileImage: ''
        }
      }
    });
  } catch (error) {
    console.error('Auth me error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user by ID endpoint
app.get('/api/users/:id', async (req, res) => {
  try {
    console.log('Get user by ID endpoint called for:', req.params.id);
    const { db } = await connectToDatabase();
    
    // Convert string ID to ObjectId
    const ObjectId = require('mongodb').ObjectId;
    const userId = new ObjectId(req.params.id);
    
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get participation status for an event (requires authentication)
app.get('/api/events/:eventId/participation-status', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log('Participation status - req.user:', req.user);
    const userId = req.user._id; // Get user ID from JWT token
    console.log('Participation status - userId:', userId);
    
    if (!userId) {
      console.log('No userId found in token');
      return res.status(401).json({ error: 'User ID required' });
    }

    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // First, find the event to get its actual _id
    const event = await db.collection('events').findOne({
      $or: [
        { id: eventId },
        { id: parseInt(eventId) },
        { _id: eventId }
      ]
    });
    
    if (!event) {
      console.log(`Event not found with ID: ${eventId}`);
      return res.json({ 
        isParticipating: false,
        status: 'not_registered',
        participantCount: 0,
        capacity: 0
      });
    }
    
    const participation = await db.collection('participants').findOne({
      eventId: event._id,
      userId: new ObjectId(userId)
    });

    // Get actual participant count
    const participantCount = await db.collection('participants').countDocuments({
      eventId: event._id
    });
    
    res.json({ 
      isParticipating: !!participation,
      status: participation?.status || 'not_registered',
      participantCount: participantCount,
      capacity: event.capacity || 0
    });
  } catch (error) {
    console.error('Get participation status error:', error);
    res.status(500).json({ error: 'Failed to get participation status' });
  }
});

// Join an event (requires authentication)
app.post('/api/events/:eventId/join', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id; // Get user ID from JWT token
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // First, find the event to get its actual _id
    const event = await db.collection('events').findOne({
      $or: [
        { id: eventId },
        { id: parseInt(eventId) },
        { _id: eventId }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if already participating
    const existingParticipation = await db.collection('participants').findOne({
      eventId: event._id,
      userId: new ObjectId(userId)
    });

    if (existingParticipation) {
      return res.status(409).json({ error: 'Already participating in this event' });
    }

    // Add participation
    const participation = {
      eventId: event._id,
      userId: new ObjectId(userId),
      status: 'registered',
      joinedAt: new Date()
    };

    await db.collection('participants').insertOne(participation);

    // Get updated participant count
    const participantCount = await db.collection('participants').countDocuments({
      eventId: event._id
    });

    res.json({ 
      message: 'Successfully joined event',
      participation: participation,
      participantCount: participantCount
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// Leave an event (requires authentication)
app.delete('/api/events/:eventId/leave', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id; // Get user ID from JWT token
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // First, find the event to get its actual _id
    const event = await db.collection('events').findOne({
      $or: [
        { id: eventId },
        { id: parseInt(eventId) },
        { _id: eventId }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is participating
    const existingParticipation = await db.collection('participants').findOne({
      eventId: event._id,
      userId: new ObjectId(userId)
    });

    if (!existingParticipation) {
      return res.status(404).json({ error: 'Not participating in this event' });
    }

    // Remove participation
    await db.collection('participants').deleteOne({
      eventId: event._id,
      userId: new ObjectId(userId)
    });

    // Get updated participant count
    const participantCount = await db.collection('participants').countDocuments({
      eventId: event._id
    });

    res.json({ 
      message: 'Successfully left event',
      participantCount: participantCount
    });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ error: 'Failed to leave event' });
  }
});

// Test auth endpoint without verification
app.get('/api/auth/test', (req, res) => {
  console.log('Auth test endpoint called');
  res.json({ message: 'Auth test endpoint working' });
});

// Test JWT secret endpoint
app.get('/api/auth/test-secret', (req, res) => {
  res.json({ 
    message: 'JWT secret test',
    secretLength: JWT_SECRET.length,
    secretPrefix: JWT_SECRET.substring(0, 10) + '...',
    hasEnvVar: !!process.env.JWT_SECRET
  });
});

// Test JWT token verification endpoint
app.get('/api/auth/test-token', verifyToken, (req, res) => {
  res.json({
    message: 'Token verification successful',
    user: req.user,
    userId: req.user._id,
    email: req.user.email
  });
});


// Test auth endpoint with manual verification
app.get('/api/auth/test-verify', (req, res) => {
  try {
    console.log('Manual verify endpoint called');
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('About to verify token manually');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    
    res.json({ message: 'Manual verification working', user: decoded });
  } catch (error) {
    console.error('Manual JWT verification error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
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

// Get user's participating events
app.get('/api/events/participating', verifyToken, async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);
    
    // Find events where user is a participant
    const events = await db.collection('events').find({
      participants: userId
    }).toArray();

    res.json({
      message: 'Participating events fetched successfully',
      events: events
    });
  } catch (error) {
    console.error('Get participating events API error:', error);
    res.status(500).json({ error: 'Failed to fetch participating events' });
  }
});

// Get user's organizing events
app.get('/api/events/organizing', verifyToken, async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);
    
    // Find events where user is the organizer
    const events = await db.collection('events').find({
      organizer: userId
    }).toArray();

    res.json({
      message: 'Organizing events fetched successfully',
      events: events
    });
  } catch (error) {
    console.error('Get organizing events API error:', error);
    res.status(500).json({ error: 'Failed to fetch organizing events' });
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
    
    // Get participant count for this event
    const participantCount = await db.collection('participants').countDocuments({
      eventId: event._id
    });
    
    // Get skill stations data if skillStations exist
    let skillStationsData = [];
    if (event.skillStations && event.skillStations.length > 0) {
      try {
        const ObjectId = require('mongodb').ObjectId;
        
        // Handle both ObjectId instances and string IDs
        const skillStationIds = event.skillStations.map(id => {
          if (typeof id === 'string') {
            return new ObjectId(id);
          }
          return id; // Already an ObjectId
        });
        
        skillStationsData = await db.collection('skillstations').find({
          _id: { $in: skillStationIds }
        }).toArray();
        
        // Populate leader data for each skill station
        for (let station of skillStationsData) {
          if (station.leader) {
            // Handle both ObjectId instances and string IDs for leader
            const leaderId = typeof station.leader === 'string' 
              ? new ObjectId(station.leader) 
              : station.leader;
            
            const leader = await db.collection('users').findOne({
              _id: leaderId
            });
            if (leader) {
              station.leader = {
                _id: leader._id,
                firstName: leader.firstName,
                lastName: leader.lastName,
                email: leader.email
              };
            }
          }
        }
      } catch (error) {
        console.log('Could not fetch skill stations data:', error.message);
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
      capacity: event.capacity || '',
      ageRestriction: event.ageRestriction || '',
      venue: event.venue || '',
      howItWorks: event.howItWorks || '',
      participantCount: participantCount,
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
      skillStations: skillStationsData
    };
    
    console.log(`Returning event: ${formattedEvent.name}`);
    res.json(formattedEvent);
  } catch (error) {
    console.error('Event detail API error:', error);
    res.status(500).json({ error: 'Failed to fetch event from database' });
  }
});

// Event participants endpoint (public - no auth required)
app.get('/api/events/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Event participants API: Fetching participants for event ID: ${id}`);
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // First, find the event to get its actual _id
    const event = await db.collection('events').findOne({
      $or: [
        { id: id },
        { id: parseInt(id) },
        { _id: id }
      ]
    });
    
    if (!event) {
      console.log(`Event not found with ID: ${id}`);
      return res.json({ participants: [], count: 0 });
    }
    
    // Get participants for this event using the event's _id
    const participants = await db.collection('participants').find({
      eventId: event._id
    }).toArray();
    
    // Get user details for each participant
    const participantDetails = [];
    for (const participant of participants) {
      try {
        const user = await db.collection('users').findOne({
          _id: participant.userId
        });
        if (user) {
          participantDetails.push({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            joinedAt: participant.joinedAt
          });
        }
      } catch (error) {
        console.warn('Could not fetch user details for participant:', participant.userId);
      }
    }
    
    // Get actual participant count from database (not just the length of details array)
    const actualParticipantCount = await db.collection('participants').countDocuments({
      eventId: event._id
    });
    
    console.log(`Returning ${participantDetails.length} participant details and ${actualParticipantCount} total participants for event: ${id}`);
    res.json({
      participants: participantDetails,
      count: actualParticipantCount
    });
  } catch (error) {
    console.error('Event participants API error:', error);
    res.status(500).json({ error: 'Failed to fetch participants from database' });
  }
});

// Remove participant from event endpoint (requires auth)
app.delete('/api/events/:eventId/participants/:userId', verifyToken, async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    console.log(`Remove participant API: Removing user ${userId} from event ${eventId}`);
    
    // Find the event - try ObjectId first, then fall back to string id
    let event;
    try {
      // Try to find by ObjectId if eventId looks like one
      if (ObjectId.isValid(eventId)) {
        event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
      }
      // If not found or not a valid ObjectId, try by string id
      if (!event) {
        event = await db.collection('events').findOne({ id: eventId });
      }
    } catch (error) {
      console.log('Error finding event by ObjectId, trying by string id:', error.message);
      event = await db.collection('events').findOne({ id: eventId });
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is the organizer (only organizers can remove participants)
    const organizerId = typeof event.organizer === 'string' 
      ? event.organizer 
      : event.organizer.toString();
    
    console.log('Backend Debug - Remove participant authorization check:');
    console.log('Backend Debug - Current user ID:', req.user._id);
    console.log('Backend Debug - Event organizer ID:', organizerId);
    console.log('Backend Debug - IDs match:', req.user._id === organizerId);
    
    if (req.user._id !== organizerId) {
      console.log('Backend Debug - Authorization failed: User is not organizer');
      return res.status(403).json({ error: 'Only the event organizer can remove participants' });
    }
    
    console.log('Backend Debug - Authorization passed: User is organizer');
    
    // Check if participant exists - validate userId ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const participant = await db.collection('participants').findOne({
      eventId: event._id,
      userId: new ObjectId(userId)
    });
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    // Remove participant
    await db.collection('participants').deleteOne({
      eventId: event._id,
      userId: new ObjectId(userId)
    });
    
    // Get updated participant count
    const participantCount = await db.collection('participants').countDocuments({
      eventId: event._id
    });
    
    console.log(`Successfully removed participant ${userId} from event ${eventId}. New count: ${participantCount}`);
    
    res.json({ 
      success: true, 
      message: 'Participant removed successfully',
      participantCount 
    });
  } catch (error) {
    console.error('Remove participant API error:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

// Get user profile (requires authentication)
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Profile API: Fetching profile for user ID:', userId);
    
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Profile found for user:', user.email);
    res.json({ user });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Failed to fetch profile from database' });
  }
});

// Update user profile (requires authentication)
app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;
    console.log('Profile update API: Updating profile for user ID:', userId);
    console.log('Update data:', updateData);
    
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // Validate required fields
    if (!updateData.firstName || !updateData.lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    // Prepare update object
    const updateFields = {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      profile: {
        bio: updateData.profile?.bio || '',
        description: updateData.profile?.description || '',
        title: updateData.profile?.title || 'learner',
        interests: updateData.profile?.interests || [],
        location: updateData.profile?.location || '',
        website: updateData.profile?.website || '',
        phone: updateData.profile?.phone || '',
        socialMedia: {
          linkedin: updateData.profile?.socialMedia?.linkedin || '',
          twitter: updateData.profile?.socialMedia?.twitter || '',
          github: updateData.profile?.socialMedia?.github || ''
        },
        profileImage: updateData.profile?.profileImage || ''
      },
      updatedAt: new Date()
    };
    
    // Update user in database
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch updated user
    const updatedUser = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });
    
    console.log('Profile updated successfully for user:', updatedUser.email);
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profile update API error:', error);
    res.status(500).json({ error: 'Failed to update profile in database' });
  }
});

// Update event (requires authentication and organizer permission)
app.put('/api/events/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    console.log('Backend Debug - Event update request received:');
    console.log('Backend Debug - Event ID from params:', id);
    console.log('Backend Debug - Event ID type:', typeof id);
    console.log('Backend Debug - Update data keys:', Object.keys(updateData));
    
    
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // First, find the event by either string id or _id (like other endpoints)
    const event = await db.collection('events').findOne({
      $or: [
        { id: id },
        { id: parseInt(id) },
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null }
      ].filter(Boolean) // Remove null values
    });
    
    console.log('Backend Debug - Event found in database:', event ? 'Yes' : 'No');
    if (event) {
      console.log('Backend Debug - Event details:');
      console.log('Backend Debug - Event _id:', event._id);
      console.log('Backend Debug - Event id:', event.id);
      console.log('Backend Debug - Event organizer:', event.organizer);
      console.log('Backend Debug - Event organizer type:', typeof event.organizer);
    }
    
    if (!event) {
      console.log('Backend Debug - Event not found in database');
      return res.status(404).json({ error: 'Event not found' });
    }
    
    
    // Check if user is the organizer
    const organizerId = typeof event.organizer === 'string' 
      ? event.organizer 
      : event.organizer.toString();
    
    console.log('Backend Debug - Event update authorization check:');
    console.log('Backend Debug - userId from token:', userId);
    console.log('Backend Debug - userId type:', typeof userId);
    console.log('Backend Debug - event.organizer:', event.organizer);
    console.log('Backend Debug - organizerId:', organizerId);
    console.log('Backend Debug - organizerId type:', typeof organizerId);
    
    // Compare user IDs (handle both string and ObjectId formats)
    const userIdStr = userId?.toString();
    const organizerIdStr = organizerId?.toString();
    
    console.log('Backend Debug - userIdStr:', userIdStr);
    console.log('Backend Debug - organizerIdStr:', organizerIdStr);
    console.log('Backend Debug - IDs match:', userIdStr === organizerIdStr);
    
    if (userIdStr !== organizerIdStr) {
      console.log('Backend Debug - Authorization failed: User is not organizer');
      return res.status(403).json({ error: 'Only the event organizer can update this event' });
    }
    
    console.log('Backend Debug - Authorization passed: User is organizer');
    
    
    // Validate required fields (removed duration since it's calculated from start/end times)
    const requiredFields = ['name', 'description', 'date', 'time', 'venue', 'address', 'price', 'capacity', 'eventType', 'ageRestriction', 'howItWorks'];
    for (const field of requiredFields) {
      if (!updateData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    
    // Prepare update object
    const updateFields = {
      name: updateData.name,
      description: updateData.description,
      date: updateData.date,
      time: updateData.time,
      venue: updateData.venue,
      address: updateData.address,
      price: updateData.price,
      capacity: updateData.capacity,
      eventType: updateData.eventType,
      ageRestriction: updateData.ageRestriction,
      howItWorks: updateData.howItWorks,
      agenda: updateData.agenda || [],
      updatedAt: new Date()
    };
    
    // Update event in database using the found event's _id
    const result = await db.collection('events').updateOne(
      { _id: event._id },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Fetch updated event with organizer and speakers populated
    const updatedEvent = await db.collection('events').findOne({
      _id: event._id
    });
    
    // Get organizer details
    const organizer = await db.collection('users').findOne({
      _id: new ObjectId(updatedEvent.organizer)
    });
    
    // Get speakers details
    const speakers = await db.collection('users').find({
      _id: { $in: updatedEvent.speakers.map(id => new ObjectId(id)) }
    }).toArray();
    
    // Get participant count for this event
    const participantCount = await db.collection('participants').countDocuments({
      eventId: updatedEvent._id
    });
    
    const formattedEvent = {
      _id: updatedEvent._id,
      id: updatedEvent.id,
      name: updatedEvent.name,
      description: updatedEvent.description,
      date: updatedEvent.date,
      time: updatedEvent.time,
      venue: updatedEvent.venue,
      address: updatedEvent.address,
      price: updatedEvent.price,
      capacity: updatedEvent.capacity,
      eventType: updatedEvent.eventType,
      ageRestriction: updatedEvent.ageRestriction,
      howItWorks: updatedEvent.howItWorks,
      agenda: updatedEvent.agenda || [],
      thumbnail: updatedEvent.thumbnail,
      organizer: organizer,
      speakers: speakers,
      participantCount: participantCount,
      createdAt: updatedEvent.createdAt,
      updatedAt: updatedEvent.updatedAt
    };
    
    console.log('Event updated successfully:', formattedEvent.name);
    res.json({ 
      message: 'Event updated successfully',
      event: formattedEvent 
    });
  } catch (error) {
    console.error('Event update API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      eventId: req.params.id,
      userId: req.user?._id
    });
    res.status(500).json({ error: 'Failed to update event in database' });
  }
});

// Get all users (for skill station leader selection)
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    console.log('Fetching users for skill station leader selection');
    console.log('User ID from token:', req.user._id);
    const { db } = await connectToDatabase();
    const users = await db.collection('users').find({}).project({ password: 0, email: 0 }).limit(100).toArray();
    console.log('Found users:', users.length);
    res.json({ users });
  } catch (error) {
    console.error('Get users API error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Event Skill Station Management Routes
app.get('/api/events/:id/skill-stations', async (req, res) => {
  try {
    console.log('Fetching skill stations for event ID:', req.params.id);
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // Find the event
    const event = await db.collection('events').findOne({
      $or: [
        { id: req.params.id },
        { id: parseInt(req.params.id) },
        { _id: ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null }
      ].filter(Boolean)
    });
    
    if (!event) {
      console.log('Event not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('Event found, skillStations array:', event.skillStations);
    
    // Get skill stations
    let skillStations = [];
    if (event.skillStations && event.skillStations.length > 0) {
      // Handle both ObjectId instances and string IDs
      const skillStationIds = event.skillStations.map(id => {
        if (typeof id === 'string') {
          return new ObjectId(id);
        }
        return id; // Already an ObjectId
      });
      
      skillStations = await db.collection('skillstations').find({
        _id: { $in: skillStationIds }
      }).toArray();
      
      // Populate leader data
      for (let station of skillStations) {
        if (station.leader) {
          // Handle both ObjectId instances and string IDs for leader
          const leaderId = typeof station.leader === 'string' 
            ? new ObjectId(station.leader) 
            : station.leader;
          
          const leader = await db.collection('users').findOne({
            _id: leaderId
          });
          if (leader) {
            station.leader = {
              _id: leader._id,
              firstName: leader.firstName,
              lastName: leader.lastName,
              email: leader.email
            };
          }
        }
      }
    }
    
    console.log('Found skill stations:', skillStations.length);
    res.json(skillStations);
  } catch (error) {
    console.error('Get skill stations API error:', error);
    res.status(500).json({ error: 'Failed to fetch skill stations' });
  }
});

app.put('/api/events/:id/skill-stations', verifyToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { skillStations } = req.body;
    const userId = req.user._id;

    console.log('Updating skill stations for event ID:', eventId);
    console.log('User ID from token:', userId);
    console.log('User ID type:', typeof userId);
    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    
    // Find the event
    const event = await db.collection('events').findOne({
      $or: [
        { id: eventId },
        { id: parseInt(eventId) },
        { _id: ObjectId.isValid(eventId) ? new ObjectId(eventId) : null }
      ].filter(Boolean)
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    const organizerId = typeof event.organizer === 'string' 
      ? event.organizer 
      : event.organizer.toString();
    
    if (userId !== organizerId) {
      return res.status(403).json({ error: 'Only the event organizer can manage skill stations' });
    }

    // Update or create skill stations
    const updatedSkillStations = [];
    for (const stationData of skillStations) {
      if (stationData._id && stationData._id.startsWith('temp_')) {
        // Create new skill station
        const { _id, ...stationFields } = stationData;
        const newStation = {
          ...stationFields,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await db.collection('skillstations').insertOne(newStation);
        updatedSkillStations.push(result.insertedId);
      } else if (stationData._id) {
        // Update existing skill station
        const { _id, ...stationFields } = stationData;
        const updateFields = {
          ...stationFields,
          updatedAt: new Date()
        };
        const result = await db.collection('skillstations').updateOne(
          { _id: new ObjectId(stationData._id) },
          { $set: updateFields }
        );
        if (result.matchedCount > 0) {
          updatedSkillStations.push(new ObjectId(stationData._id));
        }
      }
    }

    // Update event with new skill station references
    await db.collection('events').updateOne(
      { _id: event._id },
      { $set: { skillStations: updatedSkillStations } }
    );

    // Return updated skill stations with populated leader data
    const populatedStations = await db.collection('skillstations').find({
      _id: { $in: updatedSkillStations }
    }).toArray();
    
    // Populate leader data
    for (let station of populatedStations) {
      if (station.leader) {
        // Handle both ObjectId instances and string IDs for leader
        const leaderId = typeof station.leader === 'string' 
          ? new ObjectId(station.leader) 
          : station.leader;
        
        const leader = await db.collection('users').findOne({
          _id: leaderId
        });
        if (leader) {
          station.leader = {
            _id: leader._id,
            firstName: leader.firstName,
            lastName: leader.lastName,
            email: leader.email
          };
        }
      }
    }

    res.json({
      message: 'Skill stations updated successfully',
      skillStations: populatedStations
    });
  } catch (error) {
    console.error('Update skill stations API error:', error);
    res.status(500).json({ error: 'Failed to update skill stations' });
  }
});

// Leave an event
app.post('/api/events/:eventId/leave', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = new ObjectId(req.user._id);

    // Find the event
    const event = await db.collection('events').findOne({ id: eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Remove user from participants array
    const result = await db.collection('events').updateOne(
      { id: eventId },
      { $pull: { participants: userId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'User is not participating in this event' });
    }

    res.json({
      message: 'Successfully left the event',
      eventId: eventId
    });
  } catch (error) {
    console.error('Leave event API error:', error);
    res.status(500).json({ error: 'Failed to leave event' });
  }
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
