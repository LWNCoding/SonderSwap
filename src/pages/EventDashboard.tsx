import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { typography } from '../lib/typography';
import { useEvent } from '../hooks/useEvent';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Icon from '../components/Icon';
import ParticipantsList from '../components/ParticipantsList';
import ManageParticipantsModal from '../components/ManageParticipantsModal';
import EditEventModal from '../components/EditEventModal';
import { LAYOUT, GRADIENTS, LOADING_STATES } from '../lib/constants';
import { getEventParticipants, updateEvent } from '../lib/api';
import { authService } from '../lib/authService';

const EventDashboard: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = useEvent(eventId);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isManageParticipantsOpen, setIsManageParticipantsOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);

  // Fetch participant count and participants list
  const fetchParticipantCount = async () => {
    if (!eventId) return;
    try {
      const data = await getEventParticipants(eventId);
      setParticipantCount(data.count);
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Failed to fetch participant count:', error);
    }
  };

  // Handle event update
  const handleUpdateEvent = async (updatedEventData: any) => {
    if (!eventId) return;
    
    try {
      const token = authService.getToken();
      console.log('EventDashboard: Token from authService:', token);
      console.log('EventDashboard: Is authenticated:', authService.isAuthenticated());
      console.log('EventDashboard: Current user:', authService.getCurrentUser());
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('EventDashboard: Calling updateEvent with token:', token.substring(0, 20) + '...');
      await updateEvent(eventId, updatedEventData, token);
      
      // Refresh the event data
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  };

  // Update participant count when event loads
  useEffect(() => {
    if (event) {
      setParticipantCount(event.participantCount || 0);
      fetchParticipantCount(); // Get fresh count
    }
  }, [event, eventId]);

  // Set up periodic refresh of participant count (every 30 seconds)
  useEffect(() => {
    if (!eventId) return;
    
    const interval = setInterval(fetchParticipantCount, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  // Check if current user is the organizer after event is loaded
  useEffect(() => {
    if (event && user && event.organizer) {
      const organizerId = typeof event.organizer === 'string' 
        ? event.organizer 
        : event.organizer._id;
      
      const userIsOrganizer = user._id === organizerId;
      
      if (!userIsOrganizer) {
        // Redirect to event detail page if not authorized
        navigate(`/event/${eventId}`, { replace: true });
        return;
      }
    } else if (event && !event.organizer) {
      // If event has no organizer, redirect to event detail page
      navigate(`/event/${eventId}`, { replace: true });
      return;
    }
  }, [event, user, eventId, navigate]);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/event/${eventId}`, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, eventId]);

  // Show loading while event is loading or auth is loading
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message={LOADING_STATES.EVENT} />
      </div>
    );
  }

  // If not authenticated, show loading (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message={LOADING_STATES.EVENT} />
      </div>
    );
  }

  // Show error if event not found
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
            <Icon name="arrowLeft" size="md" className="mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen ${GRADIENTS.BACKGROUND}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-white via-primary-50 to-secondary-50 ${LAYOUT.HEADER_PADDING}`}>
        <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING}`}>
          {/* Back button */}
          <div className="mb-6">
            <Link 
              to={`/event/${eventId}`} 
              className={`inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors ${typography.navLink}`}
            >
              <Icon name="arrowLeft" size="md" className="mr-2" />
              Back to Event
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className={`${typography.h1} text-gray-900 mb-4`}>
              Event Dashboard
            </h1>
            <h2 className={`${typography.h2} text-gray-700 mb-2`}>
              {event.name}
            </h2>
            <p className={`${typography.body} text-gray-600`}>
              Manage your event, track participants, and monitor activity
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className={`${typography.h3} text-gray-900 mb-4`}>Event Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="calendar" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600`}>Date & Time</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900`}>
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="location" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600`}>Venue</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900`}>
                        {event.venue}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="users" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600`}>Capacity</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900`}>
                        {event.capacity} people
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="dollar" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600`}>Price</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900`}>
                        {event.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${typography.h3} text-gray-900`}>Participants</h3>
                <div className="flex items-center space-x-2">
                  <span className={`${typography.small} text-gray-500`}>
                    {participantCount} registered
                  </span>
                  <button
                    onClick={() => setIsManageParticipantsOpen(true)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Manage participants"
                  >
                    <Icon name="settings" size="sm" />
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <ParticipantsList
                  participants={participants}
                  maxHeight="max-h-64"
                  showEditIcon={false}
                />
              </div>
            </div>

            {/* Event Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className={`${typography.h3} text-gray-900 mb-4`}>Analytics</h3>
              <div className="text-center py-8">
                <Icon name="chart" size="xl" className="text-gray-400 mx-auto mb-4" />
                <p className={`${typography.body} text-gray-600 mb-4`}>
                  Event analytics coming soon
                </p>
                <p className={`${typography.small} text-gray-500`}>
                  Track attendance, engagement, and event performance metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className={`${typography.h3} text-gray-900 mb-4`}>Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsEditEventOpen(true)}
                  className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Icon name="edit" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700`}>Edit Event Details</span>
                  </div>
                </button>
                <button 
                  onClick={() => setIsManageParticipantsOpen(true)}
                  className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Icon name="users" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700`}>Manage Participants</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Icon name="message" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700`}>Send Announcements</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Icon name="chart" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700`}>View Reports</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Event Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className={`${typography.h3} text-gray-900 mb-4`}>Event Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`${typography.small} text-gray-600`}>Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${typography.small} text-gray-600`}>Participants</span>
                  <span className={`${typography.bodySmall} font-semibold text-gray-900`}>
                    {participantCount} / {event.capacity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${typography.small} text-gray-600`}>Registration</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    Open
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Participants Modal */}
      <ManageParticipantsModal
        isOpen={isManageParticipantsOpen}
        onClose={() => setIsManageParticipantsOpen(false)}
        eventId={eventId || ''}
        eventName={event?.name || ''}
        onEditParticipant={(participant) => {
          console.log('Edit participant:', participant);
          // TODO: Implement participant editing functionality
        }}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={isEditEventOpen}
        onClose={() => setIsEditEventOpen(false)}
        event={event}
        onSave={handleUpdateEvent}
      />
    </div>
  );
};

export default EventDashboard;
