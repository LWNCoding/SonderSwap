import { useState, useEffect } from 'react';
import { useAsync } from './useAsync';
import { joinEvent, leaveEvent, getParticipationStatus } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../lib/authService';

interface UseEventParticipationReturn {
  isParticipating: boolean;
  loading: boolean;
  error: string | null;
  joinEvent: () => Promise<void>;
  leaveEvent: () => Promise<void>;
  refetch: () => Promise<void>;
}

interface UseEventParticipationOptions {
  onParticipationChange?: () => void;
}

export const useEventParticipation = (eventId: string | undefined, options?: UseEventParticipationOptions): UseEventParticipationReturn => {
  const { isAuthenticated } = useAuth();
  const [isParticipating, setIsParticipating] = useState(false);

  // Load participation status for authenticated users only
  const { data: statusData, loading: statusLoading, error: statusError, refetch: refetchStatus } = useAsync(
    async () => {
      // Only proceed if we have all required data
      if (!eventId || !isAuthenticated) {
        console.log('Skipping participation status check - not authenticated or no eventId');
        return { isParticipating: false };
      }
      
      const token = authService.getToken();
      if (!token) {
        console.log('Skipping participation status check - no token');
        return { isParticipating: false };
      }
      
      try {
        console.log('Calling participation status API for event:', eventId);
        return await getParticipationStatus(eventId, token);
      } catch (error) {
        // If user is not authenticated or token is invalid, return default values
        console.warn('Participation status check failed:', error);
        return { isParticipating: false };
      }
    },
    [eventId, isAuthenticated]
  );

  // Update local state when data changes
  useEffect(() => {
    if (statusData) {
      setIsParticipating(statusData.isParticipating);
    }
  }, [statusData]);

  const handleJoinEvent = async () => {
    const token = authService.getToken();
    if (!eventId || !token) {
      console.warn('Cannot join event: missing eventId or token');
      return;
    }
    
    try {
      console.log('Joining event:', eventId);
      await joinEvent(eventId, token);
      console.log('Successfully joined event');
      setIsParticipating(true);
      // Refetch participation status
      await refetchStatus();
      // Notify parent component to refresh participant count
      console.log('Calling onParticipationChange callback');
      options?.onParticipationChange?.();
    } catch (error) {
      console.error('Failed to join event:', error);
      throw error;
    }
  };

  const handleLeaveEvent = async () => {
    const token = authService.getToken();
    if (!eventId || !token) {
      console.warn('Cannot leave event: missing eventId or token');
      return;
    }
    
    try {
      console.log('Leaving event:', eventId);
      await leaveEvent(eventId, token);
      console.log('Successfully left event');
      setIsParticipating(false);
      // Refetch participation status
      await refetchStatus();
      // Notify parent component to refresh participant count
      console.log('Calling onParticipationChange callback');
      options?.onParticipationChange?.();
    } catch (error) {
      console.error('Failed to leave event:', error);
      throw error;
    }
  };

  const refetch = async () => {
    await refetchStatus();
  };

  return {
    isParticipating,
    loading: statusLoading,
    error: statusError,
    joinEvent: handleJoinEvent,
    leaveEvent: handleLeaveEvent,
    refetch,
  };
};
