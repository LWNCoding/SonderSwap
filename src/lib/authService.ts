import { API_CONFIG } from './constants';

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

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    this.user = this.getStoredUser();
  }

  // Get stored user from localStorage
  private getStoredUser(): User | null {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }

  // Store auth data in localStorage
  private setAuthData(user: User, token: string) {
    this.user = user;
    this.token = token;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  }

  // Clear auth data
  private clearAuthData() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.user;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.setAuthData(data.user, data.token);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login with URL:', `${API_CONFIG.BASE_URL}/auth/login`);
      console.log('Credentials:', { email: credentials.email, password: '***' });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.setAuthData(data.user, data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    this.clearAuthData();
  }

  // Verify token with server
  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        // Don't clear auth data on any error - let the user stay logged in
        // The token might be valid but the server might be having issues
        console.warn('Token verification failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      // Don't clear auth data on network errors - user might be offline
      return false;
    }
  }

  // Get auth headers for API requests
  getAuthHeaders(): Record<string, string> {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }
}

// Create singleton instance
export const authService = new AuthService();
