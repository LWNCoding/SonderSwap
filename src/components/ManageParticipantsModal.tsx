import React, { useState, useEffect } from 'react';
import { typography } from '../lib/typography';
import Icon from './Icon';
import ParticipantsList from './ParticipantsList';
import { getEventParticipants, removeEventParticipant } from '../lib/api';

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
  profileImage?: string;
}

interface ManageParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  token: string;
  onEditParticipant?: (participant: Participant) => void;
}

const ManageParticipantsModal: React.FC<ManageParticipantsModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  token,
  onEditParticipant
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Fetch participants when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetchParticipants();
    }
  }, [isOpen, eventId]);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEventParticipants(eventId);
      setParticipants(data.participants || []);
    } catch (err) {
      setError('Failed to load participants');
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditParticipant = (participant: Participant) => {
    if (onEditParticipant) {
      onEditParticipant(participant);
    }
  };

  const handleRefresh = () => {
    fetchParticipants();
  };

  const handleRemoveParticipant = async (participant: Participant) => {
    if (!window.confirm(`Are you sure you want to remove ${participant.firstName} ${participant.lastName} from this event?`)) {
      return;
    }

    setRemoving(participant.userId);
    try {
      await removeEventParticipant(eventId, participant.userId, token);
      
      // Remove participant from local state
      setParticipants(prev => prev.filter(p => p.userId !== participant.userId));
      
      // Show success message briefly
      setError(null);
    } catch (err) {
      setError(`Failed to remove ${participant.firstName} ${participant.lastName}`);
      console.error('Error removing participant:', err);
    } finally {
      setRemoving(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-700/20 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className={`${typography.h2} text-gray-900 dark:text-white dark:text-white`}>
              Manage Participants
            </h2>
            <p className={`${typography.bodySmall} text-gray-600 dark:text-gray-300 mt-1`}>
              {eventName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh participants"
            >
              <Icon name="refresh" size="sm" className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Icon name="alertCircle" size="lg" className="mx-auto mb-2 text-red-500" />
              <p className={`${typography.bodySmall} text-red-600 mb-4`}>{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className={`${typography.h3} text-primary-600`}>{participants.length}</p>
                    <p className={`${typography.caption} text-primary-700`}>Total Participants</p>
                  </div>
                  <div className="text-center">
                    <p className={`${typography.h3} text-secondary-600`}>
                      {participants.filter(p => new Date(p.joinedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                    </p>
                    <p className={`${typography.caption} text-secondary-700`}>Joined Today</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`${typography.caption} text-gray-600 dark:text-gray-300`}>Last updated</p>
                  <p className={`${typography.small} text-gray-500 dark:text-gray-400`}>
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Participants List */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className={`${typography.h4} text-gray-900 dark:text-white mb-4`}>Participants</h3>
                <ParticipantsList
                  participants={participants}
                  onEdit={handleEditParticipant}
                  onRemove={handleRemoveParticipant}
                  maxHeight="max-h-96"
                  showEditIcon={true}
                  removing={removing}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <p className={`${typography.caption} text-gray-500 dark:text-gray-400`}>
            {participants.length} participant{participants.length !== 1 ? 's' : ''} registered
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageParticipantsModal;

