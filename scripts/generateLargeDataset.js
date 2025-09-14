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

// Generate 75 users
const createUsers = async () => {
  console.log('Creating 75 users...');
  const users = [];
  
  const firstNames = [
    'Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Maria', 'Chris', 'Anna',
    'James', 'Sophie', 'Ryan', 'Elena', 'Tom', 'Nina', 'Ben', 'Zoe', 'Sam', 'Luna',
    'Jake', 'Maya', 'Luke', 'Iris', 'Noah', 'Aria', 'Ethan', 'Mia', 'Liam', 'Ava',
    'Oliver', 'Isabella', 'William', 'Sophia', 'Henry', 'Charlotte', 'Jack', 'Amelia',
    'Owen', 'Harper', 'Sebastian', 'Evelyn', 'Gabriel', 'Abigail', 'Julian', 'Emily',
    'Mateo', 'Elizabeth', 'Leo', 'Sofia', 'Theo', 'Avery', 'Hugo', 'Ella', 'Arthur',
    'Madison', 'Felix', 'Scarlett', 'Luca', 'Victoria', 'Max', 'Grace', 'Isaac', 'Chloe',
    'Oscar', 'Camila', 'Eli', 'Penelope', 'Mason', 'Riley', 'Logan', 'Layla', 'Caleb'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey'
  ];
  
  const titles = ['learner', 'swapper', 'both'];
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Boston, MA',
    'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Portland, OR', 'Miami, FL',
    'Atlanta, GA', 'Phoenix, AZ', 'Dallas, TX', 'Houston, TX', 'Philadelphia, PA',
    'Detroit, MI', 'Minneapolis, MN', 'Nashville, TN', 'Orlando, FL', 'Las Vegas, NV'
  ];
  
  const interests = [
    'Technology', 'Art', 'Music', 'Cooking', 'Photography', 'Fitness', 'Travel',
    'Writing', 'Design', 'Programming', 'Business', 'Science', 'Languages',
    'Gardening', 'Sports', 'Gaming', 'Fashion', 'Dance', 'Theater', 'Film'
  ];
  
  for (let i = 0; i < 75; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    
    // Generate random interests (2-5 interests per user)
    const userInterests = [];
    const numInterests = Math.floor(Math.random() * 4) + 2;
    const shuffledInterests = [...interests].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numInterests; j++) {
      userInterests.push(shuffledInterests[j]);
    }
    
    users.push({
      email,
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName,
      lastName,
      isEmailVerified: true,
      profile: {
        bio: `Passionate about ${userInterests[0]} and always eager to learn new skills.`,
        description: `Experienced professional with expertise in ${userInterests.slice(0, 2).join(' and ')}.`,
        title: titles[Math.floor(Math.random() * titles.length)],
        interests: userInterests,
        location: locations[Math.floor(Math.random() * locations.length)],
        website: `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com`,
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        socialMedia: {
          linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          twitter: `https://twitter.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`
        },
        profileImage: `https://picsum.photos/150/150?random=${i}`
      }
    });
  }
  
  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

// Generate 25 events
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
  
  const eventTypes = ['Technology', 'Arts & Culture', 'Education', 'Business', 'Health & Wellness'];
  const prices = ['Free', '$25', '$50', '$75', '$100', '$150', '$200'];
  const durations = ['2 hours', '4 hours', '6 hours', '8 hours', '1 day', '2 days', '3 days'];
  const capacities = ['50', '100', '150', '200', '300', '500', '1000'];
  
  for (let i = 0; i < 25; i++) {
    const eventName = eventNames[i];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const price = prices[Math.floor(Math.random() * prices.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const capacity = capacities[Math.floor(Math.random() * capacities.length)];
    
    // Select 2-4 random speakers from users (skip first user which is demo)
    const numSpeakers = Math.floor(Math.random() * 3) + 2;
    const shuffledUsers = [...users].slice(1).sort(() => 0.5 - Math.random());
    const speakers = shuffledUsers.slice(0, numSpeakers).map(user => user._id);
    
    // Select a random organizer from users (skip first user which is demo)
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
    
    events.push({
      id: (i + 1).toString(),
      name: eventName,
      address: city,
      date: dateStr,
      time: `${Math.floor(Math.random() * 12) + 8}:00 AM - ${Math.floor(Math.random() * 8) + 2}:00 PM`,
      thumbnail: `https://picsum.photos/800/600?random=${i + 100}`,
      description: `Join us for an exciting ${eventType.toLowerCase()} event featuring the latest innovations and networking opportunities. This comprehensive event brings together industry leaders, professionals, and enthusiasts for a day of learning, collaboration, and inspiration.`,
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
  
  const createdEvents = await Event.insertMany(events);
  console.log(`Created ${createdEvents.length} events`);
  return createdEvents;
};

// Generate skill stations
const createSkillStations = async () => {
  console.log('Creating skill stations...');
  const skillStations = [
    {
      name: 'Web Development Workshop',
      description: 'Hands-on web development with HTML, CSS, and JavaScript',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
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
      skills: ['React Native', 'Flutter', 'iOS', 'Android'],
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
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
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
      skills: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter'],
      location: 'Lab Room - Station D',
      capacity: 8,
      equipment: ['High-performance computers', 'Data sets'],
      requirements: ['Basic programming'],
      difficulty: 'Intermediate',
      duration: 120
    },
    {
      name: 'Digital Marketing Hub',
      description: 'Learn modern digital marketing strategies',
      skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
      location: 'Conference Room - Station E',
      capacity: 20,
      equipment: ['Presentation screens', 'Marketing tools'],
      requirements: ['Business interest'],
      difficulty: 'All Levels',
      duration: 45
    }
  ];
  
  const createdSkillStations = await SkillStation.insertMany(skillStations);
  console.log(`Created ${createdSkillStations.length} skill stations`);
  return createdSkillStations;
};

// Generate categories
const createCategories = async () => {
  console.log('Creating categories...');
  const categories = [
    { name: 'Technology', description: 'Tech events and workshops' },
    { name: 'Arts & Culture', description: 'Creative and cultural events' },
    { name: 'Education', description: 'Learning and educational workshops' },
    { name: 'Business', description: 'Professional development and networking' },
    { name: 'Health & Wellness', description: 'Fitness, health, and wellness events' },
    { name: 'Science', description: 'Scientific research and discovery' },
    { name: 'Music', description: 'Musical events and workshops' },
    { name: 'Photography', description: 'Photography and visual arts' },
    { name: 'Cooking', description: 'Culinary arts and food events' },
    { name: 'Sports', description: 'Athletic and sports-related events' },
    { name: 'Gaming', description: 'Gaming and esports events' },
    { name: 'Fashion', description: 'Fashion and design events' },
    { name: 'Travel', description: 'Travel and adventure events' },
    { name: 'Environment', description: 'Environmental and sustainability events' },
    { name: 'Language', description: 'Language learning and exchange' },
    { name: 'Writing', description: 'Writing and literature events' },
    { name: 'Dance', description: 'Dance and movement events' },
    { name: 'Theater', description: 'Theater and performing arts' },
    { name: 'Film', description: 'Film and cinema events' }
  ];
  
  const createdCategories = await Category.insertMany(categories);
  console.log(`Created ${createdCategories.length} categories`);
  return createdCategories;
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
    
    console.log('\n✅ Large dataset generation completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Skill Stations: ${skillStations.length}`);
    console.log(`   - Categories: ${categories.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating large dataset:', error);
    process.exit(1);
  }
};

main();
