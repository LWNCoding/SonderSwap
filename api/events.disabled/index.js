const connectDB = require('../lib/db.js');
const mongoose = require('mongoose');

// Event Schema
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

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

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
      // GET /api/events
      console.log('Fetching events...');
      const events = await Event.find({})
        .populate('speakers', 'firstName lastName profile')
        .populate('skillStations', 'name description skills location capacity difficulty')
        .populate('organizer', 'firstName lastName email');
      
      console.log('Events found:', events.length);
      res.json(events);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Events API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
