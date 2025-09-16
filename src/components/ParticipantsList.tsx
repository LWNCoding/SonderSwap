import React from 'react';
import { typography } from '../lib/typography';
import Icon from './Icon';

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
  profileImage?: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  onEdit?: (participant: Participant) => void;
  maxHeight?: string;
  showEditIcon?: boolean;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  onEdit,
  maxHeight = 'max-h-64',
  showEditIcon = true
}) => {
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatJoinedDate = (joinedAt: string): string => {
    const date = new Date(joinedAt);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`overflow-y-auto ${maxHeight} space-y-2`}>
      {participants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon name="users" size="lg" className="mx-auto mb-2 text-gray-300" />
          <p className={typography.small}>No participants yet</p>
        </div>
      ) : (
        participants.map((participant) => (
          <div
            key={participant.userId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Profile Picture */}
              <div className="relative">
                {participant.profileImage ? (
                  <img
                    src={participant.profileImage}
                    alt={`${participant.firstName} ${participant.lastName}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-sm">
                    {getInitials(participant.firstName, participant.lastName)}
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Participant Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`${typography.bodySmall} font-semibold text-gray-900 truncate`}>
                  {participant.firstName} {participant.lastName}
                </h4>
                <p className={`${typography.caption} text-gray-500 truncate`}>
                  {participant.email}
                </p>
                <p className={`${typography.caption} text-gray-400`}>
                  Joined {formatJoinedDate(participant.joinedAt)}
                </p>
              </div>
            </div>

            {/* Edit Icon */}
            {showEditIcon && onEdit && (
              <button
                onClick={() => onEdit(participant)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit participant"
              >
                <Icon name="edit" size="sm" />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ParticipantsList;
