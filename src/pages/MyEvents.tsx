import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { typography } from '../lib/typography';
import { LAYOUT, GRADIENTS } from '../lib/constants';
import { EventDetailData } from '../types';
import { authService } from '../lib/authService';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [participatingEvents, setParticipatingEvents] = useState<EventDetailData[]>([]);
  const [organizingEvents, setOrganizingEvents] = useState<EventDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [eventToLeave, setEventToLeave] = useState<EventDetailData | null>(null);
  const [leavingEvent, setLeavingEvent] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user's events
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch participating events
        const participatingResponse = await fetch('/api/events/participating', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (participatingResponse.ok) {
          const participatingData = await participatingResponse.json();
          setParticipatingEvents(participatingData.events || []);
        }

        // Fetch organizing events
        const organizingResponse = await fetch('/api/events/organizing', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (organizingResponse.ok) {
          const organizingData = await organizingResponse.json();
          setOrganizingEvents(organizingData.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch user events:', err);
        setError('Failed to load your events');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [isAuthenticated, user]);

  // Handle leaving an event
  const handleLeaveEvent = async (event: EventDetailData) => {
    setEventToLeave(event);
    setShowLeaveConfirmation(true);
  };

  const confirmLeaveEvent = async () => {
    if (!eventToLeave) return;

    try {
      setLeavingEvent(true);
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/events/${eventToLeave.id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to leave event');
      }

      // Remove event from participating events
      setParticipatingEvents(prev => prev.filter(e => e.id !== eventToLeave.id));
      
      setShowLeaveConfirmation(false);
      setEventToLeave(null);
    } catch (err) {
      console.error('Failed to leave event:', err);
      setError('Failed to leave event. Please try again.');
    } finally {
      setLeavingEvent(false);
    }
  };

  const cancelLeaveEvent = () => {
    setShowLeaveConfirmation(false);
    setEventToLeave(null);
  };

  // Show loading spinner while checking auth
  if (authLoading || loading) {
    return (
      <div className={`min-h-screen ${GRADIENTS.BACKGROUND} flex items-center justify-center`}>
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect if not authenticated (this should not be reached due to useEffect, but just in case)
  if (!isAuthenticated) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen ${GRADIENTS.BACKGROUND} flex items-center justify-center`}>
        <div className="text-center">
          <Icon name="alert" size="lg" className="text-red-500 mx-auto mb-4" />
          <h1 className={`${typography.h1} text-gray-900 mb-4`}>Error Loading Events</h1>
          <p className={`${typography.body} text-gray-600 mb-6`}>{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const renderEventCard = (event: EventDetailData, isOrganizing: boolean = false) => (
    <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.thumbnail}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        {isOrganizing && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full shadow-lg">
              Organizing
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className={`${typography.h3} text-gray-900 mb-2 line-clamp-2`}>{event.name}</h3>
          <p className={`${typography.bodySmall} text-gray-600 line-clamp-2`}>{event.description}</p>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Icon name="calendar" size="sm" className="mr-2 text-primary-600 flex-shrink-0" />
            <span className={`${typography.small} truncate`}>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Icon name="clock" size="sm" className="mr-2 text-primary-600 flex-shrink-0" />
            <span className={`${typography.small} truncate`}>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Icon name="location" size="sm" className="mr-2 text-primary-600 flex-shrink-0" />
            <span className={`${typography.small} truncate`}>{event.address}</span>
          </div>
        </div>

        {/* Event Tags */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            {event.eventType}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
            {event.price}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/event/${event.id}`)}
            className="flex-1"
          >
            <Icon name="eye" size="sm" className="mr-1" />
            View Details
          </Button>
          {isOrganizing ? (
            <Button
              size="sm"
              onClick={() => navigate(`/event/${event.id}/dashboard`)}
              className="flex-1"
            >
              <Icon name="settings" size="sm" className="mr-1" />
              Manage
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLeaveEvent(event)}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Icon name="close" size="sm" className="mr-1" />
              Leave Event
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (title: string, description: string, buttonText: string, buttonAction: () => void) => (
    <div className="text-center py-12">
      <Icon name="calendar" size="lg" className="text-gray-400 mx-auto mb-4" />
      <h3 className={`${typography.h3} text-gray-900 mb-2`}>{title}</h3>
      <p className={`${typography.body} text-gray-600 mb-6`}>{description}</p>
      <Button onClick={buttonAction}>
        {buttonText}
      </Button>
    </div>
  );

  return (
    <div className={`min-h-screen ${GRADIENTS.BACKGROUND}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-white via-primary-50 to-secondary-50 ${LAYOUT.HEADER_PADDING}`}>
        <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING}`}>
          <div className="text-center">
            <h1 className={`${typography.h1} text-gray-900 mb-4`}>My Events</h1>
            <p className={`${typography.body} text-gray-600`}>
              Manage your participating and organizing events
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        <div className="space-y-12">
          {/* Participating Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${typography.h2} text-gray-900`}>Events I'm Participating In</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {participatingEvents.length}
              </span>
            </div>
            
            {participatingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participatingEvents.map(event => renderEventCard(event, false))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8">
                {renderEmptyState(
                  "No Participating Events",
                  "You're not currently participating in any events. Discover amazing skill-sharing opportunities!",
                  "Browse Events",
                  () => navigate('/current-events')
                )}
              </div>
            )}
          </section>

          {/* Organizing Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${typography.h2} text-gray-900`}>Events I'm Organizing</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                {organizingEvents.length}
              </span>
            </div>
            
            {organizingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizingEvents.map(event => renderEventCard(event, true))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8">
                {renderEmptyState(
                  "No Organizing Events",
                  "You haven't created any events yet. Share your skills and knowledge with the community!",
                  "Host an Event",
                  () => navigate('/current-events') // For now, redirect to current events. Later this could go to a create event page
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Leave Event Confirmation Modal */}
      {showLeaveConfirmation && eventToLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Icon name="alert" size="lg" className="text-red-600" />
                </div>
                <div>
                  <h3 className={`${typography.h3} text-gray-900`}>Leave Event</h3>
                  <p className={`${typography.bodySmall} text-gray-600`}>Are you sure you want to leave this event?</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className={`${typography.body} font-semibold text-gray-900 mb-1`}>{eventToLeave.name}</h4>
                <p className={`${typography.small} text-gray-600`}>{eventToLeave.date} • {eventToLeave.time}</p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelLeaveEvent}
                  disabled={leavingEvent}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmLeaveEvent}
                  disabled={leavingEvent}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {leavingEvent ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Leaving...
                    </>
                  ) : (
                    <>
                      <Icon name="close" size="sm" className="mr-1" />
                      Leave Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
