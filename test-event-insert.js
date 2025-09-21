import mongoose from 'mongoose';
import config from './config/database.js';
import { Event } from './src/models/Event.js';
import { User } from './src/models/User.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.connectionString);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

async function testEventInsert() {
  await connectDB();
  
  // Get a user to use as organizer
  const user = await User.findOne({});
  if (!user) {
    console.error('No users found in database');
    process.exit(1);
  }
  
  console.log('Using user as organizer:', user.firstName, user.lastName);
  
  // Create a test event with all required fields
  const testEvent = new Event({
    id: '999',
    name: 'Test Event with Complete Data',
    address: 'Test City, CA',
    date: 'March 15, 2024',
    time: '10:00 AM - 4:00 PM',
    thumbnail: 'https://picsum.photos/800/600?random=999',
    description: 'This is a test event with complete data to verify all fields are saved correctly.',
    eventType: 'Technology',
    price: '$50',
    duration: '6 hours',
    capacity: '100',
    expectedParticipants: '75',
    ageRestriction: 'All ages welcome',
    organizer: user._id,
    venue: 'Test Convention Center',
    speakers: [user._id],
    agenda: [
      '10:00 AM - Registration',
      '11:00 AM - Opening',
      '12:00 PM - Lunch',
      '1:00 PM - Workshop',
      '2:00 PM - Networking',
      '3:00 PM - Closing'
    ],
    skillStations: [],
    howItWorks: 'This is how the test event works - participants will learn and network.'
  });
  
  try {
    const savedEvent = await testEvent.save();
    console.log('Test event saved successfully:');
    console.log(JSON.stringify(savedEvent, null, 2));
  } catch (error) {
    console.error('Error saving test event:', error);
  }
  
  await mongoose.disconnect();
}

testEventInsert().catch(console.error);
