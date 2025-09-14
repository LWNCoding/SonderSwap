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

// MongoDB Atlas Data API configuration
const ATLAS_API_BASE = process.env.ATLAS_API_BASE || 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1';
const ATLAS_API_KEY = process.env.ATLAS_API_KEY;
const ATLAS_CLUSTER_NAME = process.env.ATLAS_CLUSTER_NAME || 'Cluster0';
const ATLAS_DATABASE = process.env.ATLAS_DATABASE || 'sonderswap';

// Helper function to make Atlas Data API requests
async function atlasRequest(endpoint, method = 'GET', body = null) {
  if (!ATLAS_API_KEY) {
    throw new Error('ATLAS_API_KEY environment variable is not set');
  }

  const url = `${ATLAS_API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'api-key': ATLAS_API_KEY
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`Atlas API ${method} request to: ${url}`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Atlas API error: ${response.status} - ${data.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error('Atlas API request failed:', error);
    throw error;
  }
}

// Test API
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    atlasApiKey: process.env.ATLAS_API_KEY ? 'Set' : 'Not set',
    atlasApiBase: process.env.ATLAS_API_BASE || 'Not set',
    corsOrigin: process.env.CORS_ORIGIN || 'Not set'
  });
});

// Categories endpoint - fetch from eventcategories collection using Atlas Data API
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Categories API: Starting request');
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      ATLAS_API_KEY: process.env.ATLAS_API_KEY ? 'Set' : 'Not set',
      ATLAS_API_BASE: process.env.ATLAS_API_BASE || 'Not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN
    });
    
    // Use Atlas Data API to find all categories
    const response = await atlasRequest('/action/find', 'POST', {
      dataSource: ATLAS_CLUSTER_NAME,
      database: ATLAS_DATABASE,
      collection: 'eventcategories',
      filter: {}
    });
    
    console.log(`Found ${response.documents.length} categories in database`);
    console.log('Categories data:', response.documents);
    
    // Format categories for frontend
    const formattedCategories = response.documents.map((category) => ({
      _id: category._id.$oid,
      title: category.title,
      events: category.events || []
    }));
    
    console.log('Returning categories from eventcategories collection...');
    res.json(formattedCategories);
  } catch (error) {
    console.error('Categories API error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch categories from database',
      details: error.message,
      type: error.name
    });
  }
});

// Category events endpoint - fetch from database using Atlas Data API
app.get('/api/categories/:title/events', async (req, res) => {
  try {
    const { title } = req.params;
    console.log(`Category events API: Fetching events for category: ${title}`);
    
    // First, find the category to get the event IDs
    const categoryResponse = await atlasRequest('/action/findOne', 'POST', {
      dataSource: ATLAS_CLUSTER_NAME,
      database: ATLAS_DATABASE,
      collection: 'eventcategories',
      filter: { title: title }
    });
    
    console.log(`Found category:`, categoryResponse.document);

    let events = [];
    if (categoryResponse.document && categoryResponse.document.events && categoryResponse.document.events.length > 0) {
      const eventIds = categoryResponse.document.events;
      console.log(`Fetching events with IDs:`, eventIds);
      
      // Convert numbers to strings for the query
      const eventIdStrings = eventIds.map(id => id.toString());
      
      // Find events with matching IDs
      const eventsResponse = await atlasRequest('/action/find', 'POST', {
        dataSource: ATLAS_CLUSTER_NAME,
        database: ATLAS_DATABASE,
        collection: 'events',
        filter: { id: { $in: eventIdStrings } }
      });
      
      events = eventsResponse.documents;
    } else {
      console.log(`No category found or no events in category: ${title}`);
      return res.status(404).json({ error: 'Category not found' });
    }

    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event.id || event._id.$oid,
      name: event.name,
      date: event.date || '',
      time: event.time || '',
      thumbnail: event.thumbnail || `https://picsum.photos/800/600?random=${event.id || event._id.$oid}`,
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

// All events endpoint - fetch from database using Atlas Data API
app.get('/api/events', async (req, res) => {
  try {
    console.log('Events API: Fetching all events');
    
    const response = await atlasRequest('/action/find', 'POST', {
      dataSource: ATLAS_CLUSTER_NAME,
      database: ATLAS_DATABASE,
      collection: 'events',
      filter: {}
    });
    
    const events = response.documents;
    
    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event.id || event._id.$oid,
      name: event.name,
      date: event.date || '',
      time: event.time || '',
      thumbnail: event.thumbnail || `https://picsum.photos/800/600?random=${event.id || event._id.$oid}`,
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
    atlasApiKey: process.env.ATLAS_API_KEY ? 'Set' : 'Not set',
    atlasApiBase: process.env.ATLAS_API_BASE || 'Not set'
  });
});

// IP Check endpoint - shows the IP Vercel is using
app.get('/api/ip', (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  res.json({
    clientIP: clientIP,
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'user-agent': req.headers['user-agent']
    },
    timestamp: new Date().toISOString()
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;