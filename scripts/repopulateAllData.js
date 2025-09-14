import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Event } from '../src/models/Event.js';
import { Speaker } from '../src/models/Speaker.js';
import { SkillStation } from '../src/models/SkillStation.js';
import { Participant } from '../src/models/Participant.js';
import { Category } from '../src/models/Category.js';

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://lwncoding_db_user:TV26aPCnHe7yEppN@dev.xigvhak.mongodb.net/?retryWrites=true&w=majority&appName=dev');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearAllData = async () => {
  console.log('Clearing all existing data...');
  await User.deleteMany({});
  await Event.deleteMany({});
  await Speaker.deleteMany({});
  await SkillStation.deleteMany({});
  await Participant.deleteMany({});
  await Category.deleteMany({});
  console.log('All data cleared');
};

// Create users
const createUsers = async () => {
  console.log('Creating users...');
  const users = [
    {
      email: 'demo@sonderswap.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName: 'Demo',
      lastName: 'User',
      isEmailVerified: true,
      profile: {
        bio: 'Welcome to SonderSwap! I love connecting people through skill sharing.',
        description: 'Passionate about learning and teaching new skills',
        title: 'both',
        interests: ['Technology', 'Art', 'Music', 'Cooking'],
        location: 'San Francisco, CA',
        website: 'https://sonderswap.com',
        phone: '+1 (555) 123-4567',
        socialMedia: {
          linkedin: 'https://linkedin.com/in/demouser',
          twitter: 'https://twitter.com/demouser',
          github: 'https://github.com/demouser'
        },
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      email: 'alex.martin@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      firstName: 'Alex',
      lastName: 'Martin',
      isEmailVerified: true,
      profile: {
        bio: 'Experienced developer with a passion for teaching web development.',
        description: 'Full-stack developer specializing in React and Node.js',
        title: 'swapper',
        interests: ['Web Development', 'JavaScript', 'React', 'Node.js'],
        location: 'Seattle, WA',
        website: 'https://alexmartin.dev',
        socialMedia: {
          linkedin: 'https://linkedin.com/in/alexmartin',
          github: 'https://github.com/alexmartin'
        },
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      email: 'sarah.johnson@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      firstName: 'Sarah',
      lastName: 'Johnson',
      isEmailVerified: true,
      profile: {
        bio: 'UI/UX designer with 8 years of experience in creating beautiful user experiences.',
        description: 'Creative designer focused on user-centered design',
        title: 'swapper',
        interests: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research'],
        location: 'New York, NY',
        website: 'https://sarahjohnson.design',
        socialMedia: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: 'https://twitter.com/sarahjohnson'
        },
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      email: 'mike.chen@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      firstName: 'Mike',
      lastName: 'Chen',
      isEmailVerified: true,
      profile: {
        bio: 'Data scientist and machine learning enthusiast. Love sharing knowledge about AI.',
        description: 'Data scientist with expertise in Python and machine learning',
        title: 'both',
        interests: ['Data Science', 'Machine Learning', 'Python', 'Statistics'],
        location: 'Boston, MA',
        website: 'https://mikechen.ai',
        socialMedia: {
          linkedin: 'https://linkedin.com/in/mikechen',
          github: 'https://github.com/mikechen'
        },
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      email: 'emma.wilson@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      firstName: 'Emma',
      lastName: 'Wilson',
      isEmailVerified: true,
      profile: {
        bio: 'Photography enthusiast and digital marketing specialist.',
        description: 'Creative professional with a passion for visual storytelling',
        title: 'learner',
        interests: ['Photography', 'Digital Marketing', 'Social Media', 'Content Creation'],
        location: 'Los Angeles, CA',
        website: 'https://emmawilson.photo',
        socialMedia: {
          linkedin: 'https://linkedin.com/in/emmawilson',
          instagram: 'https://instagram.com/emmawilson'
        },
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      email: 'david.rodriguez@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      firstName: 'David',
      lastName: 'Rodriguez',
      isEmailVerified: true,
      profile: {
        bio: 'Mobile app developer with expertise in React Native and Flutter.',
        description: 'Mobile development specialist focused on cross-platform solutions',
        title: 'swapper',
        interests: ['Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android'],
        location: 'Austin, TX',
        website: 'https://davidrodriguez.dev',
        socialMedia: {
          linkedin: 'https://linkedin.com/in/davidrodriguez',
          github: 'https://github.com/davidrodriguez'
        },
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

// Create speakers (these are just user references, no separate speaker collection needed)
const createSpeakers = async (users) => {
  console.log('Speakers are users - no separate speaker collection needed');
  // Return the users who will be speakers (skip demo user)
  return users.slice(1); // Return all users except the demo user
};

// Create skill stations
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
      requirements: ['Basic design knowledge'],
      difficulty: 'All Levels',
      duration: 75
    },
    {
      name: 'Data Science Lab',
      description: 'Explore data analysis and machine learning',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter'],
      location: 'Lab Room - Station D',
      capacity: 8,
      equipment: ['High-performance laptops', 'Datasets'],
      requirements: ['Python basics'],
      difficulty: 'Intermediate',
      duration: 120
    },
    {
      name: 'Digital Marketing Hub',
      description: 'Learn modern digital marketing strategies',
      skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
      location: 'Conference Room - Station E',
      capacity: 20,
      equipment: ['Marketing tools', 'Analytics platforms'],
      requirements: ['Basic marketing knowledge'],
      difficulty: 'All Levels',
      duration: 90
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
    { name: 'Technology', description: 'Tech-related events and workshops' },
    { name: 'Arts & Culture', description: 'Creative and cultural events' },
    { name: 'Food & Wine', description: 'Culinary experiences and tastings' },
    { name: 'Music & Arts', description: 'Musical performances and art exhibitions' },
    { name: 'Comedy', description: 'Stand-up comedy and entertainment' },
    { name: 'Education', description: 'Learning and educational workshops' },
    { name: 'Film & Cinema', description: 'Movie screenings and film discussions' },
    { name: 'Fitness', description: 'Health and fitness activities' },
    { name: 'Business', description: 'Professional development and networking' },
    { name: 'Gardening', description: 'Plant care and gardening techniques' },
    { name: 'Performing Arts', description: 'Theater, dance, and live performances' },
    { name: 'Food & Drink', description: 'Culinary experiences and beverage tastings' },
    { name: 'Environment', description: 'Sustainability and environmental awareness' },
    { name: 'Music', description: 'Musical performances and concerts' },
    { name: 'Automotive', description: 'Cars, motorcycles, and automotive events' },
    { name: 'Digital Arts', description: 'Digital art creation and animation' },
    { name: 'Wellness', description: 'Health, wellness, and mindfulness' },
    { name: 'Adventure', description: 'Outdoor activities and adventures' },
    { name: 'Photography', description: 'Photography techniques and workshops' }
  ];

  const createdCategories = await Category.insertMany(categories);
  console.log(`Created ${createdCategories.length} categories`);
  return createdCategories;
};

// Create events
const createEvents = async (speakers, skillStations, categories) => {
  console.log('Creating events...');
  const events = [
    {
      id: '1',
      name: 'Tech Innovation Summit 2024',
      address: 'San Francisco, CA',
      date: 'March 15, 2024',
      time: '9:00 AM - 6:00 PM',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&crop=center',
      description: 'Join us for an exciting technology showcase featuring the latest innovations in AI, blockchain, and emerging technologies. Network with industry leaders and discover cutting-edge solutions that are shaping the future of technology.',
      eventType: 'Technology',
      price: 'Free',
      duration: '9 hours',
      capacity: '500',
      expectedParticipants: '360',
      ageRestriction: 'All ages welcome',
      organizer: speakers[0]._id, // Use first speaker as organizer
      venue: 'Moscone Center, San Francisco',
      speakers: [speakers[0]._id, speakers[1]._id, speakers[2]._id], // These are now user IDs
      agenda: [
        '9:00 AM - Registration & Welcome Coffee',
        '10:00 AM - Keynote: The Future of AI',
        '11:30 AM - Blockchain Revolution Panel',
        '1:00 PM - Lunch & Networking',
        '2:30 PM - Startup Showcase',
        '4:00 PM - Emerging Tech Trends',
        '5:30 PM - Closing Remarks & Networking'
      ],
      skillStations: [skillStations[0]._id, skillStations[1]._id],
      howItWorks: 'Explore different stations and sessions throughout the event. Share what you know, discover new techniques, and practice alongside others in a supportive environment. Each space focuses on a unique aspect of learning and creation, giving you the chance to participate, teach, or simply enjoy the experience.'
    },
    {
      id: '2',
      name: 'Art & Culture Festival',
      address: 'New York, NY',
      date: 'March 22, 2024',
      time: '10:00 AM - 8:00 PM',
      thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center',
      description: 'Experience the vibrant world of contemporary art and cultural expression. This festival brings together artists, performers, and art enthusiasts for a day of creativity, inspiration, and cultural exchange.',
      eventType: 'Arts & Culture',
      price: '$25',
      duration: '10 hours',
      capacity: '300',
      expectedParticipants: '220',
      ageRestriction: 'All ages welcome',
      organizer: speakers[1]._id, // Use first speaker as organizer
      venue: 'Central Park, New York',
      speakers: [speakers[1]._id, speakers[3]._id], // These are now user IDs
      agenda: [
        '10:00 AM - Festival Opening & Welcome',
        '11:00 AM - Artist Panel Discussion',
        '12:30 PM - Interactive Art Workshops',
        '2:00 PM - Live Performances',
        '4:00 PM - Gallery Walk & Artist Meet & Greet',
        '6:00 PM - Closing Ceremony & Awards',
        '7:00 PM - Networking Reception'
      ],
      skillStations: [skillStations[0]._id, skillStations[2]._id, skillStations[4]._id],
      howItWorks: 'Explore different stations and sessions throughout the event. Share what you know, discover new techniques, and practice alongside others in a supportive environment. Each space focuses on a unique aspect of learning and creation, giving you the chance to participate, teach, or simply enjoy the experience.'
    },
    {
      id: '3',
      name: 'Data Science Workshop',
      address: 'Boston, MA',
      date: 'March 28, 2024',
      time: '10:00 AM - 4:00 PM',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
      description: 'Learn data science fundamentals and machine learning techniques from industry experts. Hands-on workshops and real-world projects to enhance your analytical skills.',
      eventType: 'Education',
      price: '$120',
      duration: '6 hours',
      capacity: '50',
      expectedParticipants: '35',
      ageRestriction: '18+ only',
      organizer: speakers[2]._id, // Use first speaker as organizer
      venue: 'MIT Campus, Boston',
      speakers: [speakers[2]._id, speakers[0]._id], // These are now user IDs
      agenda: [
        '10:00 AM - Introduction to Data Science',
        '11:00 AM - Python for Data Analysis',
        '12:30 PM - Lunch Break',
        '1:30 PM - Machine Learning Basics',
        '3:00 PM - Hands-on Project',
        '4:00 PM - Q&A and Networking'
      ],
      skillStations: [skillStations[3]._id, skillStations[0]._id],
      howItWorks: 'Explore different stations and sessions throughout the event. Share what you know, discover new techniques, and practice alongside others in a supportive environment. Each space focuses on a unique aspect of learning and creation, giving you the chance to participate, teach, or simply enjoy the experience.'
    }
  ];

  const createdEvents = await Event.insertMany(events);
  console.log(`Created ${createdEvents.length} events`);
  return createdEvents;
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await clearAllData();
    
    const users = await createUsers();
    const speakers = await createSpeakers(users);
    const skillStations = await createSkillStations();
    const categories = await createCategories();
    const events = await createEvents(speakers, skillStations, categories);
    
    console.log('\n✅ Data repopulation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Speakers: ${speakers.length}`);
    console.log(`   - Skill Stations: ${skillStations.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Events: ${events.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during data repopulation:', error);
    process.exit(1);
  }
};

main();
