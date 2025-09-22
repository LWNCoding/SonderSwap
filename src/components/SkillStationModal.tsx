import React, { useState, useEffect } from 'react';
import { typography } from '../lib/typography';
import Icon from './Icon';
import Button from './Button';
import { SkillStation, User } from '../types';

interface SkillStationWithLeader extends SkillStation {
  leader?: User;
  leaderId?: string;
  leaderEmail?: string;
  skillsRaw?: string;
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
  eventId,
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
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newStationData, setNewStationData] = useState<Partial<SkillStationWithLeader>>({
    name: '',
    description: '',
    skills: [],
    skillsRaw: '',
    location: '',
    capacity: 10,
    duration: 60,
    difficulty: 'Beginner' as const,
    leaderId: '',
    leaderEmail: ''
  });
  const [leaderLookupError, setLeaderLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSkillStations();
      loadAvailableUsers();
    }
  }, [isOpen, eventId]);

  const loadSkillStations = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading skill stations for event ID:', eventId);
      const response = await fetch(`/api/events/${eventId}/skill-stations`);
      console.log('Skill stations response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Skill stations API error:', errorText);
        throw new Error(`Failed to load skill stations: ${response.status}`);
      }
      const data = await response.json();
      console.log('Skill stations data:', data);
      setStations(data);
    } catch (err) {
      console.error('Error loading skill stations:', err);
      setError('Failed to load skill stations');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      console.log('Loading available users for leader assignment');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      console.log('Users response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Users API error:', errorText);
        throw new Error(`Failed to load users: ${response.status}`);
      }
      const data = await response.json();
      console.log('Users data:', data);
      setAvailableUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      // Fallback to empty array if users can't be loaded
      setAvailableUsers([]);
    }
  };

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
      skillsRaw: station.skills.join(', '),
      equipment: [...(station.equipment || [])],
      requirements: [...(station.requirements || [])],
      isActive: station.isActive,
      leaderId: station.leaderId,
      leaderEmail: station.leaderEmail || station.leader?.email || ''
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

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setNewStationData({
      name: '',
      description: '',
      skills: [],
      skillsRaw: '',
      location: '',
      capacity: 10,
      duration: 60,
      difficulty: 'Beginner' as const,
      leaderId: '',
      leaderEmail: ''
    });
    setLeaderLookupError(null);
  };

  const handleCancelCreate = () => {
    setIsCreatingNew(false);
    setNewStationData({
      name: '',
      description: '',
      skills: [],
      skillsRaw: '',
      location: '',
      capacity: 10,
      duration: 60,
      difficulty: 'Beginner' as const,
      leaderId: '',
      leaderEmail: ''
    });
    setLeaderLookupError(null);
  };

  const handleNewStationChange = (field: string, value: any) => {
    setNewStationData(prev => ({
      ...prev,
      [field]: value
    }));
    setLeaderLookupError(null);
  };

  const handleLeaderEmailLookup = async (email: string) => {
    if (!email) {
      setNewStationData(prev => ({ ...prev, leaderId: '', leader: undefined }));
      setLeaderLookupError(null);
      return;
    }

    try {
      const user = availableUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setNewStationData(prev => ({
          ...prev,
          leaderId: user._id,
          leader: user
        }));
        setLeaderLookupError(null);
      } else {
        setNewStationData(prev => ({ ...prev, leaderId: '', leader: undefined }));
        setLeaderLookupError('No user found with this email address');
      }
    } catch (err) {
      setLeaderLookupError('Error looking up user');
    }
  };

  const handleCreateStation = () => {
    if (!newStationData.name || !newStationData.description || !newStationData.location) {
      setError('Please fill in all required fields');
      return;
    }

    const newStation: SkillStationWithLeader = {
      _id: `temp_${Date.now()}`,
      name: newStationData.name!,
      description: newStationData.description!,
      skills: newStationData.skills || [],
      location: newStationData.location!,
      capacity: newStationData.capacity || 10,
      duration: newStationData.duration || 60,
      difficulty: newStationData.difficulty || 'Beginner',
      leaderId: newStationData.leaderId,
      leader: newStationData.leader,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setStations(prev => [...prev, newStation]);
    setIsCreatingNew(false);
    setNewStationData({
      name: '',
      description: '',
      skills: [],
      skillsRaw: '',
      location: '',
      capacity: 10,
      duration: 60,
      difficulty: 'Beginner' as const,
      leaderId: '',
      leaderEmail: ''
    });
    setLeaderLookupError(null);
  };


  const handleSaveAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/skill-stations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ skillStations: stations })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save skill stations');
      }

      const result = await response.json();
      setStations(result.skillStations);
      await onSave(result.skillStations);
      onClose();
    } catch (err) {
      console.error('Error saving skill stations:', err);
      setError(err instanceof Error ? err.message : 'Failed to save skill stations');
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-700/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`${typography.h2} text-gray-900 dark:text-white dark:text-white`}>Manage Skill Stations</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div key={station._id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                {/* Station Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleStationClick(station._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Icon name="settings" size="md" className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${typography.h4} text-gray-900 dark:text-white`}>{station.name}</h3>
                        <p className={`${typography.small} text-gray-600 dark:text-gray-300`}>{station.location}</p>
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
                        <span className={`${typography.small} text-gray-500 dark:text-gray-400`}>No leader assigned</span>
                      )}
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        station.isActive 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
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
                  <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700">
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

                            <div>
                              <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                                Skills (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={editFormData.skillsRaw || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEditFormData(prev => ({
                                    ...prev,
                                    skillsRaw: value,
                                    skills: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., JavaScript, React, Node.js"
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
                              <label className={`${typography.small} font-medium text-gray-700 dark:text-gray-300 block mb-2`}>
                                Station Leader (Email)
                              </label>
                              <input
                                type="email"
                                value={editFormData.leaderEmail || ''}
                                onChange={(e) => handleEditFormChange('leaderEmail', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter leader's email address"
                              />
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
                            <p className={`${typography.bodySmall} text-gray-600 dark:text-gray-300`}>{station.description}</p>
                          </div>
                          
                          <div>
                            <label className={`${typography.small} font-medium text-gray-700 block mb-2`}>
                              Skills
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {station.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full"
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
                              <p className={`${typography.bodySmall} text-gray-600 dark:text-gray-300`}>{station.capacity} people</p>
                            </div>
                            <div>
                              <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                                Duration
                              </label>
                              <p className={`${typography.bodySmall} text-gray-600 dark:text-gray-300`}>{station.duration} min</p>
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
                            <label className={`${typography.small} font-medium text-gray-700 dark:text-gray-300 block mb-2`}>
                              Station Leader (Email)
                            </label>
                            <input
                              type="email"
                              value={station.leaderEmail || ''}
                              onChange={(e) => {
                                setStations(prev => 
                                  prev.map(s => 
                                    s._id === station._id 
                                      ? { ...s, leaderEmail: e.target.value }
                                      : s
                                  )
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter leader's email address"
                            />
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

          {/* Add New Station Button */}
          <div className="mb-6">
            <Button
              onClick={handleCreateNew}
              variant="outline"
              className="w-full border-dashed border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50 text-gray-600 dark:text-gray-300 hover:text-primary-600"
            >
              <Icon name="plus" size="sm" className="mr-2" />
              Add New Skill Station
            </Button>
          </div>

          {/* New Station Creation Form */}
          {isCreatingNew && (
            <div className="mb-6 p-4 border border-primary-200 rounded-lg bg-primary-50">
              <h3 className={`${typography.h4} text-gray-900 dark:text-white mb-4`}>Create New Skill Station</h3>
              
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                      Station Name *
                    </label>
                    <input
                      type="text"
                      value={newStationData.name || ''}
                      onChange={(e) => handleNewStationChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter station name"
                    />
                  </div>
                  
                  <div>
                    <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                      Location *
                    </label>
                    <input
                      type="text"
                      value={newStationData.location || ''}
                      onChange={(e) => handleNewStationChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Lab A, Room 101"
                    />
                  </div>
                </div>

                <div>
                  <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                    Description *
                  </label>
                  <textarea
                    value={newStationData.description || ''}
                    onChange={(e) => handleNewStationChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe what participants will learn at this station"
                  />
                </div>

                <div>
                  <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newStationData.skillsRaw || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewStationData(prev => ({
                        ...prev,
                        skillsRaw: value,
                        skills: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                {/* Station Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                      Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newStationData.capacity || 10}
                      onChange={(e) => handleNewStationChange('capacity', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newStationData.duration || 60}
                      onChange={(e) => handleNewStationChange('duration', parseInt(e.target.value) || 60)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                      Difficulty
                    </label>
                    <select
                      value={newStationData.difficulty || 'Beginner'}
                      onChange={(e) => handleNewStationChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>

                {/* Leader Assignment */}
                <div>
                  <label className={`${typography.small} font-medium text-gray-700 block mb-1`}>
                    Station Leader (Email)
                  </label>
                  <input
                    type="email"
                    value={newStationData.leaderEmail || ''}
                    onChange={(e) => {
                      const email = e.target.value;
                      handleNewStationChange('leaderEmail', email);
                      handleLeaderEmailLookup(email);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter leader's email address"
                  />
                  {leaderLookupError && (
                    <p className="text-red-600 text-sm mt-1">{leaderLookupError}</p>
                  )}
                  {newStationData.leader && (
                    <div className="mt-2 flex items-center space-x-2 text-green-600">
                      <Icon name="check" size="sm" />
                      <span className="text-sm">
                        {newStationData.leader.firstName} {newStationData.leader.lastName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    onClick={handleCancelCreate}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="close" size="sm" className="mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStation}
                    variant="primary"
                    size="sm"
                  >
                    <Icon name="plus" size="sm" className="mr-2" />
                    Create Station
                  </Button>
                </div>
              </div>
            </div>
          )}

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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-700/20 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                     <Icon name="alertCircle" size="md" className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className={`${typography.h3} text-gray-900 dark:text-white`}>Delete Skill Station</h3>
              </div>
              
              <p className={`${typography.body} text-gray-600 dark:text-gray-300 mb-6`}>
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
