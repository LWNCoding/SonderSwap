import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { typography } from '../lib/typography';
import { useEvents } from '../hooks/useEvents';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CAROUSEL, LAYOUT, GRADIENTS, SIZES, SPACING, ANIMATION, LOADING_STATES } from '../lib/constants';
import { PageState, ContainerRefs, TimeoutRefs, EventDetailData, EventCategory } from '../types';

const CurrentEvents: React.FC = () => {
  // State and refs
  const [currentPage, setCurrentPage] = useState<PageState>({});
  const containerRefs = useRef<ContainerRefs>({});
  const scrollTimeoutRefs = useRef<TimeoutRefs>({});
  
  // Use custom hook for data fetching
  const { categories, eventsByCategory, loading, error } = useEvents();

  // Utility functions
  const getTotalPages = (eventsCount: number): number => {
    return Math.ceil(eventsCount / CAROUSEL.CARDS_PER_PAGE);
  };

  const clearScrollTimeout = (categoryIndex: number): void => {
    if (scrollTimeoutRefs.current[categoryIndex]) {
      clearTimeout(scrollTimeoutRefs.current[categoryIndex]!);
    }
  };

  // Navigation functions
  const scrollToPage = (categoryIndex: number, page: number): void => {
    const container = containerRefs.current[categoryIndex];
    if (!container) return;

    clearScrollTimeout(categoryIndex);
    
    const scrollPosition = page * CAROUSEL.CARDS_PER_PAGE * (CAROUSEL.CARD_WIDTH + 16); // 16px for margin
    container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    
    setCurrentPage(prev => ({ ...prev, [categoryIndex]: page }));
    
    scrollTimeoutRefs.current[categoryIndex] = setTimeout(() => {
      scrollTimeoutRefs.current[categoryIndex] = null;
    }, CAROUSEL.SCROLL_TIMEOUT);
  };


  // Event handlers
  const handlePreviousPage = (categoryIndex: number): void => {
    const current = currentPage[categoryIndex] || 0;
    if (current > 0) {
      scrollToPage(categoryIndex, current - 1);
    }
  };

  const handleNextPage = (categoryIndex: number, eventsLength: number): void => {
    const current = currentPage[categoryIndex] || 0;
    const totalPages = getTotalPages(eventsLength);
    if (current < totalPages - 1) {
      scrollToPage(categoryIndex, current + 1);
    }
  };

  // Render helpers
  const renderNavigationButton = (
    direction: 'left' | 'right',
    onClick: () => void,
    disabled: boolean,
    className: string
  ): JSX.Element => {
    const iconPath = direction === 'left' 
      ? "M15 19l-7-7 7-7" 
      : "M9 5l7 7-7 7";

    return (
      <button
        className={`absolute ${className} z-20 ${CAROUSEL.BUTTON_SIZE} ${GRADIENTS.BUTTON_BACKGROUND} ${GRADIENTS.BUTTON_BACKGROUND_HOVER} shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${ANIMATION.TRANSITION_DURATION}`}
        onClick={onClick}
        disabled={disabled}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </button>
    );
  };

  const renderEventCard = (event: EventDetailData): JSX.Element => {
    return (
      <div key={event.id} className={`flex-shrink-0 ${SIZES.CARD_WIDTH} cursor-pointer relative`}>
        <Link to={`/event/${event.id}`} className="block">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all ${ANIMATION.TRANSITION_DURATION} hover:shadow-xl shadow-lg dark:shadow-gray-700/20`} style={{margin: '0 8px'}}>
            {/* Thumbnail */}
            <div className={`${SIZES.ASPECT_SQUARE} relative`}>
              <img
                src={event.thumbnail}
                alt={event.name}
                className={`${SIZES.FULL_WIDTH} ${SIZES.FULL_HEIGHT} object-cover`}
              />
              <div className={`absolute inset-0 ${GRADIENTS.CARD_OVERLAY} opacity-0 hover:opacity-100 transition-opacity ${ANIMATION.TRANSITION_DURATION}`} />
            </div>

            {/* Event Info */}
            <div className={`${SPACING.CARD_PADDING} bg-white dark:bg-gray-800`}>
              <h3 className={`${typography.h4} text-gray-900 dark:text-white mb-1 line-clamp-1`}>
                {event.name}
              </h3>
              <p className={`${typography.small} text-gray-600 dark:text-gray-300 line-clamp-1 font-semibold`}>
                {event.address}
              </p>
              <p className={`${typography.caption} ${GRADIENTS.PRIMARY_SECONDARY_TEXT} mt-1 font-bold`}>
                {event.date}
              </p>
              <p className={`${typography.caption} text-gray-500 dark:text-gray-400 mt-1`}>
                {event.time}
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  const renderPageIndicator = (categoryIndex: number, eventsLength: number): JSX.Element => (
    <div className="absolute top-0 right-0 -translate-y-8">
      <div className={`${GRADIENTS.INDICATOR_CONTAINER} backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-primary-200/50`}>
        <div className={`flex ${SPACING.SMALL}`}>
          {Array.from({ length: getTotalPages(eventsLength) }, (_, pageIndex) => (
            <div
              key={pageIndex}
              className={`${CAROUSEL.INDICATOR_WIDTH} ${CAROUSEL.INDICATOR_HEIGHT} transition-all ${ANIMATION.TRANSITION_DURATION} ${
                (currentPage[categoryIndex] || 0) === pageIndex
                  ? GRADIENTS.INDICATOR_ACTIVE
                  : GRADIENTS.INDICATOR_INACTIVE
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategory = (category: EventCategory, categoryIndex: number): JSX.Element => {
    const events = eventsByCategory[category.title] || [];
    
    return (
      <div key={categoryIndex} className={LAYOUT.SECTION_SPACING}>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {category.title}
        </h2>
      
      <div className="relative group">
        {renderNavigationButton(
          'left',
          () => handlePreviousPage(categoryIndex),
          currentPage[categoryIndex] === 0,
          'left-0 top-1/2 -translate-y-1/2'
        )}

        {renderNavigationButton(
          'right',
          () => handleNextPage(categoryIndex, events.length),
          currentPage[categoryIndex] >= getTotalPages(events.length) - 1,
          'right-0 top-1/2 -translate-y-1/2'
        )}

        <div
          ref={(el) => { containerRefs.current[categoryIndex] = el; }}
          id={`scroll-container-${categoryIndex}`}
          className={`flex overflow-x-auto pb-4 scroll-smooth w-full`}
        >
          {events.map((event: EventDetailData) => renderEventCard(event))}
        </div>
        
        {renderPageIndicator(categoryIndex, events.length)}
      </div>
    </div>
    );
  };

  return (
    <div className={`min-h-screen ${GRADIENTS.BACKGROUND} dark:bg-gray-900`}>
      {/* Header */}
      <div className={LAYOUT.HEADER_PADDING}>
        <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING}`}>
          <h1 className={`${typography.h1} mb-4`}>
            <span className={GRADIENTS.PRIMARY_SECONDARY_TEXT}>
              Current Events
            </span>
          </h1>
          <p className={`${typography.body} text-gray-600 dark:text-gray-300 max-w-3xl`}>
            Discover amazing events happening around you
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner message={LOADING_STATES.EVENTS} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Events</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          categories.map(renderCategory)
        )}
      </div>
    </div>
  );
};

export default CurrentEvents;