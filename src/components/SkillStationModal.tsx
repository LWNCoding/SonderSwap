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
  const [editingStation, setEditingStation] = useState<SkillStationWithLeader | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SkillStationWithLeader>>({});
  const [deleteConfirmStation, setDeleteConfirmStation] = useState<SkillStationWithLeader | null>(null);

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
    setEditingStation(station);
    setEditFormData({
      name: station.name,
      description: station.description,
      location: station.location,
      capacity: station.capacity,
      duration: station.duration,
      difficulty: station.difficulty,
      skills: [...station.skills],
      equipment: [...(station.equipment || [])],
      requirements: [...(station.requirements || [])],
      isActive: station.isActive,
      leaderId: station.leaderId
    });
  };

  const handleEditFormChange = (field: keyof SkillStationWithLeader, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveStation = () => {
    if (!editingStation) return;

    const updatedStation: SkillStationWithLeader = {
      ...editingStation,
      ...editFormData,
      leader: editFormData.leaderId ? availableUsers.find(u => u._id === editFormData.leaderId) : undefined
    };

    setStations(prev => 
      prev.map(station => 
        station._id === editingStation._id ? updatedStation : station
      )
    );

    setEditingStation(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingStation(null);
    setEditFormData({});
  };

  const handleDeleteStation = (station: SkillStationWithLeader) => {
    setDeleteConfirmStation(station);
  };

  const confirmDeleteStation = () => {
    if (!deleteConfirmStation) return;
    
    setStations(prev => prev.filter(station => station._id !== deleteConfirmStation._id));
    setDeleteConfirmStation(null);
    
    // If the deleted station was expanded, close it
    if (expandedStation === deleteConfirmStation._id) {
      setExpandedStation(null);
    }
  };

  const cancelDeleteStation = () => {
    setDeleteConfirmStation(null);
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
                    {editingStation && editingStation._id === station._id ? (
                      /* Editing Form */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                Station Name
                              </label>
                              <input
                                type="text"
                                value={editFormData.name || ''}
                                onChange={(e) => handleEditFormChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                            
                            <div>
                              <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                Description
                              </label>
                              <textarea
                                value={editFormData.description || ''}
                                onChange={(e) => handleEditFormChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>

                            <div>
                              <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                Location
                              </label>
                              <input
                                type="text"
                                value={editFormData.location || ''}
                                onChange={(e) => handleEditFormChange('location', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                  Capacity
                                </label>
                                <input
                                  type="number"
                                  value={editFormData.capacity || ''}
                                  onChange={(e) => handleEditFormChange('capacity', parseInt(e.target.value) || 0)}
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                              </div>
                              <div>
                                <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                  Duration (min)
                                </label>
                                <input
                                  type="number"
                                  value={editFormData.duration || ''}
                                  onChange={(e) => handleEditFormChange('duration', parseInt(e.target.value) || 0)}
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                              </div>
                              <div>
                                <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                  Difficulty
                                </label>
                                <select
                                  value={editFormData.difficulty || 'All Levels'}
                                  onChange={(e) => handleEditFormChange('difficulty', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                  <option value="All Levels">All Levels</option>
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                Station Leader
                              </label>
                              <select
                                value={editFormData.leaderId || ''}
                                onChange={(e) => handleEditFormChange('leaderId', e.target.value)}
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
                                value={editFormData.isActive ? 'active' : 'inactive'}
                                onChange={(e) => handleEditFormChange('isActive', e.target.value === 'active')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                onClick={handleSaveStation}
                                variant="primary"
                                size="sm"
                                className="flex-1"
                              >
                                <Icon name="check" size="sm" className="mr-2" />
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Icon name="close" size="sm" className="mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                          <div className="grid grid-cols-3 gap-4">
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
                            <div>
                              <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                                Difficulty
                              </label>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                station.difficulty === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                                station.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                station.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {station.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

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

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEditStation(station)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Icon name="edit" size="sm" className="mr-2" />
                              Edit Details
                            </Button>
                            <Button
                              onClick={() => handleDeleteStation(station)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                            >
                              <Icon name="trash" size="sm" className="mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <Icon name="alertTriangle" size="md" className="text-red-600" />
                </div>
                <h3 className={`${typography.h3} text-gray-900`}>Delete Skill Station</h3>
              </div>
              
              <p className={`${typography.body} text-gray-600 mb-6`}>
                Are you sure you want to delete <strong>"{deleteConfirmStation.name}"</strong>? 
                This action cannot be undone and will remove the station from this event.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={cancelDeleteStation}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteStation}
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Icon name="trash" size="sm" className="mr-2" />
                  Delete Station
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillStationModal;
