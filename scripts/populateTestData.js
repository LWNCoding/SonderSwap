import mongoose from 'mongoose';
import config from '../config/database.js';
import { User } from '../src/models/User.js';
import Event from '../src/models/Event.js';
import Speaker from '../src/models/Speaker.js';
import SkillStation from '../src/models/SkillStation.js';
import Participant from '../src/models/Participant.js';

// Connect to MongoDB
mongoose.connect(config.mongodb.connectionString)
.then(() => {
  console.log('MongoDB Connected for test data population');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Sample data for generating realistic test users
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River',
  'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kendall', 'Lane', 'Parker',
  'Reese', 'Rowan', 'Skyler', 'Spencer', 'Tatum', 'Dakota', 'Phoenix', 'Indigo', 'Cedar', 'Aspen',
  'Brook', 'Canyon', 'Forest', 'Meadow', 'Ocean', 'Rain', 'Storm', 'Sunny', 'Willow', 'Zephyr'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const skills = [
  'Web Development', 'Mobile App Development', 'Data Science', 'Machine Learning', 'UI/UX Design',
  'Graphic Design', 'Photography', 'Videography', 'Digital Marketing', 'Content Writing',
  'Project Management', 'Agile Methodology', 'DevOps', 'Cloud Computing', 'Cybersecurity',
  'Blockchain', 'Artificial Intelligence', 'Game Development', '3D Modeling', 'Animation',
  'Music Production', 'Podcasting', 'Public Speaking', 'Workshop Facilitation', 'Teaching',
  'Mentoring', 'Leadership', 'Team Building', 'Communication', 'Problem Solving',
  'Critical Thinking', 'Creativity', 'Innovation', 'Research', 'Analysis',
  'Carpentry', 'Woodworking', 'Metalworking', 'Electronics', 'Robotics',
  'Cooking', 'Baking', 'Gardening', 'Sustainability', 'Environmental Science',
  'Fitness', 'Yoga', 'Meditation', 'Mindfulness', 'Wellness'
];

const expertise = [
  'Software Engineering', 'Product Management', 'Business Strategy', 'Marketing', 'Sales',
  'Customer Success', 'Operations', 'Finance', 'Human Resources', 'Legal',
  'Healthcare', 'Education', 'Non-profit', 'Government', 'Consulting',
  'Entrepreneurship', 'Startups', 'Venture Capital', 'Investment', 'Real Estate',
  'Architecture', 'Engineering', 'Science', 'Mathematics', 'Statistics',
  'Psychology', 'Sociology', 'Philosophy', 'History', 'Literature',
  'Art', 'Music', 'Theater', 'Dance', 'Sports',
  'Travel', 'Culture', 'Language', 'Translation', 'International Relations'
];

const bioTemplates = [
  "Passionate professional with {years} years of experience in {field}. Loves sharing knowledge and helping others grow.",
  "Experienced {role} with a background in {field}. Enjoys mentoring and teaching practical skills.",
  "Creative {role} who specializes in {field}. Always excited to learn and share new techniques.",
  "Dedicated {role} with expertise in {field}. Believes in the power of hands-on learning and collaboration.",
  "Innovative {role} with {years} years in {field}. Passionate about making complex topics accessible to everyone.",
  "Seasoned {role} who loves {field}. Enjoys facilitating workshops and seeing people's 'aha!' moments.",
  "Dynamic {role} with a diverse background in {field}. Committed to continuous learning and teaching.",
  "Enthusiastic {role} specializing in {field}. Loves connecting with people and sharing practical knowledge."
];

const roles = [
  'Developer', 'Designer', 'Manager', 'Consultant', 'Engineer', 'Analyst', 'Specialist', 'Coordinator',
  'Director', 'Lead', 'Architect', 'Strategist', 'Researcher', 'Trainer', 'Facilitator', 'Mentor'
];

const fields = [
  'technology', 'design', 'business', 'marketing', 'education', 'healthcare', 'finance', 'operations',
  'product development', 'customer experience', 'data analysis', 'project management', 'research',
  'sustainability', 'innovation', 'leadership', 'communication', 'strategy', 'consulting', 'entrepreneurship'
];

// Generate random test users
function generateTestUsers(count) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    
    // Generate random skills (2-5 skills per user)
    const userSkills = skills
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2);
    
    // Generate random expertise (1-3 areas)
    const userExpertise = expertise
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    // Generate bio
    const role = roles[Math.floor(Math.random() * roles.length)];
    const field = fields[Math.floor(Math.random() * fields.length)];
    const years = Math.floor(Math.random() * 15) + 1;
    const bioTemplate = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
    const bio = bioTemplate
      .replace('{role}', role)
      .replace('{field}', field)
      .replace('{years}', years);
    
    users.push({
      firstName,
      lastName,
      email,
      password: 'password123', // Will be hashed
      isEmailVerified: Math.random() > 0.2, // 80% verified
      profile: {
        bio,
        skills: userSkills,
        expertise: userExpertise,
        website: Math.random() > 0.7 ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com` : undefined,
        socialMedia: {
          linkedin: Math.random() > 0.5 ? `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
          twitter: Math.random() > 0.7 ? `@${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
          github: Math.random() > 0.6 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined
        }
      }
    });
  }
  
  return users;
}

// Generate speakers from users
function generateSpeakersFromUsers(users) {
  const speakers = [];
  
  // Select 20-30% of users to be speakers
  const speakerCount = Math.floor(users.length * (0.2 + Math.random() * 0.1));
  const selectedUsers = users
    .sort(() => 0.5 - Math.random())
    .slice(0, speakerCount);
  
  for (const user of selectedUsers) {
    speakers.push({
      name: `${user.firstName} ${user.lastName}`,
      bio: user.profile.bio,
      expertise: user.profile.expertise,
      profileImage: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`,
      email: user.email,
      website: user.profile.website,
      socialMedia: user.profile.socialMedia,
      isActive: true
    });
  }
  
  return speakers;
}

// Assign users to events as participants
async function assignUsersToEvents(users, events) {
  const participants = [];
  
  for (const user of users) {
    // Each user participates in 1-3 random events
    const participationCount = Math.floor(Math.random() * 3) + 1;
    const selectedEvents = events
      .sort(() => 0.5 - Math.random())
      .slice(0, participationCount);
    
    for (const event of selectedEvents) {
      // Check if user is already participating
      const existingParticipant = await Participant.findOne({ 
        eventId: event._id, 
        userId: user._id 
      });
      
      if (!existingParticipant) {
        // Randomly assign to a skill station if available
        const skillStations = await SkillStation.find({ isActive: true });
        const randomStation = skillStations.length > 0 
          ? skillStations[Math.floor(Math.random() * skillStations.length)]._id 
          : undefined;
        
        participants.push({
          eventId: event._id,
          userId: user._id,
          skillStationId: randomStation,
          status: Math.random() > 0.1 ? 'registered' : 'attended', // 90% registered, 10% attended
          checkInTime: Math.random() > 0.1 ? new Date() : undefined,
          checkOutTime: Math.random() > 0.8 ? new Date() : undefined,
          feedback: Math.random() > 0.7 ? {
            rating: Math.floor(Math.random() * 5) + 1,
            comment: ['Great event!', 'Learned a lot', 'Amazing experience', 'Highly recommend', 'Very informative'][Math.floor(Math.random() * 5)]
          } : undefined
        });
      }
    }
  }
  
  return participants;
}

async function populateTestData() {
  try {
    console.log('Starting test data population...');

    // Clear existing test data
    await User.deleteMany({ email: { $regex: /@example\.com$/ } });
    await Speaker.deleteMany({});
    await SkillStation.deleteMany({});
    await Participant.deleteMany({});
    console.log('Cleared existing test data');

    // Generate and create users
    const userCount = 50 + Math.floor(Math.random() * 51); // 50-100 users
    console.log(`Generating ${userCount} test users...`);
    
    const testUsers = generateTestUsers(userCount);
    const createdUsers = [];
    
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    
    console.log(`Created ${createdUsers.length} test users`);

    // Generate speakers from users
    const speakers = generateSpeakersFromUsers(testUsers);
    const createdSpeakers = [];
    
    for (const speakerData of speakers) {
      const speaker = new Speaker(speakerData);
      await speaker.save();
      createdSpeakers.push(speaker);
    }
    
    console.log(`Created ${createdSpeakers.length} speakers`);

    // Generate skill stations
    const skillStationData = [
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
        name: 'Data Science Lab',
        description: 'Explore data analysis and machine learning',
        skills: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter'],
        location: 'Lab Room - Station C',
        capacity: 8,
        equipment: ['Computers', 'Datasets', 'Notebooks'],
        requirements: ['Basic math knowledge'],
        difficulty: 'Intermediate',
        duration: 75
      },
      {
        name: 'UI/UX Design Studio',
        description: 'Create beautiful and functional user interfaces',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
        location: 'Design Room - Station D',
        capacity: 15,
        equipment: ['Drawing tablets', 'Design software', 'Templates'],
        requirements: ['Creative mindset'],
        difficulty: 'All Levels',
        duration: 45
      },
      {
        name: 'Digital Marketing Hub',
        description: 'Learn modern digital marketing strategies',
        skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
        location: 'Conference Room - Station E',
        capacity: 20,
        equipment: ['Presentation screens', 'Marketing tools'],
        requirements: ['Basic business knowledge'],
        difficulty: 'All Levels',
        duration: 50
      }
    ];

    const createdSkillStations = [];
    for (const stationData of skillStationData) {
      const station = new SkillStation(stationData);
      await station.save();
      createdSkillStations.push(station);
    }
    
    console.log(`Created ${createdSkillStations.length} skill stations`);

    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events`);

    // Randomly assign speakers to events
    for (const event of events) {
      // Each event gets 1-3 random speakers
      const speakerCount = Math.floor(Math.random() * 3) + 1;
      const selectedSpeakers = createdSpeakers
        .sort(() => 0.5 - Math.random())
        .slice(0, speakerCount)
        .map(speaker => speaker._id);
      
      event.speakers = selectedSpeakers;
      
      // Each event gets 2-4 random skill stations
      const stationCount = Math.floor(Math.random() * 3) + 2;
      const selectedStations = createdSkillStations
        .sort(() => 0.5 - Math.random())
        .slice(0, stationCount)
        .map(station => station._id);
      
      event.skillStations = selectedStations;
      
      await event.save();
    }
    
    console.log('Updated events with speakers and skill stations');

    // Assign users to events as participants
    console.log('Assigning users to events...');
    const participants = await assignUsersToEvents(createdUsers, events);
    
    for (const participantData of participants) {
      const participant = new Participant(participantData);
      await participant.save();
    }
    
    console.log(`Created ${participants.length} participant records`);

    // Show final statistics
    const totalUsers = await User.countDocuments();
    const totalSpeakers = await Speaker.countDocuments();
    const totalSkillStations = await SkillStation.countDocuments();
    const totalParticipants = await Participant.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    console.log('\n=== Final Statistics ===');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Speakers: ${totalSpeakers}`);
    console.log(`Total Skill Stations: ${totalSkillStations}`);
    console.log(`Total Events: ${totalEvents}`);
    console.log(`Total Participants: ${totalParticipants}`);
    
    // Show participation distribution
    const participationStats = await Participant.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\nParticipation Status Distribution:');
    participationStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    console.log('\nTest data population completed successfully!');

  } catch (error) {
    console.error('Test data population failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
populateTestData();
