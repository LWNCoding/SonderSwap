import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './config/database.js';
import { registerUser, loginUser, getUserById } from './src/lib/auth.js';
import { authenticateToken, optionalAuth } from './src/lib/middleware.js';
import { asyncHandler, errorHandler, validateRequired, validateEmail, validatePassword } from './src/lib/routeHandler.js';
import { User } from './src/models/User.js';
import { SkillStation } from './src/models/SkillStation.js';
import { Participant } from './src/models/Participant.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || config.mongodb.connectionString;
mongoose.connect(mongoUri)
.then(() => {
  console.log('MongoDB Connected');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Simple Event Schema
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

// API Routes
app.get('/api/events', asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .populate('speakers', 'firstName lastName profile')
    .populate('skillStations', 'name description skills location capacity difficulty')
    .populate('organizer', 'firstName lastName email');
  
  // Add participant count to each event
  const eventsWithCounts = await Promise.all(events.map(async (event) => {
    const participantCount = await Participant.countDocuments({ eventId: event._id });
    return {
      ...event.toObject(),
      participantCount
    };
  }));
  
  res.json(eventsWithCounts);
}));

app.get('/api/events/:id', asyncHandler(async (req, res) => {
  const event = await Event.findOne({ id: req.params.id })
    .populate('speakers', 'firstName lastName profile')
    .populate('skillStations', 'name description skills location capacity equipment requirements difficulty duration')
    .populate('organizer', 'firstName lastName email');
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  // Add participant count
  const participantCount = await Participant.countDocuments({ eventId: event._id });
  const eventWithCount = {
    ...event.toObject(),
    participantCount
  };
  
  res.json(eventWithCount);
}));

app.get('/api/categories', asyncHandler(async (req, res) => {
  const categories = await EventCategory.find({});
  res.json(categories);
}));

app.get('/api/categories/:title/events', asyncHandler(async (req, res) => {
  const category = await EventCategory.findOne({ title: req.params.title });
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const eventIds = category.events.map(id => id.toString());
  const events = await Event.find({ id: { $in: eventIds } });
  res.json(events);
}));

app.get('/api/events/search/:query', asyncHandler(async (req, res) => {
  const events = await Event.find({
    $or: [
      { name: { $regex: req.params.query, $options: 'i' } },
      { description: { $regex: req.params.query, $options: 'i' } },
      { eventType: { $regex: req.params.query, $options: 'i' } }
    ]
  });
  res.json(events);
}));

// Authentication routes
app.post('/api/auth/register', asyncHandler(async (req, res) => {
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
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  validateRequired(['email', 'password'], req.body);

  const result = await loginUser({ email, password });
  res.json({
    message: 'Login successful',
    user: result.user,
    token: result.token
  });
}));

app.get('/api/auth/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await getUserById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
}));

// Profile API Routes
app.get('/api/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
}));

app.put('/api/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;
  
  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updates.password;
  delete updates.email;
  delete updates._id;
  delete updates.createdAt;
  delete updates.updatedAt;
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ 
    message: 'Profile updated successfully',
    user 
  });
}));

// Get user profile by ID (public endpoint)
app.get('/api/users/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId).select('-password -email');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user });
}));


// Event participation routes
app.post('/api/events/:id/join', authenticateToken, asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  const event = await Event.findOne({ id: eventId });
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check if user is already participating
  const existingParticipant = await Participant.findOne({ eventId: event._id, userId });
  if (existingParticipant) {
    return res.status(400).json({ error: 'You are already participating in this event' });
  }

  // Check capacity
  const capacity = parseInt(event.capacity);
  const currentParticipantCount = await Participant.countDocuments({ eventId: event._id });
  if (currentParticipantCount >= capacity) {
    return res.status(400).json({ error: 'Event is at full capacity' });
  }

  // Create new participant
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
}));

app.delete('/api/events/:id/leave', authenticateToken, asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  const event = await Event.findOne({ id: eventId });
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Remove participant
  const result = await Participant.deleteOne({ eventId: event._id, userId });
  if (result.deletedCount === 0) {
    return res.status(400).json({ error: 'You are not participating in this event' });
  }

  // Get updated participant count
  const participantCount = await Participant.countDocuments({ eventId: event._id });

  res.json({
    message: 'Successfully left the event',
    participantCount
  });
}));

app.get('/api/events/:id/participants', asyncHandler(async (req, res) => {
  const eventId = req.params.id;

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
}));

app.get('/api/events/:id/participation-status', authenticateToken, asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

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
}));

// Health check

// Skill Station API Routes
app.get('/api/skill-stations', asyncHandler(async (req, res) => {
  const skillStations = await SkillStation.find({ isActive: true });
  res.json(skillStations);
}));

app.get('/api/skill-stations/:id', asyncHandler(async (req, res) => {
  const skillStation = await SkillStation.findById(req.params.id);
  if (!skillStation) {
    return res.status(404).json({ error: 'Skill station not found' });
  }
  res.json(skillStation);
}));

app.post('/api/skill-stations', authenticateToken, asyncHandler(async (req, res) => {
  const skillStation = new SkillStation(req.body);
  await skillStation.save();
  res.status(201).json(skillStation);
}));

// Participant API Routes
app.get('/api/participants', authenticateToken, asyncHandler(async (req, res) => {
  const participants = await Participant.find({ userId: req.user._id })
    .populate('eventId', 'name date time')
    .populate('skillStationId', 'name skills');
  res.json(participants);
}));

app.get('/api/events/:id/participants', asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const participants = await Participant.find({ eventId })
    .populate('userId', 'firstName lastName email')
    .populate('skillStationId', 'name skills location');
  res.json(participants);
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});