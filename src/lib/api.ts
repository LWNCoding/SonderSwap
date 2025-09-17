import { EventDetailData, EventCategory } from '../types';
import { API_CONFIG } from './constants';

// Abstract API client with error handling
class ApiClient {
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Events API
  async getEvents(): Promise<EventDetailData[]> {
    return this.request<EventDetailData[]>('/events');
  }

  async getEventById(id: string | number): Promise<EventDetailData | null> {
    try {
      return await this.request<EventDetailData>(`/events/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getEventsByType(eventType: string): Promise<EventDetailData[]> {
    return this.request<EventDetailData[]>(`/events/search/${eventType}`);
  }

  async searchEvents(query: string): Promise<EventDetailData[]> {
    return this.request<EventDetailData[]>(`/events/search/${query}`);
  }

  // Categories API
  async getEventCategories(): Promise<EventCategory[]> {
    return this.request<EventCategory[]>('/categories');
  }

  async getEventsByCategory(categoryTitle: string): Promise<EventDetailData[]> {
    return this.request<EventDetailData[]>(`/categories/${categoryTitle}/events`);
  }

  // Event Participation
  async joinEvent(eventId: string, token: string): Promise<{ message: string; participantCount: number; capacity: number }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join event');
    }

    return response.json();
  }

  async leaveEvent(eventId: string, token: string): Promise<{ message: string; participantCount: number }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/leave`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave event');
    }

    return response.json();
  }

  async getEventParticipants(eventId: string): Promise<{ participants: any[]; count: number }> {
    // Add cache-busting parameter to prevent stale data
    const cacheBuster = Date.now();
    const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/participants?t=${cacheBuster}`, {
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getParticipationStatus(eventId: string, token: string): Promise<{ isParticipating: boolean; participantCount: number; capacity: number }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/participation-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get participation status');
    }

    return response.json();
  }

  // Statistics
  async getEventStats(): Promise<{
    totalEvents: number;
    eventTypes: number;
    totalCategories: number;
    eventTypeList: string[];
  }> {
    const [events, categories] = await Promise.all([
      this.getEvents(),
      this.getEventCategories()
    ]);
    
    const eventTypes = [...new Set(events.map(event => event.eventType))];
    
    return {
      totalEvents: events.length,
      eventTypes: eventTypes.length,
      totalCategories: categories.length,
      eventTypeList: eventTypes
    };
  }

  async updateEvent(eventId: string, eventData: Partial<EventDetailData>, token: string): Promise<{ message: string; event: EventDetailData }> {
    console.log('Debug - API updateEvent called with:');
    console.log('Debug - eventId:', eventId);
    console.log('Debug - token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('Debug - eventData:', eventData);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    console.log('Debug - Response status:', response.status);
    console.log('Debug - Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.json();
      console.log('Debug - Error response:', error);
      throw new Error(error.error || 'Failed to update event');
    }

    return response.json();
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export individual functions for backward compatibility
export const getEvents = () => apiClient.getEvents();
export const getEventById = (id: string | number) => apiClient.getEventById(id);
export const getEventsByType = (eventType: string) => apiClient.getEventsByType(eventType);
export const searchEvents = (query: string) => apiClient.searchEvents(query);
export const getEventCategories = () => apiClient.getEventCategories();
export const getEventsByCategory = (categoryTitle: string) => apiClient.getEventsByCategory(categoryTitle);
export const getEventStats = () => apiClient.getEventStats();

// Event participation functions
export const joinEvent = (eventId: string, token: string) => apiClient.joinEvent(eventId, token);
export const leaveEvent = (eventId: string, token: string) => apiClient.leaveEvent(eventId, token);
export const getEventParticipants = (eventId: string) => apiClient.getEventParticipants(eventId);

export const removeEventParticipant = async (eventId: string, userId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/participants/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to remove participant');
  }
};
export const getParticipationStatus = (eventId: string, token: string) => apiClient.getParticipationStatus(eventId, token);
export const updateEvent = (eventId: string, eventData: Partial<EventDetailData>, token: string) => apiClient.updateEvent(eventId, eventData, token);

// Export the client for advanced usage
export { apiClient };