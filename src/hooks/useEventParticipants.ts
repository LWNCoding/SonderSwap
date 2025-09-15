import { useAsync } from './useAsync';
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
}

export const useEventParticipants = (eventId: string | undefined): UseEventParticipantsReturn => {
  // Load participants data (public - no auth required)
  const { data: participantsData, loading, error, refetch } = useAsync(
    async () => {
      if (!eventId) return { participants: [], count: 0 };
      try {
        return await getEventParticipants(eventId);
      } catch (error) {
        console.warn('Failed to fetch participants:', error);
        return { participants: [], count: 0 };
      }
    },
    [eventId]
  );

  return {
    participants: participantsData?.participants || [],
    participantCount: participantsData?.count || 0,
    loading,
    error,
    refetch,
  };
};
