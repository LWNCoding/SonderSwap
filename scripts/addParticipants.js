import mongoose from 'mongoose';
import config from '../config/database.js';
import { User } from '../src/models/User.js';
import { Event } from '../src/models/Event.js';
import { Participant } from '../src/models/Participant.js';
import { SkillStation } from '../src/models/SkillStation.js';

async function addParticipants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.connectionString);
    console.log('MongoDB Connected');

    // Get all users and events
    const users = await User.find({});
    const events = await Event.find({});
    const skillStations = await SkillStation.find({});

    console.log(`Found ${users.length} users, ${events.length} events, ${skillStations.length} skill stations`);

    // Clear existing participants
    await Participant.deleteMany({});
    console.log('Cleared existing participants');

    // Add participants to events
    for (const event of events) {
      // Calculate how many participants this event should have (30-80% of capacity)
      const capacity = parseInt(event.capacity);
      const minParticipants = Math.floor(capacity * 0.3);
      const maxParticipants = Math.floor(capacity * 0.8);
      const participantCount = Math.floor(Math.random() * (maxParticipants - minParticipants + 1)) + minParticipants;

      // Select random users to participate
      const shuffledUsers = users.sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, participantCount);

      // Create participant records
      const participants = selectedUsers.map(user => {
        // Randomly select a skill station for this participant
        const randomSkillStation = skillStations[Math.floor(Math.random() * skillStations.length)];
        
        return {
          userId: user._id,
          eventId: event._id,
          skillStationId: randomSkillStation._id,
          joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        };
      });

      await Participant.insertMany(participants);
      console.log(`Added ${participants.length} participants to event "${event.name}"`);
    }

    // Verify the results
    const totalParticipants = await Participant.countDocuments();
    console.log(`\n✅ Successfully added ${totalParticipants} participants across all events`);

    // Show some sample data
    const sampleEvent = await Event.findOne({}).populate('speakers', 'firstName lastName');
    const eventParticipants = await Participant.find({ eventId: sampleEvent._id })
      .populate('userId', 'firstName lastName')
      .populate('skillStationId', 'name');
    
    console.log(`\n📊 Sample Event: "${sampleEvent.name}"`);
    console.log(`   Participants: ${eventParticipants.length}`);
    console.log(`   Speakers: ${sampleEvent.speakers.length}`);

  } catch (error) {
    console.error('Error adding participants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
}

addParticipants();

