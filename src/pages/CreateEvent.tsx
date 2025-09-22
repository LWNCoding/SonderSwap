import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ERROR_MESSAGES, API_CONFIG, LAYOUT } from '../lib/constants';
import { typography } from '../lib/typography';
import { useBackNavigation } from '../hooks/useBackNavigation';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { User } from '../types';

const CreateEvent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { goBack } = useBackNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [leaderLookupErrors, setLeaderLookupErrors] = useState<{[key: number]: string}>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    date: '',
    startTime: '',
    endTime: '',
    thumbnail: '',
    eventType: '',
    price: '',
    capacity: '',
    ageRestriction: 'All ages welcome',
    agenda: [''],
    howItWorks: 'Explore different stations and sessions throughout the event. Share what you know, discover new techniques, and practice alongside others in a supportive environment. Each space focuses on a unique aspect of learning and creation, giving you the chance to participate, teach, or simply enjoy the experience.',
    skillStations: [] as Array<{
      name: string;
      description: string;
      location: string;
      skills: string[];
      skillsRaw: string;
      capacity: number;
      duration: number;
      difficulty: string;
      leaderId?: string;
      leaderEmail?: string;
    }>
  });

  const [timeErrors, setTimeErrors] = useState<{startTime?: string; endTime?: string}>({});

  // Time validation functions
  const isValidTimeFormat = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const formatTo12Hour = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isEndTimeAfterStart = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return true; // Allow empty times
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes > startMinutes;
  };

  const validateTimeInput = (name: string, value: string) => {
    if (!value) {
      setTimeErrors(prev => ({ ...prev, [name]: undefined }));
      return;
    }
    
    if (!isValidTimeFormat(value)) {
      setTimeErrors(prev => ({ ...prev, [name]: 'Invalid time format' }));
      return;
    }
    
    // Check if end time is after start time
    if (name === 'endTime' && formData.startTime) {
      if (!isEndTimeAfterStart(formData.startTime, value)) {
        setTimeErrors(prev => ({ ...prev, [name]: 'End time must be after start time' }));
        return;
      }
    }
    
    setTimeErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Load available users for skill station leaders
  const loadAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      loadAvailableUsers();
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate time inputs
    if (field === 'startTime' || field === 'endTime') {
      validateTimeInput(field, value);
    }
  };

  const handleAgendaChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => i === index ? value : item)
    }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, '']
    }));
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const addSkillStation = () => {
    setFormData(prev => ({
      ...prev,
      skillStations: [...prev.skillStations, {
        name: '',
        description: '',
        location: '',
        skills: [],
        skillsRaw: '',
        capacity: 10,
        duration: 60,
        difficulty: 'All Levels',
        leaderId: '',
        leaderEmail: ''
      }]
    }));
  };

  const removeSkillStation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skillStations: prev.skillStations.filter((_, i) => i !== index)
    }));
  };

  const handleSkillStationChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      skillStations: prev.skillStations.map((station, i) => 
        i === index ? { ...station, [field]: value } : station
      )
    }));
  };

  const handleLeaderEmailLookup = async (index: number, email: string) => {
    if (!email) {
      handleSkillStationChange(index, 'leaderId', '');
      setLeaderLookupErrors(prev => ({ ...prev, [index]: '' }));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          handleSkillStationChange(index, 'leaderId', user._id);
          setLeaderLookupErrors(prev => ({ ...prev, [index]: '' }));
        } else {
          handleSkillStationChange(index, 'leaderId', '');
          setLeaderLookupErrors(prev => ({ ...prev, [index]: 'User not found with this email' }));
        }
      }
    } catch (err) {
      console.error('Error looking up user:', err);
      handleSkillStationChange(index, 'leaderId', '');
      setLeaderLookupErrors(prev => ({ ...prev, [index]: 'Error looking up user' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate time formats
      const startTime = formData.startTime;
      const endTime = formData.endTime;
      
      if (startTime && !isValidTimeFormat(startTime)) {
        setError('Start time must be in valid 24-hour format (e.g., 08:00)');
        return;
      }
      
      if (endTime && !isValidTimeFormat(endTime)) {
        setError('End time must be in valid 24-hour format (e.g., 18:00)');
        return;
      }
      
      // Check if end time is after start time
      if (startTime && endTime && !isEndTimeAfterStart(startTime, endTime)) {
        setError('End time must be after start time');
        return;
      }
      
      // Check for any time validation errors
      if (timeErrors.startTime || timeErrors.endTime) {
        setError('Please fix time validation errors before saving');
        return;
      }

      // Convert 24-hour times to 12-hour format for storage
      const formattedStartTime = formatTo12Hour(startTime);
      const formattedEndTime = formatTo12Hour(endTime);
      
      // Combine start time and end time into the expected format
      const timeRange = formattedStartTime && formattedEndTime 
        ? `${formattedStartTime} - ${formattedEndTime}`
        : '';

      // Filter out empty agenda items
      const filteredAgenda = formData.agenda.filter(item => item.trim() !== '');

      const eventData = {
        ...formData,
        time: timeRange,
        agenda: filteredAgenda,
        // Generate a simple ID for now (in production, this would be handled by the backend)
        id: Date.now().toString()
      };

      // Remove startTime and endTime from the data sent to API
      delete (eventData as any).startTime;
      delete (eventData as any).endTime;

      const response = await fetch(`${API_CONFIG.BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const data = await response.json();
      setSuccessMessage('Event created successfully!');
      
      // Redirect to the new event after a short delay
      setTimeout(() => {
        navigate(`/event/${data.event.id}`);
      }, 2000);

    } catch (err) {
      console.error('Create event error:', err);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.HEADER_PADDING}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <Icon name="arrowLeft" className="w-5 h-5" />
              <span className={typography.body}>Back</span>
            </button>
            <h1 className={`${typography.h1} text-gray-900 dark:text-white dark:text-white`}>Host an Event</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg flex items-center">
            <Icon name="check" className="w-5 h-5 mr-2" />
            <span className={typography.bodySmall}>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg flex items-center">
            <Icon name="alertCircle" className="w-5 h-5 mr-2" />
            <span className={typography.bodySmall}>{error}</span>
          </div>
        )}

        {/* Event Creation Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/20 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name and Address */}
              <div>
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  Event Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div>
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter event address"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Describe your event"
                  required
                />
              </div>

              {/* Date */}
              <div className="md:col-span-2">
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Start and End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      timeErrors.startTime ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  />
                  {timeErrors.startTime && (
                    <p className="text-red-500 text-xs mt-1">{timeErrors.startTime}</p>
                  )}
                </div>
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      timeErrors.endTime ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  />
                  {timeErrors.endTime && (
                    <p className="text-red-500 text-xs mt-1">{timeErrors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Event Type and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                    Event Type *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="conference">Conference</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                    Price *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Free, $25, $50"
                    required
                  />
                </div>
              </div>

              {/* Capacity and Age Restriction */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="50"
                    required
                  />
                </div>
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                    Age Restriction *
                  </label>
                  <select
                    value={formData.ageRestriction}
                    onChange={(e) => handleInputChange('ageRestriction', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="All ages welcome">All ages welcome</option>
                    <option value="13+">13+</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* How It Works */}
              <div className="md:col-span-2">
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  How It Works
                </label>
                <textarea
                  value={formData.howItWorks}
                  onChange={(e) => handleInputChange('howItWorks', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Describe how the event works"
                />
              </div>

              {/* Agenda */}
              <div className="md:col-span-2">
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  Event Agenda
                </label>
                <div className="space-y-2">
                  {formData.agenda.map((item, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleAgendaChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Agenda item ${index + 1}`}
                      />
                      {formData.agenda.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAgendaItem}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    + Add agenda item
                  </button>
                </div>
              </div>

              {/* Skill Stations */}
              <div className="md:col-span-2">
                <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-2`}>
                  Skill Stations (Optional)
                </label>
                <div className="space-y-4">
                  {formData.skillStations?.map((station, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Station Name
                          </label>
                          <input
                            type="text"
                            value={station.name || ''}
                            onChange={(e) => handleSkillStationChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., Web Development"
                          />
                        </div>
                        <div>
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Location
                          </label>
                          <input
                            type="text"
                            value={station.location || ''}
                            onChange={(e) => handleSkillStationChange(index, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., Room A, Lab 1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Description
                          </label>
                          <textarea
                            value={station.description || ''}
                            onChange={(e) => handleSkillStationChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows={2}
                            placeholder="Describe what participants will learn or do"
                          />
                        </div>
                        <div>
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Skills (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={station.skillsRaw || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleSkillStationChange(index, 'skillsRaw', value);
                              handleSkillStationChange(index, 'skills', value.split(',').map(s => s.trim()).filter(s => s.length > 0));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., JavaScript, React, Node.js"
                          />
                        </div>
                        <div>
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Capacity
                          </label>
                          <input
                            type="number"
                            value={station.capacity || ''}
                            onChange={(e) => handleSkillStationChange(index, 'capacity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="1"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={station.duration || ''}
                            onChange={(e) => handleSkillStationChange(index, 'duration', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="1"
                            placeholder="60"
                          />
                        </div>
                        <div>
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Difficulty
                          </label>
                          <select
                            value={station.difficulty || 'All Levels'}
                            onChange={(e) => handleSkillStationChange(index, 'difficulty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="All Levels">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block ${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 mb-1`}>
                            Station Leader Email (Optional)
                          </label>
                          <input
                            type="email"
                            value={station.leaderEmail || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleSkillStationChange(index, 'leaderEmail', value);
                              // Debounce the lookup
                              setTimeout(() => {
                                handleLeaderEmailLookup(index, value);
                              }, 500);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter leader's email address"
                          />
                          {station.leaderId && (
                            <div className="mt-1 text-sm text-green-600">
                              ✓ Leader found: {availableUsers.find(u => u._id === station.leaderId)?.firstName} {availableUsers.find(u => u._id === station.leaderId)?.lastName}
                            </div>
                          )}
                          {leaderLookupErrors[index] && (
                            <div className="mt-1 text-sm text-red-600">
                              {leaderLookupErrors[index]}
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeSkillStation(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            <Icon name="trash" className="w-4 h-4 inline mr-1" />
                            Remove Station
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSkillStation}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 transition-colors bg-white dark:bg-gray-700"
                  >
                    <Icon name="plus" className="w-5 h-5 inline mr-2" />
                    Add Skill Station
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={goBack}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading ? 'Creating Event...' : 'Create Event'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
