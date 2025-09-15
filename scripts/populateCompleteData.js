import mongoose from 'mongoose';
import config from '../config/database.js';
import { User } from '../src/models/User.js';
import { Event } from '../src/models/Event.js';
import { SkillStation } from '../src/models/SkillStation.js';
import { Category } from '../src/models/Category.js';
import { Participant } from '../src/models/Participant.js';

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

// Clear all existing data
const clearAllData = async () => {
  console.log('Clearing all existing data...');
  await User.deleteMany({});
  await Event.deleteMany({});
  await SkillStation.deleteMany({});
  await Category.deleteMany({});
  await Participant.deleteMany({});
  console.log('All data cleared');
};

// Create 75 users
const createUsers = async () => {
  console.log('Creating 75 users...');
  const users = [];
  
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River',
    'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kendall', 'Logan', 'Parker',
    'Reese', 'Sawyer', 'Skyler', 'Tatum', 'Tyler', 'Valentine', 'Willow', 'Zion', 'Adrian', 'Ari',
    'Ashton', 'Aubrey', 'August', 'Avery', 'Bailey', 'Blake', 'Brooklyn', 'Cameron', 'Charlie', 'Dakota',
    'Drew', 'Ellis', 'Emery', 'Finley', 'Gray', 'Harper', 'Hayden', 'Indigo', 'Jaden', 'Jamie',
    'Jesse', 'Jordan', 'Kai', 'Kendall', 'Lane', 'Logan', 'London', 'Mackenzie', 'Marley', 'Morgan',
    'Noah', 'Ocean', 'Parker', 'Peyton', 'Phoenix', 'Quinn', 'Reese', 'Remy', 'River', 'Rowan',
    'Sage', 'Sawyer', 'Skyler', 'Tatum', 'Taylor', 'Tyler', 'Valentine', 'Willow', 'Zion', 'Ari'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
    'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
    'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
  ];
  
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  
  for (let i = 0; i < 75; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domain}`;
    
    users.push({
      firstName,
      lastName,
      email,
      password: 'password123', // Default password for all users
      isEmailVerified: Math.random() > 0.3,
      profile: {
        bio: `Passionate professional with expertise in technology and innovation. Always eager to learn and share knowledge with others.`,
        title: ['learner', 'swapper', 'both'][Math.floor(Math.random() * 3)],
        interests: [
          'JavaScript', 'Python', 'React', 'Node.js', 'Design', 'Marketing', 'Leadership', 'Communication'
        ].slice(0, Math.floor(Math.random() * 4) + 2),
        location: [
          'San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Boston, MA',
          'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Portland, OR', 'Miami, FL'
        ][Math.floor(Math.random() * 10)],
        profileImage: `https://i.pravatar.cc/150?img=${i + 1}`,
        socialMedia: {
          linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          twitter: `https://twitter.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`
        }
      }
    });
  }
  
  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

// Create skill stations
const createSkillStations = async () => {
  console.log('Creating skill stations...');
  const skillStations = [
    {
      name: 'Web Development Workshop',
      description: 'Hands-on web development with HTML, CSS, and JavaScript',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      location: 'Main Hall - Station A',
      capacity: 12,
      equipment: ['Laptops', 'Monitors', 'Keyboards'],
      requirements: ['Basic computer skills'],
      difficulty: 'Beginner',
      duration: 60
    },
    {
      name: 'Mobile App Development',
      description: 'Build mobile apps using modern frameworks',
      skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift'],
      location: 'Main Hall - Station B',
      capacity: 10,
      equipment: ['Tablets', 'Phones', 'Development tools'],
      requirements: ['Programming experience'],
      difficulty: 'Intermediate',
      duration: 90
    },
    {
      name: 'UI/UX Design Studio',
      description: 'Create beautiful and functional user interfaces',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
      location: 'Design Room - Station C',
      capacity: 15,
      equipment: ['Design tablets', 'Software licenses'],
      requirements: ['Design interest'],
      difficulty: 'All Levels',
      duration: 75
    },
    {
      name: 'Data Science Lab',
      description: 'Explore data analysis and machine learning',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter', 'SQL'],
      location: 'Lab Room - Station D',
      capacity: 8,
      equipment: ['High-performance computers', 'Data visualization tools'],
      requirements: ['Basic programming knowledge'],
      difficulty: 'Intermediate',
      duration: 120
    },
    {
      name: 'Digital Marketing Hub',
      description: 'Learn modern digital marketing strategies',
      skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics', 'PPC'],
      location: 'Conference Room - Station E',
      capacity: 20,
      equipment: ['Presentation screens', 'Marketing tools'],
      requirements: ['Marketing interest'],
      difficulty: 'All Levels',
      duration: 45
    }
  ];
  
  const createdSkillStations = await SkillStation.insertMany(skillStations);
  console.log(`Created ${createdSkillStations.length} skill stations`);
  return createdSkillStations;
};

// Create categories
const createCategories = async () => {
  console.log('Creating categories...');
  const categories = [
    { name: 'Technology', description: 'Tech events and workshops' },
    { name: 'Design', description: 'Design and creative events' },
    { name: 'Business', description: 'Business and entrepreneurship' },
    { name: 'Education', description: 'Learning and development' },
    { name: 'Health & Wellness', description: 'Health and wellness events' },
    { name: 'Arts & Culture', description: 'Arts and cultural events' },
    { name: 'Trending Events', description: 'Popular and trending events' }
  ];
  
  const createdCategories = await Category.insertMany(categories);
  console.log(`Created ${createdCategories.length} categories`);
  return createdCategories;
};

// Create 25 events with complete data
const createEvents = async (users, skillStations, categories) => {
  console.log('Creating 25 events...');
  const events = [];
  
  const eventNames = [
    'Tech Innovation Summit 2024', 'Art & Culture Festival', 'Data Science Workshop',
    'Web Development Bootcamp', 'Digital Marketing Conference', 'Photography Masterclass',
    'AI & Machine Learning Expo', 'Creative Writing Workshop', 'UX/UI Design Meetup',
    'Blockchain & Crypto Summit', 'Music Production Workshop', 'Sustainable Living Expo',
    'Mobile App Development', 'Graphic Design Conference', 'Cybersecurity Symposium',
    'Entrepreneurship Summit', 'Language Learning Exchange', 'Fitness & Wellness Expo',
    'Culinary Arts Workshop', 'Environmental Science Conference', 'Gaming & Esports Expo',
    'Fashion & Design Show', 'Healthcare Innovation Summit', 'Education Technology Forum',
    'Social Impact Conference'
  ];
  
  const cities = [
    'San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Boston, MA',
    'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Portland, OR', 'Miami, FL',
    'Atlanta, GA', 'Phoenix, AZ', 'Dallas, TX', 'Houston, TX', 'Philadelphia, PA'
  ];
  
  const eventTypes = ['Technology', 'Design', 'Business', 'Education', 'Health & Wellness', 'Arts & Culture'];
  const prices = ['Free', '$25', '$50', '$75', '$100', '$150', '$200'];
  const durations = ['2 hours', '4 hours', '6 hours', '8 hours', '1 day', '2 days', '3 days'];
  const capacities = ['50', '100', '150', '200', '300', '500', '1000'];
  
  // Shuffle users for random assignment
  const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < 25; i++) {
    const eventName = eventNames[i];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const price = prices[Math.floor(Math.random() * prices.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const capacity = capacities[Math.floor(Math.random() * capacities.length)];
    
    // Select 2-4 random speakers from users (skip first user which is demo)
    const numSpeakers = Math.floor(Math.random() * 3) + 2;
    const speakers = shuffledUsers.slice(0, numSpeakers).map(user => user._id);
    
    // Select a random organizer from users
    const organizer = shuffledUsers[Math.floor(Math.random() * shuffledUsers.length)];
    
    // Select 2-4 random skill stations
    const numSkillStations = Math.floor(Math.random() * 3) + 2;
    const shuffledSkillStations = [...skillStations].sort(() => 0.5 - Math.random());
    const selectedSkillStations = shuffledSkillStations.slice(0, numSkillStations).map(station => station._id);
    
    // Generate random date (next 30-90 days)
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 60) + 30);
    const dateStr = eventDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Generate detailed descriptions based on event type
    const descriptions = {
      'Technology': `Join us for an exciting ${eventType.toLowerCase()} event featuring the latest innovations and networking opportunities. This comprehensive event brings together industry leaders, professionals, and enthusiasts for a day of learning, collaboration, and inspiration. Discover cutting-edge technologies, participate in hands-on workshops, and connect with like-minded individuals in the tech community.`,
      'Design': `Immerse yourself in the world of design at this ${eventType.toLowerCase()} event. Learn from top designers, explore new creative techniques, and showcase your work. This event combines practical workshops, inspiring talks, and networking opportunities for designers of all levels.`,
      'Business': `Network and learn at this ${eventType.toLowerCase()} event designed for entrepreneurs and business professionals. Gain insights from successful business leaders, participate in interactive sessions, and discover new opportunities for growth and collaboration.`,
      'Education': `Expand your knowledge and skills at this ${eventType.toLowerCase()} event. Featuring expert speakers, hands-on learning experiences, and opportunities to connect with educators and learners from around the world.`,
      'Health & Wellness': `Focus on your well-being at this ${eventType.toLowerCase()} event. Learn about the latest trends in health and wellness, participate in interactive sessions, and connect with health professionals and wellness enthusiasts.`,
      'Arts & Culture': `Celebrate creativity and culture at this ${eventType.toLowerCase()} event. Experience art exhibitions, cultural performances, and interactive workshops that showcase the diversity and richness of human expression.`
    };
    
    events.push({
      id: (i + 1).toString(),
      name: eventName,
      address: city,
      date: dateStr,
      time: `${Math.floor(Math.random() * 12) + 8}:00 AM - ${Math.floor(Math.random() * 8) + 2}:00 PM`,
      thumbnail: `https://picsum.photos/800/600?random=${i + 100}`,
      description: descriptions[eventType] || descriptions['Technology'],
      eventType,
      price,
      duration,
      capacity,
      expectedParticipants: Math.floor(parseInt(capacity) * (0.6 + Math.random() * 0.3)).toString(),
      ageRestriction: Math.random() > 0.7 ? '18+ only' : 'All ages welcome',
      organizer: organizer._id,
      venue: `${city.split(',')[0]} Convention Center`,
      speakers,
      agenda: [
        '9:00 AM - Registration & Welcome Coffee',
        '10:00 AM - Opening Keynote',
        '11:30 AM - Panel Discussion',
        '1:00 PM - Lunch & Networking',
        '2:30 PM - Workshop Sessions',
        '4:00 PM - Closing Remarks',
        '5:00 PM - Networking Reception'
      ],
      skillStations: selectedSkillStations,
      howItWorks: 'Explore different stations and sessions throughout the event. Share what you know, discover new techniques, and practice alongside others in a supportive environment. Each space focuses on a unique aspect of learning and creation, giving you the chance to participate, teach, or simply enjoy the experience.'
    });
  }
  
  console.log('Sample event before insertion:', JSON.stringify(events[0], null, 2));
  
  try {
    const createdEvents = await Event.insertMany(events);
    console.log(`Created ${createdEvents.length} events`);
    
    // Verify the first event was saved correctly
    const savedEvent = await Event.findOne({ id: '1' });
    console.log('First event after insertion:', JSON.stringify(savedEvent, null, 2));
    
    return createdEvents;
  } catch (error) {
    console.error('Error inserting events:', error);
    throw error;
  }
};

// Create participants for events
const createParticipants = async (users, events) => {
  console.log('Creating participants...');
  const participants = [];
  
  // For each event, randomly assign 20-80% of users as participants
  for (const event of events) {
    const numParticipants = Math.floor(users.length * (0.2 + Math.random() * 0.6));
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const eventParticipants = shuffledUsers.slice(0, numParticipants);
    
    for (const user of eventParticipants) {
      const statuses = ['registered', 'attended', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      participants.push({
        eventId: event._id,
        userId: user._id,
        status: status,
        checkInTime: status === 'attended' || status === 'completed' ? new Date() : undefined,
        checkOutTime: status === 'completed' ? new Date() : undefined,
        feedback: Math.random() > 0.7 ? {
          rating: Math.floor(Math.random() * 5) + 1,
          comment: 'Great event! Learned a lot and met amazing people.'
        } : undefined
      });
    }
  }
  
  const createdParticipants = await Participant.insertMany(participants);
  console.log(`Created ${createdParticipants.length} participant records`);
  return createdParticipants;
};

// Update eventcategories collection
const updateEventCategories = async (events, categories) => {
  console.log('Updating eventcategories collection...');
  
  // Clear existing eventcategories
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(config.mongodb.connectionString);
  await client.connect();
  const db = client.db('sonderswap');
  await db.collection('eventcategories').deleteMany({});
  
  // Create eventcategories entries
  const eventCategories = [
    {
      title: 'Trending Events',
      events: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    {
      title: 'Technology',
      events: [1, 3, 7, 13, 15, 20, 24]
    },
    {
      title: 'Design',
      events: [2, 9, 14, 16, 22]
    },
    {
      title: 'Business',
      events: [4, 16, 20, 23, 25]
    },
    {
      title: 'Education',
      events: [3, 5, 8, 12, 17, 24]
    },
    {
      title: 'Health & Wellness',
      events: [6, 11, 18, 21]
    },
    {
      title: 'Arts & Culture',
      events: [2, 8, 11, 16, 19, 22]
    }
  ];
  
  await db.collection('eventcategories').insertMany(eventCategories);
  console.log('Updated eventcategories collection');
  
  await client.close();
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await clearAllData();
    
    const users = await createUsers();
    const skillStations = await createSkillStations();
    const categories = await createCategories();
    const events = await createEvents(users, skillStations, categories);
    const participants = await createParticipants(users, events);
    await updateEventCategories(events, categories);
    
    console.log('\n✅ Complete dataset generation completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Skill Stations: ${skillStations.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Participants: ${participants.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating complete dataset:', error);
    process.exit(1);
  }
};

main();
