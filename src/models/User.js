import mongoose from 'mongoose';

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
    description: String,
    title: {
      type: String,
      enum: ['learner', 'swapper', 'both'],
      default: 'learner'
    },
    interests: [String],
    location: String,
    website: String,
    phone: String,
    socialMedia: {
      linkedin: String,
      twitter: String,
      github: String
    },
    profileImage: String
  }
}, {
  timestamps: true
});

// Index for faster email lookups
userSchema.index({ email: 1 });

export const User = mongoose.model('User', userSchema);
