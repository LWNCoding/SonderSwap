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
import SkillStationModal from '../components/SkillStationModal';
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
  const [isSkillStationModalOpen, setIsSkillStationModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!eventId) return;
    
    setIsDeleting(true);
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      // Redirect to current events page after successful deletion
      navigate('/current-events');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Handle event update
  const handleUpdateEvent = async (updatedEventData: any) => {
    if (!eventId) return;
    
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Debug - Updating event with data:', updatedEventData);
      console.log('Debug - Current user:', user);
      console.log('Debug - Event organizer:', event?.organizer);
      console.log('Debug - Token retrieved:', token ? 'Yes' : 'No');
      console.log('Debug - Token length:', token ? token.length : 0);
      
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
      
      console.log('Debug - User ID:', user._id);
      console.log('Debug - Organizer ID:', organizerId);
      console.log('Debug - User ID type:', typeof user._id);
      console.log('Debug - Organizer ID type:', typeof organizerId);
      console.log('Debug - IDs match:', user._id === organizerId);
      
      const userIsOrganizer = user._id === organizerId;
      
      if (!userIsOrganizer) {
        console.log('Debug - User is not organizer, redirecting...');
        // Redirect to event detail page if not authorized
        navigate(`/event/${eventId}`, { replace: true });
        return;
      } else {
        console.log('Debug - User is organizer, access granted');
      }
    } else if (event && !event.organizer) {
      console.log('Debug - Event has no organizer, redirecting...');
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message={LOADING_STATES.EVENT} />
      </div>
    );
  }

  // If not authenticated, show loading (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message={LOADING_STATES.EVENT} />
      </div>
    );
  }

  // Show error if event not found
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white mb-4">Event Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <Link 
            to="/current-events" 
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <Icon name="arrowLeft" size="md" className="mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen ${GRADIENTS.BACKGROUND} dark:bg-gray-900`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-white via-primary-50 to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 ${LAYOUT.HEADER_PADDING}`}>
        <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING}`}>
          {/* Back button */}
          <div className="mb-6">
            <Link 
              to={`/event/${eventId}`} 
              className={`inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors ${typography.navLink}`}
            >
              <Icon name="arrowLeft" size="md" className="mr-2" />
              Back to Event
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className={`${typography.h1} text-gray-900 dark:text-white dark:text-white mb-4`}>
              Event Dashboard
            </h1>
            <h2 className={`${typography.h2} text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2`}>
              {event.name}
            </h2>
            <p className={`${typography.body} text-gray-600 dark:text-gray-300 dark:text-gray-300`}>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/20 p-6">
              <h3 className={`${typography.h3} text-gray-900 dark:text-white dark:text-white mb-4`}>Event Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="calendar" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600 dark:text-gray-300`}>Date & Time</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900 dark:text-white`}>
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="location" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600 dark:text-gray-300`}>Address</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900 dark:text-white`}>
                        {event.address}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="users" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600 dark:text-gray-300`}>Capacity</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900 dark:text-white`}>
                        {event.capacity} people
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="dollar" size="md" className="text-primary-600 mr-3" />
                    <div>
                      <p className={`${typography.small} text-gray-600 dark:text-gray-300`}>Price</p>
                      <p className={`${typography.bodySmall} font-semibold text-gray-900 dark:text-white`}>
                        {event.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${typography.h3} text-gray-900 dark:text-white`}>Participants</h3>
                <div className="flex items-center space-x-2">
                  <span className={`${typography.small} text-gray-500 dark:text-gray-400`}>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/20 p-6">
              <h3 className={`${typography.h3} text-gray-900 dark:text-white mb-4`}>Analytics</h3>
              <div className="text-center py-8">
                <Icon name="chart" size="xl" className="text-gray-400 mx-auto mb-4" />
                <p className={`${typography.body} text-gray-600 dark:text-gray-300 mb-4`}>
                  Event analytics coming soon
                </p>
                <p className={`${typography.small} text-gray-500 dark:text-gray-400`}>
                  Track attendance, engagement, and event performance metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/20 p-6">
              <h3 className={`${typography.h3} text-gray-900 dark:text-white mb-4`}>Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsEditEventOpen(true)}
                  className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Icon name="edit" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700 dark:text-gray-300`}>Edit Event Details</span>
                  </div>
                </button>
                <button 
                  onClick={() => setIsManageParticipantsOpen(true)}
                  className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Icon name="users" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700 dark:text-gray-300`}>Manage Participants</span>
                  </div>
                </button>
                <button 
                  onClick={() => setIsSkillStationModalOpen(true)}
                  className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Icon name="settings" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700 dark:text-gray-300`}>Edit Event Stations</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Icon name="message" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700 dark:text-gray-300`}>Send Announcements</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Icon name="chart" size="md" className="text-primary-600 mr-3" />
                    <span className={`${typography.bodySmall} text-gray-700 dark:text-gray-300`}>View Reports</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Event Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/20 p-6">
              <h3 className={`${typography.h3} text-gray-900 dark:text-white mb-4`}>Event Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`${typography.small} text-gray-600 dark:text-gray-300`}>Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${typography.small} text-gray-600 dark:text-gray-300`}>Participants</span>
                  <span className={`${typography.bodySmall} font-semibold text-gray-900 dark:text-white`}>
                    {participantCount} / {event.capacity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${typography.small} text-gray-600 dark:text-gray-300`}>Registration</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    Open
                  </span>
                </div>
              </div>
            </div>

            {/* Delete Event */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/20 p-6 border-l-4 border-red-200">
              <h3 className={`${typography.h3} text-gray-900 dark:text-white mb-4`}>Danger Zone</h3>
              <div className="space-y-3">
                <p className={`${typography.small} text-gray-600 dark:text-gray-300`}>
                  Once you delete an event, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={isDeleting}
                  className="w-full p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center">
                    <Icon name="trash" size="md" className="text-red-600 mr-3" />
                    <span className={`${typography.bodySmall} font-medium`}>
                      {isDeleting ? 'Deleting...' : 'Delete Event'}
                    </span>
                  </div>
                </button>
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
        token={authService.getToken() || ''}
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

      {/* Skill Station Modal */}
      <SkillStationModal
        isOpen={isSkillStationModalOpen}
        onClose={() => setIsSkillStationModalOpen(false)}
        eventId={eventId || ''}
        onSave={async (updatedStations) => {
          // TODO: Implement API call to save skill stations
          console.log('Saving skill stations:', updatedStations);
        }}
      />

      {/* Delete Event Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <Icon name="alertCircle" size="lg" className="text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className={`${typography.h3} text-gray-900 dark:text-white`}>
                    Delete Event
                  </h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className={`${typography.body} text-gray-600 dark:text-gray-300 mb-2`}>
                  Are you sure you want to delete <strong>"{event?.name}"</strong>?
                </p>
                <p className={`${typography.small} text-gray-500 dark:text-gray-400`}>
                  This action cannot be undone. All event data, participants, and skill stations will be permanently deleted.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDashboard;
