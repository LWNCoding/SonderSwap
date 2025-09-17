import React, { useState } from 'react';
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
  onRemove?: (participant: Participant) => void;
  maxHeight?: string;
  showEditIcon?: boolean;
  removing?: string | null;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  onEdit,
  onRemove,
  maxHeight = 'max-h-64',
  showEditIcon = true,
  removing
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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

  const handleEditClick = (participant: Participant, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === participant.userId ? null : participant.userId);
  };

  const handleRemoveClick = (participant: Participant) => {
    if (onRemove) {
      onRemove(participant);
    }
    setOpenDropdown(null);
  };

  const handleOutsideClick = () => {
    setOpenDropdown(null);
  };

  return (
    <div 
      className={`overflow-y-auto ${maxHeight} space-y-2`}
      onClick={handleOutsideClick}
    >
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

            {/* Edit Icon with Dropdown */}
            {showEditIcon && (onEdit || onRemove) && (
              <div className="relative">
                <button
                  onClick={(e) => handleEditClick(participant, e)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Manage participant"
                >
                  <Icon name="edit" size="sm" />
                </button>
                
                {/* Dropdown Menu */}
                {openDropdown === participant.userId && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {onRemove && (
                        <button
                          onClick={() => handleRemoveClick(participant)}
                          disabled={removing === participant.userId}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {removing === participant.userId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Icon name="trash" size="sm" />
                          )}
                          <span>{removing === participant.userId ? 'Removing...' : 'Remove from Event'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ParticipantsList;

