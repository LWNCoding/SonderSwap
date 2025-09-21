import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { typography } from '../lib/typography';
import { LAYOUT, GRADIENTS } from '../lib/constants';
import { EventDetailData } from '../types';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [participatingEvents, setParticipatingEvents] = useState<EventDetailData[]>([]);
  const [organizingEvents, setOrganizingEvents] = useState<EventDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`${typography.h3} text-gray-900 mb-2`}>{event.name}</h3>
            <p className={`${typography.bodySmall} text-gray-600 mb-3`}>{event.description}</p>
          </div>
          {isOrganizing && (
            <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-semibold rounded-full">
              Organizing
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Icon name="calendar" size="sm" className="mr-2 text-primary-600" />
            <span className={`${typography.small}`}>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Icon name="clock" size="sm" className="mr-2 text-primary-600" />
            <span className={`${typography.small}`}>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Icon name="location" size="sm" className="mr-2 text-primary-600" />
            <span className={`${typography.small}`}>{event.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
              {event.eventType}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              {event.price}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              View Details
            </Button>
            {isOrganizing && (
              <Button
                size="sm"
                onClick={() => navigate(`/event/${event.id}/dashboard`)}
              >
                Manage
              </Button>
            )}
          </div>
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
    </div>
  );
};

export default MyEvents;
