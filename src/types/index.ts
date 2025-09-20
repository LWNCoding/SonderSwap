// Common UI Types
export interface LayoutProps {
  children?: React.ReactNode;
}

export interface NavItem {
  label: string;
  href: string;
}

// Event Types
export interface Event {
  id: number;
  name: string;
  address: string;
  thumbnail: string;
  date: string;
}

export interface EventCategory {
  title: string;
  events: number[]; // Just IDs - carousel will fetch full data
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: React.ReactNode;
}

export interface NavbarProps {
  items: NavItem[];
}

// Page State Types
export interface PageState {
  [key: number]: number;
}

export interface ContainerRefs {
  [key: number]: HTMLDivElement | null;
}

export interface TimeoutRefs {
  [key: number]: ReturnType<typeof setTimeout> | null;
}

// Speaker Types
export interface Speaker {
  _id: string;
  name: string;
  bio: string;
  expertise: string[];
  profileImage?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Skill Station Types
export interface SkillStation {
  _id: string;
  name: string;
  description: string;
  skills: string[];
  location: string;
  capacity: number;
  equipment?: string[];
  requirements?: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Participant Types
export interface Participant {
  _id: string;
  eventId: string;
  userId: string;
  skillStationId?: string;
  status: 'registered' | 'attended' | 'completed' | 'cancelled';
  checkInTime?: string;
  checkOutTime?: string;
  feedback?: {
    rating: number;
    comment?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Event Detail Types (Updated)
export interface EventDetailData {
  _id: string;
  id: string; // Keep for backward compatibility
  name: string;
  address: string;
  date: string;
  time: string;
  thumbnail: string;
  description: string;
  eventType: string;
  price: string;
  duration: string;
  capacity: string;
  expectedParticipants?: string;
  ageRestriction: string;
  organizer: string | User; // Can be string ID or populated User object
  venue: string;
  speakers: (string | Speaker)[]; // Array of Speaker IDs or populated Speaker objects
  agenda: string[];
  skillStations: (string | SkillStation)[]; // Array of SkillStation IDs or populated SkillStation objects
  howItWorks: string;
  // Populated fields (when using populate)
  populatedSpeakers?: Speaker[];
  populatedSkillStations?: SkillStation[];
  participantCount?: number;
  // Form-specific fields for EditEventModal
  startTime?: string;
  endTime?: string;
}

// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  profile: {
    bio?: string;
    description?: string;
    title: 'learner' | 'swapper' | 'both';
    interests?: string[];
    location?: string;
    website?: string;
    phone?: string;
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
    profileImage?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}