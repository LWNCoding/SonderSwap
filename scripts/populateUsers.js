import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/database.js';

// User Schema (same as in User.ts)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  profile: {
    bio: String,
    interests: [String],
    location: String,
    website: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Dummy users data
const dummyUsers = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    profile: {
      bio: 'Event enthusiast and tech lover',
      interests: ['Technology', 'Music', 'Art'],
      location: 'San Francisco, CA',
      website: 'https://johndoe.com'
    }
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    profile: {
      bio: 'Creative professional and community builder',
      interests: ['Arts & Culture', 'Food & Wine', 'Wellness'],
      location: 'New York, NY',
      website: 'https://janesmith.com'
    }
  },
  {
    email: 'mike.johnson@example.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Johnson',
    profile: {
      bio: 'Fitness trainer and adventure seeker',
      interests: ['Fitness', 'Adventure', 'Photography'],
      location: 'Denver, CO',
      website: 'https://mikejohnson.com'
    }
  },
  {
    email: 'sarah.wilson@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Wilson',
    profile: {
      bio: 'Digital artist and workshop facilitator',
      interests: ['Digital Arts', 'Education', 'Comedy'],
      location: 'Austin, TX',
      website: 'https://sarahwilson.com'
    }
  },
  {
    email: 'alex.chen@example.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Chen',
    profile: {
      bio: 'Startup founder and innovation enthusiast',
      interests: ['Business', 'Technology', 'Film & Cinema'],
      location: 'Seattle, WA',
      website: 'https://alexchen.com'
    }
  },
  {
    email: 'demo@sonderswap.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    profile: {
      bio: 'Demo account for testing SonderSwap features',
      interests: ['All Categories'],
      location: 'Fairfax, VA',
      website: 'https://sonderswap.com'
    }
  }
];

const populateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.connectionString);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true,
        lastLogin: new Date()
      });

      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log(`\n✅ Successfully created ${dummyUsers.length} dummy users!`);
    console.log('\n📧 Test Accounts:');
    dummyUsers.forEach(user => {
      console.log(`   Email: ${user.email} | Password: ${user.password}`);
    });

  } catch (error) {
    console.error('Error populating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

populateUsers();
