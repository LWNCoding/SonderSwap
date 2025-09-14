import { useAsync } from './useAsync';
import { getEventCategories, getEventsByCategory } from '../lib/api';
import { EventCategory, EventDetailData } from '../types';

interface EventsData {
  categories: EventCategory[];
  eventsByCategory: Record<string, EventDetailData[]>;
}

interface UseEventsReturn {
  categories: EventCategory[];
  eventsByCategory: Record<string, EventDetailData[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEvents = (): UseEventsReturn => {
  const { data, loading, error, refetch } = useAsync<EventsData>(
    async () => {
      const categoriesData = await getEventCategories();
      
      // Load events for each category
      const eventsData: Record<string, EventDetailData[]> = {};
      for (const category of categoriesData) {
        const events = await getEventsByCategory(category.title);
        eventsData[category.title] = events;
      }
      
      return {
        categories: categoriesData,
        eventsByCategory: eventsData,
      };
    },
    []
  );

  return {
    categories: data?.categories || [],
    eventsByCategory: data?.eventsByCategory || {},
    loading,
    error,
    refetch,
  };
};
