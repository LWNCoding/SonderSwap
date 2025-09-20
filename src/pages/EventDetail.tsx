import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { typography } from '../lib/typography';
import { useEvent } from '../hooks/useEvent';
import { useEventParticipation } from '../hooks/useEventParticipation';
import { useEventParticipants } from '../hooks/useEventParticipants';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { LAYOUT, GRADIENTS, ANIMATION, LOADING_STATES, CAROUSEL } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { SkillStation, User } from '../types';

// Constants
const DETAIL_PAGE_LAYOUT = {
  GRID_COLS: 'grid-cols-1 lg:grid-cols-2',
  GRID_COLS_3: 'grid-cols-1 lg:grid-cols-3',
  IMAGE_SIZE: 'w-full h-64 lg:h-96',
} as const;

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = useEvent(eventId);
  const { isAuthenticated, user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  
  // Carousel state
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cardHeight, setCardHeight] = useState<number>(384); // Default height
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Get participant count (public - no auth required)
  const { 
    participantCount,
    updateCount
  } = useEventParticipants(eventId);

  // Calculate maximum card height for uniformity
  useEffect(() => {
    if (event?.skillStations && cardRefs.current.length > 0) {
      // Small delay to ensure cards are fully rendered
      const timeoutId = setTimeout(() => {
        const heights = cardRefs.current
          .filter(ref => ref !== null)
          .map(ref => ref!.offsetHeight);
        
        if (heights.length > 0) {
          const maxHeight = Math.max(...heights);
          setCardHeight(maxHeight);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [event?.skillStations]);
  
  // Debug participant count
  console.log('EventDetail: Current participantCount:', participantCount);
  
  // Get participation status (auth required)
  const { 
    isParticipating, 
    joinEvent, 
    leaveEvent 
  } = useEventParticipation(eventId, {
    onParticipationChange: updateCount
  });

  // Check if current user is the organizer
  const isOrganizer = () => {
    if (!user || !event || !event.organizer) return false;
    
    // Handle both string ID and populated User object
    const organizerId = typeof event.organizer === 'string' 
      ? event.organizer 
      : event.organizer._id;
    
    return user._id === organizerId;
  };

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      // User is not logged in, show login modal
      setIsAuthModalOpen(true);
      return;
    }

    if (isParticipating) {
      // User is already participating, leave the event
      try {
        setIsJoining(true);
        await leaveEvent();
      } catch (error) {
        console.error('Failed to leave event:', error);
        alert('Failed to leave event. Please try again.');
      } finally {
        setIsJoining(false);
      }
    } else {
      // User is not participating, join the event
      try {
        setIsJoining(true);
        await joinEvent();
      } catch (error) {
        console.error('Failed to join event:', error);
        alert('Failed to join event. Please try again.');
      } finally {
        setIsJoining(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message={LOADING_STATES.EVENT} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <Link 
            to="/current-events" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Render helpers
  const renderBackButton = (): JSX.Element => (
    <Link 
      to="/current-events" 
      className={`inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors ${typography.navLink}`}
    >
      <Icon name="arrowLeft" size="md" className="mr-2" />
      Back to Events
    </Link>
  );

  const renderEventImage = (): JSX.Element => (
    <div className="order-2 lg:order-1">
      <img
        src={event.thumbnail}
        alt={event.name}
        className={`${DETAIL_PAGE_LAYOUT.IMAGE_SIZE} object-cover rounded-lg shadow-lg`}
      />
    </div>
  );

  const renderEventTags = (): JSX.Element => (
    <div className="flex flex-wrap gap-4">
      <Badge label={event.eventType} variant="primary" />
      <Badge label={event.price} variant="success" />
      <Badge label={event.duration} variant="info" />
    </div>
  );

  const renderEventInfo = (): JSX.Element => (
    <div className="order-1 lg:order-2">
      <h1 className={`${typography.h1} text-gray-900 mb-4`}>
        {event.name}
      </h1>
      
      <div className="space-y-3 mb-6">
        {[
          { icon: "location", text: event.address },
          { icon: "calendar", text: event.date },
          { icon: "clock", text: event.time },
        ].map((item, index) => (
          <div key={index} className="flex items-center text-gray-600">
            <Icon name={item.icon} size="md" className="mr-3 text-primary-600" />
            <span className={`${typography.bodySmall} text-gray-600`}>{item.text}</span>
          </div>
        ))}
        
        {/* Organizer Information */}
        {event.organizer && (
          <div className="flex items-center text-gray-600 pt-2 border-t border-gray-200">
            <Icon name="user" size="md" className="mr-3 text-primary-600" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                {typeof event.organizer === 'string' 
                  ? event.organizer.charAt(0).toUpperCase()
                  : `${(event.organizer as User).firstName?.charAt(0) || 'U'}${(event.organizer as User).lastName?.charAt(0) || 'U'}`
                }
              </div>
              <div>
                {typeof event.organizer === 'string' ? (
                  <span className={`${typography.bodySmall} text-gray-600`}>
                    {event.organizer}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(`/user/${(event.organizer as User)._id}?returnTo=/event/${eventId}`)}
                    className={`${typography.bodySmall} text-primary-600 hover:text-primary-800 hover:underline transition-colors`}
                  >
                    {(event.organizer as User).firstName || 'Unknown'} {(event.organizer as User).lastName || 'User'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {isOrganizer() ? (
          // Show dashboard button for organizers
          <button 
            onClick={() => navigate(`/event/${event.id}/dashboard`)}
            className={`w-full px-6 py-3 rounded-lg font-semibold ${typography.button} transition-all ${ANIMATION.TRANSITION_DURATION} ${GRADIENTS.PRIMARY_SECONDARY} ${GRADIENTS.BUTTON_HOVER} text-white ${ANIMATION.HOVER_SCALE}`}
          >
            <div className="flex items-center justify-center">
              <Icon name="settings" size="md" className="mr-2" />
              Event View Dashboard
            </div>
          </button>
        ) : (
          // Show join/leave button for participants
          <button 
            onClick={handleJoinEvent}
            disabled={isJoining}
            className={`w-full px-6 py-3 rounded-lg font-semibold ${typography.button} transition-all ${ANIMATION.TRANSITION_DURATION} ${
              isParticipating 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : isAuthenticated 
                  ? `${GRADIENTS.PRIMARY_SECONDARY} ${GRADIENTS.BUTTON_HOVER} text-white ${ANIMATION.HOVER_SCALE}`
                  : `${GRADIENTS.PRIMARY_SECONDARY} ${GRADIENTS.BUTTON_HOVER} text-white ${ANIMATION.HOVER_SCALE}`
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isJoining ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isParticipating ? 'Leaving...' : 'Joining...'}
              </div>
            ) : isParticipating ? (
              <div className="flex items-center justify-center">
                <Icon name="close" size="md" className="mr-2" />
                Leave Event
              </div>
            ) : isAuthenticated ? (
              'Join Skill-Sharing Event'
            ) : (
              'Login to Join Event'
            )}
          </button>
        )}
        
        <button className={`w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-semibold ${typography.button} transition-all duration-300`}>
          View Interactive Venue Map
        </button>
      </div>
    </div>
  );

  // Carousel utility functions
  const SKILL_STATIONS_PER_PAGE = 1; // Show one skill station per page for better readability
  
  const getTotalPages = (stationsCount: number): number => {
    return Math.ceil(stationsCount / SKILL_STATIONS_PER_PAGE);
  };

  const clearScrollTimeout = (): void => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  const scrollToPage = (page: number): void => {
    const container = containerRef.current;
    if (!container) return;

    clearScrollTimeout();
    
    // Calculate scroll position for one card per page with fixed width (320px + 16px margin)
    const cardWidth = 320 + 16; // w-80 (320px) + margin
    const scrollPosition = page * cardWidth;
    container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    
    setCurrentPage(page);
    
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
    }, CAROUSEL.SCROLL_TIMEOUT);
  };

  const handlePreviousPage = (): void => {
    if (currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNextPage = (stationsLength: number): void => {
    const totalPages = getTotalPages(stationsLength);
    if (currentPage < totalPages - 1) {
      scrollToPage(currentPage + 1);
    }
  };

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

  const renderPageIndicator = (stationsLength: number): JSX.Element => {
    const totalPages = getTotalPages(stationsLength);
    if (totalPages <= 1) return <></>;

    return (
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => scrollToPage(index)}
            className={`${CAROUSEL.INDICATOR_WIDTH} h-2 rounded-full transition-all ${ANIMATION.TRANSITION_DURATION} ${
              currentPage === index 
                ? 'bg-primary-600' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderMainContent = (): JSX.Element => (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${typography.h2} text-gray-900`}>Skill-Sharing Event Overview</h2>
          <button
            onClick={() => setIsHowItWorksOpen(true)}
            className={`w-6 h-6 ${GRADIENTS.PRIMARY_SECONDARY} hover:opacity-80 rounded-full flex items-center justify-center transition-all`}
            title="How It Works"
          >
            <Icon name="info" size="sm" className="text-white" />
          </button>
        </div>
        <p className={`${typography.body} text-gray-600 leading-relaxed`}>
          {event.description}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className={`${typography.h2} text-gray-900 mb-4`}>Venue Skill Stations</h2>
        
        <div className="relative group">
          {renderNavigationButton(
            'left',
            handlePreviousPage,
            currentPage === 0,
            'left-0 top-1/2 -translate-y-1/2'
          )}

          {renderNavigationButton(
            'right',
            () => handleNextPage(event.skillStations.length),
            currentPage >= getTotalPages(event.skillStations.length) - 1,
            'right-0 top-1/2 -translate-y-1/2'
          )}

          <div
            ref={containerRef}
            className="flex overflow-x-auto pb-4 scroll-smooth w-full"
          >
            {event.skillStations.map((station, index) => {
              // Handle both populated objects and string IDs
              const stationData = typeof station === 'string' ? null : station as SkillStation;
              const stationName = stationData?.name || 'Skill Station';
              const stationSkills = stationData?.skills?.join(', ') || 'Various Skills';
              const stationLocation = stationData?.location || 'TBD';
              const stationCapacity = stationData?.capacity;
              const stationDuration = stationData?.duration;
              const stationDifficulty = stationData?.difficulty;

              return (
                <div 
                  key={index} 
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="flex-shrink-0 w-80 cursor-pointer relative" 
                  style={{
                    margin: '0 8px',
                    height: cardHeight
                  }}
                >
                  <div className="relative bg-white rounded-lg overflow-hidden transition-all hover:shadow-xl shadow-lg border border-gray-200 hover:border-primary-300 w-full h-full">
                    <div className="p-6 h-full flex flex-col">
                      {/* Header with title and difficulty */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className={`${typography.h3} text-gray-900 flex-1`}>{stationName}</h3>
                        {stationDifficulty && (
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ml-2 ${
                            stationDifficulty === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                            stationDifficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            stationDifficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stationDifficulty}
                          </span>
                        )}
                      </div>

                      {/* Main content area - takes up available space */}
                      <div className="space-y-3 flex-1">
                        <p className={`${typography.body} text-gray-600`}>
                          <strong>Skills:</strong> {stationSkills}
                        </p>
                        <p className={`${typography.body} text-gray-600`}>
                          <strong>Location:</strong> {stationLocation}
                        </p>
                        <div className="space-y-1">
                          {stationCapacity && (
                            <p className={`${typography.small} text-gray-600`}>
                              <strong>Capacity:</strong> {stationCapacity} people
                            </p>
                          )}
                          {stationDuration && (
                            <p className={`${typography.small} text-gray-600`}>
                              <strong>Duration:</strong> {stationDuration} min
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Leader Information - always at bottom */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {stationData?.leader ? (
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                              {stationData.leader?.firstName?.charAt(0) || 'U'}{stationData.leader?.lastName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className={`${typography.small} text-gray-500`}>Station Leader</p>
                              <button
                                onClick={() => navigate(`/user/${stationData.leader?._id}?returnTo=/event/${eventId}`)}
                                className={`${typography.bodySmall} text-primary-600 hover:text-primary-800 hover:underline transition-colors`}
                              >
                                {stationData.leader?.firstName || 'Unknown'} {stationData.leader?.lastName || 'User'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                              ?
                            </div>
                            <div className="flex-1">
                              <p className={`${typography.small} text-gray-500`}>Station Leader</p>
                              <p className={`${typography.bodySmall} text-gray-400`}>No leader assigned</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {renderPageIndicator(event.skillStations.length)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className={`${typography.h2} text-gray-900 mb-4`}>Event Schedule</h2>
        <div className="space-y-3">
          {event.agenda.map((item, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                {index + 1}
              </div>
              <span className={`${typography.bodySmall} text-gray-700`}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSidebar = (): JSX.Element => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className={`${typography.h2} text-gray-900 mb-4`}>Event Details</h2>
        <div className="space-y-3">
          {[
            { label: 'Venue', value: event.venue },
            { label: 'Capacity', value: event.capacity },
            { label: 'Age', value: event.ageRestriction },
          ].map((detail, index) => (
            <div key={index}>
              <span className={`${typography.bodySmall} font-medium text-gray-500`}>{detail.label}:</span>
              <p className={`${typography.bodySmall} text-gray-700`}>{detail.label === 'Capacity' ? `${detail.value} people` : detail.value}</p>
            </div>
          ))}
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className={`${typography.h2} text-gray-900 mb-4`}>Quick Stats</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className={`${typography.small} text-gray-600`}>Skill Stations</span>
            <span className={`${typography.bodySmall} font-semibold text-primary-600`}>{event.skillStations.length}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className={`${typography.small} text-gray-600`}>Current Participants</span>
              <span className={`${typography.bodySmall} font-semibold text-primary-600`}>{participantCount}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className={`${typography.small} text-gray-600`}>Skill Categories</span>
            <span className={`${typography.bodySmall} font-semibold text-primary-600`}>
              {event.skillStations.reduce((total, station) => {
                if (typeof station === 'string') return total;
                return total + ((station as SkillStation).skills?.length || 0);
              }, 0)}+
            </span>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className={`min-h-screen ${GRADIENTS.BACKGROUND}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-white via-primary-50 to-secondary-50 ${LAYOUT.HEADER_PADDING}`}>
        <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING}`}>
          {/* Back button and tags row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {renderBackButton()}
            {renderEventTags()}
          </div>
          
          <div className={`grid ${DETAIL_PAGE_LAYOUT.GRID_COLS} gap-8`}>
            {renderEventImage()}
            {renderEventInfo()}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        <div className={`grid ${DETAIL_PAGE_LAYOUT.GRID_COLS_3} gap-8`}>
          {renderMainContent()}
          {renderSidebar()}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* How It Works Modal */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${typography.h3} text-gray-900`}>How It Works</h3>
                <button
                  onClick={() => setIsHowItWorksOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon name="close" size="md" />
                </button>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className={`${typography.body} text-purple-800 leading-relaxed`}>
                  {event.howItWorks}
                </p>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsHowItWorksOpen(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;