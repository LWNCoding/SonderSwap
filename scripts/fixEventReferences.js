import mongoose from 'mongoose';
import config from '../config/database.js';
import Event from '../src/models/Event.js';
import Speaker from '../src/models/Speaker.js';
import SkillStation from '../src/models/SkillStation.js';
import Participant from '../src/models/Participant.js';

// Connect to MongoDB
mongoose.connect(config.mongodb.connectionString)
.then(() => {
  console.log('MongoDB Connected for fixing event references');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

async function fixEventReferences() {
  try {
    console.log('Starting to fix event references to separate collections...');

    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events to update`);

    // Get all available speakers and skill stations
    const speakers = await Speaker.find({ isActive: true });
    const skillStations = await SkillStation.find({ isActive: true });
    
    console.log(`Available speakers: ${speakers.length}`);
    console.log(`Available skill stations: ${skillStations.length}`);

    for (const event of events) {
      console.log(`Processing event: ${event.name}`);

      // Check if event already has proper references
      const hasSpeakerRefs = event.speakers && event.speakers.length > 0 && 
        event.speakers.some(s => typeof s === 'object' && s._id);
      const hasStationRefs = event.skillStations && event.skillStations.length > 0 && 
        event.skillStations.some(s => typeof s === 'object' && s._id);

      if (hasSpeakerRefs && hasStationRefs) {
        console.log(`  Event ${event.name} already has proper references, skipping`);
        continue;
      }

      // Assign random speakers to events (1-3 speakers per event)
      if (!hasSpeakerRefs) {
        const speakerCount = Math.floor(Math.random() * 3) + 1;
        const selectedSpeakers = speakers
          .sort(() => 0.5 - Math.random())
          .slice(0, speakerCount)
          .map(speaker => speaker._id);
        
        event.speakers = selectedSpeakers;
        console.log(`  Assigned ${selectedSpeakers.length} speakers`);
      }

      // Assign random skill stations to events (2-4 stations per event)
      if (!hasStationRefs) {
        const stationCount = Math.floor(Math.random() * 3) + 2;
        const selectedStations = skillStations
          .sort(() => 0.5 - Math.random())
          .slice(0, stationCount)
          .map(station => station._id);
        
        event.skillStations = selectedStations;
        console.log(`  Assigned ${selectedStations.length} skill stations`);
      }

      // Save updated event
      await event.save();
      console.log(`  Updated event: ${event.name}`);
    }

    // Verify the updates
    console.log('\nVerifying updates...');
    const updatedEvents = await Event.find({})
      .populate('speakers', 'name')
      .populate('skillStations', 'name');
    
    console.log('\nEvent Reference Summary:');
    updatedEvents.forEach(event => {
      console.log(`\n${event.name}:`);
      console.log(`  Speakers: ${event.speakers.length} (${event.speakers.map(s => s.name).join(', ')})`);
      console.log(`  Skill Stations: ${event.skillStations.length} (${event.skillStations.map(s => s.name).join(', ')})`);
    });

    // Show final statistics
    const totalEvents = await Event.countDocuments();
    const totalSpeakers = await Speaker.countDocuments();
    const totalSkillStations = await SkillStation.countDocuments();
    const totalParticipants = await Participant.countDocuments();
    
    console.log('\n=== Final Statistics ===');
    console.log(`Total Events: ${totalEvents}`);
    console.log(`Total Speakers: ${totalSpeakers}`);
    console.log(`Total Skill Stations: ${totalSkillStations}`);
    console.log(`Total Participants: ${totalParticipants}`);

    console.log('\nEvent references fixed successfully!');

  } catch (error) {
    console.error('Fixing event references failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
fixEventReferences();
