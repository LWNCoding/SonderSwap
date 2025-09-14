import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      _id: user._id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      _id: decoded._id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };
  } catch (error) {
    return null;
  }
};

// Register new user
export const registerUser = async (userData) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = new User({
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName
  });

  await user.save();

  // Generate token
  const authUser = {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };

  const token = generateToken(authUser);

  return { user: authUser, token };
};

// Login user
export const loginUser = async (credentials) => {
  // Find user by email
  const user = await User.findOne({ email: credentials.email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(credentials.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const authUser = {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };

  const token = generateToken(authUser);

  return { user: authUser, token };
};

// Get user by ID
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isEmailVerified: user.isEmailVerified || false,
    lastLogin: user.lastLogin,
    profile: user.profile || {
      title: 'learner'
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};
