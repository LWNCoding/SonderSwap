import { useState, useEffect } from 'react';
import { useAsync } from './useAsync';
import { joinEvent, leaveEvent, getEventParticipants, getParticipationStatus } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../lib/authService';

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
}

interface UseEventParticipationReturn {
  participants: Participant[];
  participantCount: number;
  isParticipating: boolean;
  capacity: number;
  loading: boolean;
  error: string | null;
  joinEvent: () => Promise<void>;
  leaveEvent: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useEventParticipation = (eventId: string | undefined): UseEventParticipationReturn => {
  const { isAuthenticated } = useAuth();
  const [isParticipating, setIsParticipating] = useState(false);
  const [capacity, setCapacity] = useState(0);

  // Load participants data
  const { data: participantsData, loading: participantsLoading, error: participantsError, refetch: refetchParticipants } = useAsync(
    async () => {
      if (!eventId) return { participants: [], count: 0 };
      return getEventParticipants(eventId);
    },
    [eventId]
  );

  // Load participation status for authenticated users
  const { data: statusData, loading: statusLoading, error: statusError, refetch: refetchStatus } = useAsync(
    async () => {
      const token = authService.getToken();
      if (!eventId || !isAuthenticated || !token) return { isParticipating: false, participantCount: 0, capacity: 0 };
      return getParticipationStatus(eventId, token);
    },
    [eventId, isAuthenticated]
  );

  // Update local state when data changes
  useEffect(() => {
    if (statusData) {
      setIsParticipating(statusData.isParticipating);
      setCapacity(statusData.capacity);
    }
  }, [statusData]);

  const handleJoinEvent = async () => {
    const token = authService.getToken();
    if (!eventId || !token) return;
    
    try {
      const result = await joinEvent(eventId, token);
      setIsParticipating(true);
      setCapacity(result.capacity);
      // Refetch participants to update the list
      await refetchParticipants();
    } catch (error) {
      console.error('Failed to join event:', error);
      throw error;
    }
  };

  const handleLeaveEvent = async () => {
    const token = authService.getToken();
    if (!eventId || !token) return;
    
    try {
      await leaveEvent(eventId, token);
      setIsParticipating(false);
      // Refetch participants to update the list
      await refetchParticipants();
    } catch (error) {
      console.error('Failed to leave event:', error);
      throw error;
    }
  };

  const refetch = async () => {
    await Promise.all([refetchParticipants(), refetchStatus()]);
  };

  return {
    participants: participantsData?.participants || [],
    participantCount: participantsData?.count || 0,
    isParticipating,
    capacity,
    loading: participantsLoading || statusLoading,
    error: participantsError || statusError,
    joinEvent: handleJoinEvent,
    leaveEvent: handleLeaveEvent,
    refetch,
  };
};
