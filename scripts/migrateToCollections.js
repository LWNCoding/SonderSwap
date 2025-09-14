import mongoose from 'mongoose';
import config from '../config/database.js';
import Event from '../src/models/Event.js';
import Speaker from '../src/models/Speaker.js';
import SkillStation from '../src/models/SkillStation.js';
import Participant from '../src/models/Participant.js';

// Connect to MongoDB
mongoose.connect(config.mongodb.connectionString)
.then(() => {
  console.log('MongoDB Connected for migration');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

async function migrateToCollections() {
  try {
    console.log('Starting migration to separate collections...');

    // Clear existing collections
    await Speaker.deleteMany({});
    await SkillStation.deleteMany({});
    await Participant.deleteMany({});
    console.log('Cleared existing collections');

    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events to migrate`);

    // Create speakers map to avoid duplicates
    const speakersMap = new Map();
    const skillStationsMap = new Map();

    for (const event of events) {
      console.log(`Processing event: ${event.name}`);

      // Process speakers
      if (event.speakers && event.speakers.length > 0) {
        const speakerIds = [];
        
        for (const speakerName of event.speakers) {
          if (typeof speakerName === 'string' && speakerName.trim()) {
            // Check if speaker already exists
            if (!speakersMap.has(speakerName)) {
              const speaker = new Speaker({
                name: speakerName,
                bio: `Expert in their field with extensive experience`,
                expertise: ['General Skills', 'Workshop Facilitation'],
                profileImage: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`,
                isActive: true
              });
              
              const savedSpeaker = await speaker.save();
              speakersMap.set(speakerName, savedSpeaker._id);
              speakerIds.push(savedSpeaker._id);
              console.log(`Created speaker: ${speakerName}`);
            } else {
              speakerIds.push(speakersMap.get(speakerName));
            }
          }
        }
        
        // Update event with speaker IDs
        event.speakers = speakerIds;
      }

      // Process skill stations
      if (event.skillStations && event.skillStations.length > 0) {
        const skillStationIds = [];
        
        for (const station of event.skillStations) {
          if (typeof station === 'object' && station.name) {
            const stationKey = `${station.name}-${station.skills}-${station.location}`;
            
            if (!skillStationsMap.has(stationKey)) {
              const skillStation = new SkillStation({
                name: station.name,
                description: `Learn ${station.skills} at this hands-on station`,
                skills: station.skills.split(',').map(s => s.trim()),
                location: station.location,
                capacity: 8, // Default capacity
                equipment: ['Basic tools', 'Materials'],
                requirements: ['No prior experience needed'],
                difficulty: 'All Levels',
                duration: 30, // 30 minutes default
                isActive: true
              });
              
              const savedStation = await skillStation.save();
              skillStationsMap.set(stationKey, savedStation._id);
              skillStationIds.push(savedStation._id);
              console.log(`Created skill station: ${station.name}`);
            } else {
              skillStationIds.push(skillStationsMap.get(stationKey));
            }
          }
        }
        
        // Update event with skill station IDs
        event.skillStations = skillStationIds;
      }

      // Save updated event
      await event.save();
      console.log(`Updated event: ${event.name}`);
    }

    console.log('Migration completed successfully!');
    console.log(`Created ${speakersMap.size} unique speakers`);
    console.log(`Created ${skillStationsMap.size} unique skill stations`);
    
    // Show some statistics
    const totalSpeakers = await Speaker.countDocuments();
    const totalSkillStations = await SkillStation.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    console.log('\nFinal Statistics:');
    console.log(`- Events: ${totalEvents}`);
    console.log(`- Speakers: ${totalSpeakers}`);
    console.log(`- Skill Stations: ${totalSkillStations}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration
migrateToCollections();
