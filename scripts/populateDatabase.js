import { connectDB, disconnectDB } from '../src/lib/database.js';
import { Event, EventCategory } from '../src/models/Event.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the JSON file
const eventsData = JSON.parse(readFileSync(join(__dirname, '../src/data/events.json'), 'utf8'));

// Function to populate events
const populateEvents = async () => {
  try {
    console.log('Starting to populate events...');
    
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');
    
    // Convert events object to array
    const eventsArray = Object.values(eventsData.events);
    
    // Insert events
    const insertedEvents = await Event.insertMany(eventsArray);
    console.log(`Successfully inserted ${insertedEvents.length} events`);
    
    return insertedEvents;
  } catch (error) {
    console.error('Error populating events:', error);
    throw error;
  }
};

// Function to populate event categories
const populateEventCategories = async () => {
  try {
    console.log('Starting to populate event categories...');
    
    // Clear existing categories
    await EventCategory.deleteMany({});
    console.log('Cleared existing event categories');
    
    // Insert categories
    const insertedCategories = await EventCategory.insertMany(eventsData.eventCategories);
    console.log(`Successfully inserted ${insertedCategories.length} event categories`);
    
    return insertedCategories;
  } catch (error) {
    console.error('Error populating event categories:', error);
    throw error;
  }
};

// Main function to populate the database
const populateDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Populating database...');
    await populateEvents();
    await populateEventCategories();
    
    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Database population failed:', error);
  } finally {
    await disconnectDB();
  }
};

// Run the script
populateDatabase();

export {
  populateDatabase,
  populateEvents,
  populateEventCategories
};
