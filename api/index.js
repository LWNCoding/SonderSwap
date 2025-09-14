import connectDB from './lib/db.js';
import { registerUser, loginUser, getUserById } from '../src/lib/auth.js';
import { authenticateToken } from '../src/lib/middleware.js';
import { asyncHandler, errorHandler, validateRequired, validateEmail, validatePassword } from '../src/lib/routeHandler.js';
import { User } from '../src/models/User.js';
import { SkillStation } from '../src/models/SkillStation.js';
import { Participant } from '../src/models/Participant.js';
import mongoose from 'mongoose';

// Initialize database connection
let dbConnected = false;

// Ensure database is connected
async function ensureDBConnection() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

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

const eventCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  events: [{ type: Number }]
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
const EventCategory = mongoose.models.EventCategory || mongoose.model('EventCategory', eventCategorySchema);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).set(corsHeaders).end();
    return;
  }

  // Set CORS headers for all responses
  res.set(corsHeaders);

  // Ensure database is connected
  await ensureDBConnection();

  try {
    const { query } = req;
    const path = query.path || [];
    
    // Debug logging
    console.log('API Request:', req.method, req.url, 'Path:', path);

    // Health check endpoint
    if (path[0] === 'health') {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    // Route handling
    if (path[0] === 'events') {
      if (req.method === 'GET' && path.length === 1) {
        // GET /api/events
        const events = await Event.find({})
          .populate('speakers', 'firstName lastName profile')
          .populate('skillStations', 'name description skills location capacity difficulty')
          .populate('organizer', 'firstName lastName email');
        
        const eventsWithCounts = await Promise.all(events.map(async (event) => {
          const participantCount = await Participant.countDocuments({ eventId: event._id });
          return {
            ...event.toObject(),
            participantCount
          };
        }));
        
        res.json(eventsWithCounts);
        return;
      } else if (req.method === 'GET' && path.length === 2) {
        // GET /api/events/:id
        const event = await Event.findOne({ id: path[1] })
          .populate('speakers', 'firstName lastName profile')
          .populate('skillStations', 'name description skills location capacity equipment requirements difficulty duration')
          .populate('organizer', 'firstName lastName email');
        
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        const participantCount = await Participant.countDocuments({ eventId: event._id });
        const eventWithCount = {
          ...event.toObject(),
          participantCount
        };
        
        res.json(eventWithCount);
        return;
      } else if (req.method === 'GET' && path[1] === 'search' && path[2]) {
        // GET /api/events/search/:query
        const events = await Event.find({
          $or: [
            { name: { $regex: path[2], $options: 'i' } },
            { description: { $regex: path[2], $options: 'i' } },
            { eventType: { $regex: path[2], $options: 'i' } }
          ]
        });
        res.json(events);
        return;
      } else if (req.method === 'POST' && path.length === 3 && path[2] === 'join') {
        // POST /api/events/:id/join
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const eventId = path[1];
        const userId = user._id;

        const event = await Event.findOne({ id: eventId });
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        const existingParticipant = await Participant.findOne({ eventId: event._id, userId });
        if (existingParticipant) {
          return res.status(400).json({ error: 'You are already participating in this event' });
        }

        const capacity = parseInt(event.capacity);
        const currentParticipantCount = await Participant.countDocuments({ eventId: event._id });
        if (currentParticipantCount >= capacity) {
          return res.status(400).json({ error: 'Event is at full capacity' });
        }

        const participant = new Participant({
          eventId: event._id,
          userId,
          status: 'registered'
        });

        await participant.save();

        res.json({
          message: 'Successfully joined the event',
          participantCount: currentParticipantCount + 1,
          capacity: capacity
        });
        return;
      } else if (req.method === 'DELETE' && path.length === 3 && path[2] === 'leave') {
        // DELETE /api/events/:id/leave
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const eventId = path[1];
        const userId = user._id;

        const event = await Event.findOne({ id: eventId });
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        const result = await Participant.deleteOne({ eventId: event._id, userId });
        if (result.deletedCount === 0) {
          return res.status(400).json({ error: 'You are not participating in this event' });
        }

        const participantCount = await Participant.countDocuments({ eventId: event._id });

        res.json({
          message: 'Successfully left the event',
          participantCount
        });
        return;
      } else if (req.method === 'GET' && path.length === 3 && path[2] === 'participants') {
        // GET /api/events/:id/participants
        const eventId = path[1];

        const event = await Event.findOne({ id: eventId });
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        const participants = await Participant.find({ eventId: event._id })
          .populate('userId', 'firstName lastName email')
          .populate('skillStationId', 'name skills location');

        res.json({
          participants,
          count: participants.length
        });
        return;
      } else if (req.method === 'GET' && path.length === 3 && path[2] === 'participation-status') {
        // GET /api/events/:id/participation-status
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const eventId = path[1];
        const userId = user._id;

        const event = await Event.findOne({ id: eventId });
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        const participant = await Participant.findOne({ eventId: event._id, userId });
        const participantCount = await Participant.countDocuments({ eventId: event._id });
        
        res.json({
          isParticipating: !!participant,
          participantCount,
          capacity: parseInt(event.capacity)
        });
        return;
      }
    } else if (path[0] === 'categories') {
      if (req.method === 'GET' && path.length === 1) {
        // GET /api/categories
        console.log('Fetching categories...');
        const categories = await EventCategory.find({});
        console.log('Categories found:', categories.length);
        res.json(categories);
        return;
      } else if (req.method === 'GET' && path.length === 3 && path[2] === 'events') {
        // GET /api/categories/:title/events
        const category = await EventCategory.findOne({ title: path[1] });
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        
        const eventIds = category.events.map(id => id.toString());
        const events = await Event.find({ id: { $in: eventIds } });
        res.json(events);
        return;
      }
    } else if (path[0] === 'auth') {
      if (req.method === 'POST' && path[1] === 'register') {
        // POST /api/auth/register
        const { email, password, firstName, lastName } = req.body;
        
        validateRequired(['email', 'password', 'firstName', 'lastName'], req.body);
        validateEmail(email);
        validatePassword(password);

        const result = await registerUser({ email, password, firstName, lastName });
        res.status(201).json({
          message: 'User created successfully',
          user: result.user,
          token: result.token
        });
        return;
      } else if (req.method === 'POST' && path[1] === 'login') {
        // POST /api/auth/login
        const { email, password } = req.body;
        
        validateRequired(['email', 'password'], req.body);

        const result = await loginUser({ email, password });
        res.json({
          message: 'Login successful',
          user: result.user,
          token: result.token
        });
        return;
      } else if (req.method === 'GET' && path[1] === 'me') {
        // GET /api/auth/me
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const userData = await getUserById(user._id);
        if (!userData) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: userData });
        return;
      }
    } else if (path[0] === 'profile') {
      if (req.method === 'GET') {
        // GET /api/profile
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const userData = await User.findById(user._id).select('-password');
        if (!userData) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: userData });
        return;
      } else if (req.method === 'PUT') {
        // PUT /api/profile
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = user._id;
        const updates = req.body;
        
        delete updates.password;
        delete updates.email;
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;
        
        const userData = await User.findByIdAndUpdate(
          userId,
          { $set: updates },
          { new: true, runValidators: true }
        ).select('-password');
        
        if (!userData) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ 
          message: 'Profile updated successfully',
          user: userData
        });
        return;
      }
    } else if (path[0] === 'users' && path.length === 2) {
      // GET /api/users/:userId
      const { userId } = path[1];
      
      const user = await User.findById(userId).select('-password -email');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
      return;
    } else if (path[0] === 'skill-stations') {
      if (req.method === 'GET' && path.length === 1) {
        // GET /api/skill-stations
        const skillStations = await SkillStation.find({ isActive: true });
        res.json(skillStations);
        return;
      } else if (req.method === 'GET' && path.length === 2) {
        // GET /api/skill-stations/:id
        const skillStation = await SkillStation.findById(path[1]);
        if (!skillStation) {
          return res.status(404).json({ error: 'Skill station not found' });
        }
        res.json(skillStation);
        return;
      } else if (req.method === 'POST' && path.length === 1) {
        // POST /api/skill-stations
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const skillStation = new SkillStation(req.body);
        await skillStation.save();
        res.status(201).json(skillStation);
        return;
      }
    } else if (path[0] === 'participants') {
      if (req.method === 'GET' && path.length === 1) {
        // GET /api/participants
        const user = await authenticateToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const participants = await Participant.find({ userId: user._id })
          .populate('eventId', 'name date time')
          .populate('skillStationId', 'name skills');
        res.json(participants);
        return;
      }
    } else if (path[0] === 'health') {
      // GET /api/health
      res.json({ status: 'OK', message: 'Server is running' });
      return;
    }

    // 404 for unmatched routes
    res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
