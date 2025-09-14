import { useAsync } from './useAsync';
import { getEventById } from '../lib/api';
import { EventDetailData } from '../types';

interface UseEventReturn {
  event: EventDetailData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEvent = (eventId: string | undefined): UseEventReturn => {
  const { data: event, loading, error, refetch } = useAsync<EventDetailData | null>(
    async () => {
      if (!eventId) return null;
      const eventData = await getEventById(eventId);
      if (!eventData) {
        throw new Error('Event not found');
      }
      return eventData;
    },
    [eventId]
  );

  return {
    event,
    loading,
    error,
    refetch,
  };
};
