import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ERROR_MESSAGES, API_CONFIG, LAYOUT } from '../lib/constants';
import { typography } from '../lib/typography';
import { useBackNavigation } from '../hooks/useBackNavigation';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Icon from '../components/Icon';

const CreateEvent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { goBack } = useBackNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    date: '',
    time: '',
    thumbnail: '',
    eventType: '',
    price: '',
    duration: '',
    capacity: '',
    expectedParticipants: '',
    ageRestriction: 'All ages welcome',
    venue: '',
    agenda: [''],
    howItWorks: 'Explore different stations and sessions throughout the event. Share what you know, discover new techniques, and practice alongside others in a supportive environment. Each space focuses on a unique aspect of learning and creation, giving you the chance to participate, teach, or simply enjoy the experience.'
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Filter out empty agenda items
      const filteredAgenda = formData.agenda.filter(item => item.trim() !== '');

      const eventData = {
        ...formData,
        agenda: filteredAgenda,
        // Generate a simple ID for now (in production, this would be handled by the backend)
        id: Date.now().toString()
      };

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
    <div>
      {/* Header */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.HEADER_PADDING}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Icon name="arrowLeft" className="w-5 h-5" />
              <span className={typography.body}>Back</span>
            </button>
            <h1 className={typography.h1}>Host an Event</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <Icon name="check" className="w-5 h-5 mr-2" />
            <span className={typography.bodySmall}>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <Icon name="alertCircle" className="w-5 h-5 mr-2" />
            <span className={typography.bodySmall}>{error}</span>
          </div>
        )}

        {/* Event Creation Form */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Event Name */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe your event"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter event address"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Event Type and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                      Event Type *
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => handleInputChange('eventType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                      Price *
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Free, $25, $50"
                      required
                    />
                  </div>
                </div>

                {/* Duration and Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="120"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                      Capacity *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                {/* Age Restriction */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Age Restriction *
                  </label>
                  <select
                    value={formData.ageRestriction}
                    onChange={(e) => handleInputChange('ageRestriction', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="All ages welcome">All ages welcome</option>
                    <option value="13+">13+</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Thumbnail */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Community Center, Library"
                  />
                </div>

                {/* Expected Participants */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Expected Participants
                  </label>
                  <input
                    type="number"
                    value={formData.expectedParticipants}
                    onChange={(e) => handleInputChange('expectedParticipants', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="25"
                  />
                </div>

                {/* How It Works */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    How It Works
                  </label>
                  <textarea
                    value={formData.howItWorks}
                    onChange={(e) => handleInputChange('howItWorks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe how the event works"
                  />
                </div>

                {/* Agenda */}
                <div>
                  <label className={`block ${typography.bodySmall} font-medium text-gray-700 mb-2`}>
                    Event Agenda
                  </label>
                  <div className="space-y-2">
                    {formData.agenda.map((item, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleAgendaChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
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
