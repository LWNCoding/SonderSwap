import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface NavigationState {
  from: string;
  params?: Record<string, string>;
  search?: string;
}

export const useBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<NavigationState[]>([]);

  // Track navigation history
  useEffect(() => {
    const currentState: NavigationState = {
      from: location.pathname,
      params: Object.fromEntries(new URLSearchParams(location.search)),
      search: location.search
    };

    setNavigationHistory(prev => {
      // Don't add duplicate consecutive entries
      const lastEntry = prev[prev.length - 1];
      if (lastEntry && lastEntry.from === currentState.from && lastEntry.search === currentState.search) {
        return prev;
      }
      return [...prev, currentState];
    });
  }, [location.pathname, location.search]);

  const goBack = () => {
    // First, try to use browser history if available
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    
    // Fallback to our tracked history
    if (navigationHistory.length > 1) {
      const previousState = navigationHistory[navigationHistory.length - 2];
      const searchParams = new URLSearchParams(previousState.search || '');
      
      // Reconstruct the previous URL with all parameters
      const previousUrl = previousState.from + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      // Remove the current state from history before navigating
      setNavigationHistory(prev => prev.slice(0, -1));
      
      navigate(previousUrl);
    } else {
      // Final fallback - go to home page
      navigate('/');
    }
  };

  const canGoBack = navigationHistory.length > 1 || window.history.length > 1;

  return {
    goBack,
    canGoBack,
    currentPath: location.pathname,
    currentSearch: location.search
  };
};
