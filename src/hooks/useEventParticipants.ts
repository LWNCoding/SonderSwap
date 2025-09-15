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
        console.log('Fetching participants for event:', eventId);
        const result = await getEventParticipants(eventId);
        console.log('Participants fetched:', result);
        return result;
      } catch (error) {
        console.warn('Failed to fetch participants:', error);
        return { participants: [], count: 0 };
      }
    },
    [eventId]
  );

  // Wrap refetch to add debugging
  const wrappedRefetch = async () => {
    console.log('Refetching participants for event:', eventId);
    await refetch();
  };

  return {
    participants: participantsData?.participants || [],
    participantCount: participantsData?.count || 0,
    loading,
    error,
    refetch: wrappedRefetch,
  };
};