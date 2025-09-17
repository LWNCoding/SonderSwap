import React, { useState, useEffect } from 'react';
import { typography } from '../lib/typography';
import Icon from './Icon';
import Button from './Button';
import { EventDetailData } from '../types';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetailData | null;
  onSave: (updatedEvent: Partial<EventDetailData>) => Promise<void>;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<EventDetailData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sendEmailNotification, setSendEmailNotification] = useState(false);

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      // Convert date format from "December 7, 2025" to "2025-12-07" for HTML date input
      const convertDateForInput = (dateStr: string): string => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch {
          return '';
        }
      };

      // Convert time format from "8:00 AM - 2:00 PM" to separate start time and duration
      const parseTimeRange = (timeStr: string): { startTime: string; duration: string } => {
        if (!timeStr) return { startTime: '', duration: '' };
        try {
          // Extract start time (before the dash)
          const startTime = timeStr.split(' - ')[0];
          
          // Calculate duration from start and end time
          const endTime = timeStr.split(' - ')[1];
          if (startTime && endTime) {
            const start = new Date(`2000-01-01 ${startTime}`);
            const end = new Date(`2000-01-01 ${endTime}`);
            const diffMs = end.getTime() - start.getTime();
            const diffHours = Math.round(diffMs / (1000 * 60 * 60));
            const duration = diffHours > 0 ? `${diffHours} hours` : '';
            return { startTime: startTime.trim(), duration };
          }
          
          return { startTime: startTime.trim(), duration: '' };
        } catch {
          return { startTime: '', duration: '' };
        }
      };
      
      const { startTime, duration } = parseTimeRange(event.time || '');
      
      const initialData = {
        name: event.name || '',
        description: event.description || '',
        date: convertDateForInput(event.date || ''),
        startTime: startTime,
        duration: duration || event.duration || '',
        venue: event.venue || '',
        address: event.address || '',
        price: event.price || '',
        capacity: event.capacity || '',
        eventType: event.eventType || '',
        ageRestriction: event.ageRestriction || '',
        expectedParticipants: event.expectedParticipants || '',
        howItWorks: event.howItWorks || '',
        agenda: event.agenda || []
      };
      
      setFormData(initialData);
    }
  }, [event]);

  // Calculate end time from start time and duration
  const calculateEndTime = (startTime: string, duration: string): string => {
    if (!startTime || !duration) return '';
    
    try {
      // Parse duration (e.g., "2 hours" or "2")
      const hours = parseInt(duration.replace(/\D/g, '')) || 0;
      if (hours === 0) return '';
      
      // Parse start time and add duration
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
      
      // Format end time in 12-hour format
      const endHours = end.getHours();
      const endMinutes = end.getMinutes().toString().padStart(2, '0');
      const ampm = endHours >= 12 ? 'PM' : 'AM';
      const displayHours = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;
      
      return `${displayHours}:${endMinutes} ${ampm}`;
    } catch {
      return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Calculate end time when start time or duration changes
      if (name === 'startTime' || name === 'duration') {
        const startTime = name === 'startTime' ? value : (prev.startTime || '');
        const duration = name === 'duration' ? value : (prev.duration || '');
        const endTime = calculateEndTime(startTime, duration);
        (newData as any).endTime = endTime;
      }
      
      return newData;
    });
  };


  const handleAgendaChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda?.map((item, i) => i === index ? value : item) || []
    }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...(prev.agenda || []), '']
    }));
  };

  const removeAgendaItem = (index: number) => {
    const item = formData.agenda?.[index];
    if (item && item.trim()) {
      // If item has content, ask for confirmation
      if (window.confirm(`Remove agenda item: "${item}"?`)) {
        setFormData(prev => ({
          ...prev,
          agenda: prev.agenda?.filter((_, i) => i !== index) || []
        }));
      }
    } else {
      // If item is empty, remove without confirmation
      setFormData(prev => ({
        ...prev,
        agenda: prev.agenda?.filter((_, i) => i !== index) || []
      }));
    }
  };

  const handleSave = async () => {
    if (!event) return;

    try {
      setLoading(true);
      setError(null);
      
      // Combine start time and end time into the expected format
      const timeRange = (formData as any).startTime && (formData as any).endTime 
        ? `${(formData as any).startTime} - ${(formData as any).endTime}`
        : (formData as any).startTime || '';

      const eventData = {
        ...formData,
        time: timeRange
      };

      // Remove fields that shouldn't be sent to API
      delete (eventData as any).startTime;
      delete (eventData as any).endTime;
      
      await onSave(eventData);
      
      setSuccessMessage('Event updated successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailNotification = () => {
    // TODO: Implement email notification functionality
    console.log('Email notification would be sent to all participants');
    alert('Email notification feature will be implemented soon!');
  };

  if (!isOpen || !event) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`${typography.h2} text-gray-900`}>Edit Event Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="close" size="md" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Icon name="check" size="sm" className="text-green-600 mr-2" />
                <span className={`${typography.small} text-green-800`}>{successMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <Icon name="alert" size="sm" className="text-red-600 mr-2" />
                <span className={`${typography.small} text-red-800`}>{error}</span>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Name */}
            <div className="md:col-span-2">
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter event name"
              />
              {/* Debug: Show actual value */}
              <div className="text-xs text-gray-500 mt-1">Debug: {formData.name || 'EMPTY'}</div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter event description"
              />
            </div>

            {/* Date and Time */}
            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Start Time *
              </label>
              <input
                type="text"
                name="startTime"
                value={(formData as any).startTime || ''}
                onChange={handleInputChange}
                placeholder="--:-- --"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration || ''}
                onChange={handleInputChange}
                placeholder="e.g., 6 hours"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {(formData as any).endTime && (
                <div className="mt-2 text-sm text-gray-600">
                  End Time: {(formData as any).endTime}
                </div>
              )}
            </div>

            {/* Venue and Address */}
            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Venue *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter venue name"
              />
            </div>

            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter full address"
              />
            </div>

            {/* Price and Capacity */}
            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Price *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., $25, Free, $50-75"
              />
            </div>

            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Capacity *
              </label>
              <input
                type="text"
                name="capacity"
                value={formData.capacity || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 50, 100-200"
              />
            </div>

            {/* Duration and Event Type */}
            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 2 hours, 1 day"
              />
            </div>

            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select event type</option>
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="seminar">Seminar</option>
                <option value="networking">Networking</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Age Restriction and Expected Participants */}
            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Age Restriction *
              </label>
              <input
                type="text"
                name="ageRestriction"
                value={formData.ageRestriction || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 18+, All ages, 21+"
              />
            </div>

            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Expected Participants *
              </label>
              <input
                type="text"
                name="expectedParticipants"
                value={formData.expectedParticipants || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 30-50, 100+"
              />
            </div>

            {/* How It Works */}
            <div className="md:col-span-2">
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                How It Works *
              </label>
              <textarea
                name="howItWorks"
                value={formData.howItWorks || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe how the event works"
              />
            </div>

            {/* Agenda */}
            <div className="md:col-span-2">
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Agenda
              </label>
              <div className="space-y-3">
                {formData.agenda && formData.agenda.length > 0 ? (
                  formData.agenda.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleAgendaChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        placeholder={`Agenda item ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeAgendaItem(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove agenda item"
                      >
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Icon name="calendar" size="lg" className="mx-auto mb-2 text-gray-400" />
                    <p className={`${typography.small}`}>No agenda items yet</p>
                    <p className={`${typography.small} text-gray-400`}>Add items to create an event schedule</p>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={addAgendaItem}
                  className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 rounded-lg transition-colors"
                >
                  <Icon name="plus" size="sm" className="mr-2" />
                  <span className={`${typography.small} font-medium`}>Add agenda item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Notification Option */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotification"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotification" className={`ml-2 ${typography.small} text-gray-700`}>
                  Send email notification to all participants about these changes
                </label>
              </div>
              {sendEmailNotification && (
                <button
                  type="button"
                  onClick={handleEmailNotification}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Icon name="mail" size="sm" className="mr-1" />
                  <span className={`${typography.small}`}>Send Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Icon name="save" size="sm" className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
