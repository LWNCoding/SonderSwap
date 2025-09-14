const connectDB = require('../lib/db.js');
const mongoose = require('mongoose');

// Event Category Schema
const eventCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  events: [{ type: Number }]
}, { timestamps: true });

const EventCategory = mongoose.models.EventCategory || mongoose.model('EventCategory', eventCategorySchema);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).set(corsHeaders).end();
    return;
  }

  // Set CORS headers for all responses
  res.set(corsHeaders);

  try {
    // Connect to database
    await connectDB();

    if (req.method === 'GET') {
      // GET /api/categories
      console.log('Fetching categories...');
      const categories = await EventCategory.find({});
      console.log('Categories found:', categories.length);
      res.json(categories);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
