import { useState, useEffect, useCallback } from 'react';
import { getEventParticipants } from '../lib/api';

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
}

interface UseEventParticipantsReturn {
  participants: Participant[];
  participantCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateCount: (newCount: number) => void;
}

export const useEventParticipants = (eventId: string | undefined): UseEventParticipantsReturn => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    if (!eventId) {
      setParticipants([]);
      setParticipantCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching participants for event:', eventId);
      const result = await getEventParticipants(eventId);
      console.log('Participants fetched:', result);
      console.log('Setting participant count to:', result.count);
      setParticipants(result.participants || []);
      setParticipantCount(result.count || 0);
      console.log('Participant count state updated to:', result.count);
    } catch (err) {
      console.warn('Failed to fetch participants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch participants');
      setParticipants([]);
      setParticipantCount(0);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Initial fetch
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Refetch function that forces a new fetch
  const refetch = useCallback(async () => {
    console.log('Refetching participants for event:', eventId);
    await fetchParticipants();
  }, [fetchParticipants]);

  // Function to directly update the count
  const updateCount = useCallback((newCount: number) => {
    console.log('Directly updating participant count to:', newCount);
    setParticipantCount(newCount);
  }, []);

  return {
    participants,
    participantCount,
    loading,
    error,
    refetch,
    updateCount,
  };
};