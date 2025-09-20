import React, { useState, useEffect } from 'react';
import { typography } from '../lib/typography';
import Icon from './Icon';
import Button from './Button';
import { SkillStation, User } from '../types';

interface SkillStationWithLeader extends SkillStation {
  leader?: User;
  leaderId?: string;
}

interface SkillStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSave: (updatedStations: SkillStationWithLeader[]) => Promise<void>;
}

const SkillStationModal: React.FC<SkillStationModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [stations, setStations] = useState<SkillStationWithLeader[]>([]);
  const [expandedStation, setExpandedStation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    if (isOpen) {
      // Mock skill stations data
      const mockStations: SkillStationWithLeader[] = [
        {
          _id: '1',
          name: 'Woodworking Station',
          description: 'Learn basic woodworking techniques and create small projects',
          skills: ['Woodworking', 'Carpentry', 'Safety'],
          location: 'Workshop A',
          capacity: 8,
          equipment: ['Saw', 'Chisel', 'Sandpaper'],
          requirements: ['Safety glasses', 'Closed-toe shoes'],
          difficulty: 'Beginner',
          duration: 120,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          leader: {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            isEmailVerified: true,
            profile: {
              title: 'both'
            }
          }
        },
        {
          _id: '2',
          name: 'Electronics Lab',
          description: 'Build circuits and learn electronics fundamentals',
          skills: ['Electronics', 'Soldering', 'Circuit Design'],
          location: 'Lab B',
          capacity: 6,
          equipment: ['Soldering iron', 'Multimeter', 'Breadboard'],
          requirements: ['Basic math knowledge'],
          difficulty: 'Intermediate',
          duration: 90,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          leader: {
            _id: 'user2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@example.com',
            isEmailVerified: true,
            profile: {
              title: 'both'
            }
          }
        },
        {
          _id: '3',
          name: '3D Printing Station',
          description: 'Design and print 3D models',
          skills: ['3D Modeling', '3D Printing', 'CAD'],
          location: 'Tech Lab',
          capacity: 4,
          equipment: ['3D Printer', 'Filament', 'Computer'],
          requirements: ['Laptop recommended'],
          difficulty: 'Advanced',
          duration: 180,
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Mock available users
      const mockUsers: User[] = [
        {
          _id: 'user1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          isEmailVerified: true,
          profile: {
            title: 'both'
          }
        },
        {
          _id: 'user2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@example.com',
          isEmailVerified: true,
          profile: {
            title: 'both'
          }
        },
        {
          _id: 'user3',
          firstName: 'Mike',
          lastName: 'Davis',
          email: 'mike@example.com',
          isEmailVerified: true,
          profile: {
            title: 'both'
          }
        },
        {
          _id: 'user4',
          firstName: 'Lisa',
          lastName: 'Wilson',
          email: 'lisa@example.com',
          isEmailVerified: true,
          profile: {
            title: 'both'
          }
        }
      ];

      setStations(mockStations);
      setAvailableUsers(mockUsers);
    }
  }, [isOpen]);

  const handleStationClick = (stationId: string) => {
    setExpandedStation(expandedStation === stationId ? null : stationId);
  };

  const handleEditStation = (station: SkillStationWithLeader) => {
    // TODO: Implement detailed station editing
    console.log('Edit station:', station);
  };

  const handleLeaderChange = (stationId: string, leaderId: string) => {
    const leader = availableUsers.find(user => user._id === leaderId);
    setStations(prev => 
      prev.map(station => 
        station._id === stationId 
          ? { ...station, leader, leaderId: leaderId || undefined }
          : station
      )
    );
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      await onSave(stations);
      onClose();
    } catch (err) {
      setError('Failed to save skill stations');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`${typography.h2} text-gray-900`}>Manage Skill Stations</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="close" size="md" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Stations List */}
          <div className="space-y-4 mb-6">
            {stations.map((station) => (
              <div key={station._id} className="border border-gray-200 rounded-lg">
                {/* Station Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleStationClick(station._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Icon name="settings" size="md" className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${typography.h4} text-gray-900`}>{station.name}</h3>
                        <p className={`${typography.small} text-gray-600`}>{station.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Leader Info */}
                      {station.leader ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-semibold">
                            {getInitials(station.leader.firstName, station.leader.lastName)}
                          </div>
                          <span className={`${typography.small} text-gray-700`}>
                            {station.leader.firstName} {station.leader.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className={`${typography.small} text-gray-500`}>No leader assigned</span>
                      )}
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        station.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {station.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      {/* Expand/Collapse Icon */}
                      <Icon 
                        name={expandedStation === station._id ? "chevronUp" : "chevronDown"} 
                        size="sm" 
                        className="text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Station Details (Collapsible) */}
                {expandedStation === station._id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Station Info */}
                      <div className="space-y-4">
                        <div>
                          <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                            Description
                          </label>
                          <p className={`${typography.bodySmall} text-gray-600`}>{station.description}</p>
                        </div>
                        
                        <div>
                          <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                            Skills
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {station.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                              Capacity
                            </label>
                            <p className={`${typography.bodySmall} text-gray-600`}>{station.capacity} people</p>
                          </div>
                          <div>
                            <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                              Duration
                            </label>
                            <p className={`${typography.bodySmall} text-gray-600`}>{station.duration} min</p>
                          </div>
                        </div>
                      </div>

                      {/* Leader Assignment */}
                      <div className="space-y-4">
                        <div>
                          <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                            Station Leader
                          </label>
                          <select
                            value={station.leaderId || ''}
                            onChange={(e) => handleLeaderChange(station._id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select a leader</option>
                            {availableUsers.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.firstName} {user.lastName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                            Status
                          </label>
                          <select
                            value={station.isActive ? 'active' : 'inactive'}
                            onChange={(e) => {
                              setStations(prev => 
                                prev.map(s => 
                                  s._id === station._id 
                                    ? { ...s, isActive: e.target.value === 'active' }
                                    : s
                                )
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>

                        <Button
                          onClick={() => handleEditStation(station)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Icon name="edit" size="sm" className="mr-2" />
                          Edit Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAll}
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillStationModal;
