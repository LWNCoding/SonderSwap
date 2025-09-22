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
  const [timeErrors, setTimeErrors] = useState<{startTime?: string; endTime?: string}>({});
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

      // Convert time format from "8:00 AM - 2:00 PM" to 24-hour format
      const parseTimeRange = (timeStr: string): { startTime: string; endTime: string } => {
        if (!timeStr) return { startTime: '', endTime: '' };
        try {
          // Extract start and end times
          const parts = timeStr.split(' - ');
          const startTime12 = parts[0]?.trim() || '';
          const endTime12 = parts[1]?.trim() || '';
          
          // Convert to 24-hour format for time inputs
          const startTime24 = formatTo24Hour(startTime12);
          const endTime24 = formatTo24Hour(endTime12);
          
          return { 
            startTime: startTime24, 
            endTime: endTime24 
          };
        } catch {
          return { startTime: '', endTime: '' };
        }
      };
      
      const { startTime, endTime } = parseTimeRange(event.time || '');
      
      const initialData = {
        name: event.name || '',
        description: event.description || '',
        date: convertDateForInput(event.date || ''),
        startTime: startTime,
        endTime: endTime,
        address: event.address || '',
        price: event.price || '',
        capacity: event.capacity || '',
        eventType: event.eventType || '',
        ageRestriction: event.ageRestriction || '',
        howItWorks: event.howItWorks || 'Explore different stations and sessions throughout the event. Share what you know, discover new techniques, and practice alongside others in a supportive environment. Each space focuses on a unique aspect of learning and creation, giving you the chance to participate, teach, or simply enjoy the experience.',
        agenda: event.agenda || []
      };
      
      setFormData(initialData);
      setTimeErrors({});
    }
  }, [event]);



  // Validate individual time input
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
    if (name === 'endTime' && (formData as any).startTime) {
      if (!isEndTimeAfterStart((formData as any).startTime, value)) {
        setTimeErrors(prev => ({ ...prev, [name]: 'End time must be after start time' }));
        return;
      }
    }
    
    setTimeErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate time inputs
    if (name === 'startTime' || name === 'endTime') {
      validateTimeInput(name, value);
    }
  };


  // Convert 24-hour time to 12-hour format for display
  const formatTo12Hour = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const mins = minutes || '00';
    
    if (hour24 === 0) {
      return `12:${mins} AM`;
    } else if (hour24 < 12) {
      return `${hour24}:${mins} AM`;
    } else if (hour24 === 12) {
      return `12:${mins} PM`;
    } else {
      return `${hour24 - 12}:${mins} PM`;
    }
  };

  // Convert 12-hour time to 24-hour format for time input
  const formatTo24Hour = (time12: string): string => {
    if (!time12) return '';
    const timeMatch = time12.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
    if (!timeMatch) return '';
    
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const period = timeMatch[3].toUpperCase();
    
    if (period === 'AM' && hours === 12) {
      hours = 0;
    } else if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
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

  // Validate time format (check if it's a valid 24-hour time)
  const isValidTimeFormat = (time: string): boolean => {
    if (!time) return false;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // Check if end time is after start time
  const isEndTimeAfterStart = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return true; // Allow empty times
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes > startMinutes;
  };

  const handleSave = async () => {
    if (!event) return;

    try {
      setLoading(true);
      setError(null);
      
      // Validate time formats
      const startTime = (formData as any).startTime;
      const endTime = (formData as any).endTime;
      
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
        : formattedStartTime || '';

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-700/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`${typography.h2} text-gray-900 dark:text-white dark:text-white`}>Edit Event Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
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
            {/* Event Name and Address */}
            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter event name"
              />
              {/* Debug: Show actual value */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Debug: {formData.name || 'EMPTY'}</div>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter full address"
              />
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={(formData as any).startTime || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    timeErrors.startTime ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {timeErrors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{timeErrors.startTime}</p>
                )}
              </div>

              <div className="flex-1">
                <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={(formData as any).endTime || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    timeErrors.endTime ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {timeErrors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{timeErrors.endTime}</p>
                )}
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., 50, 100-200"
              />
            </div>

            {/* Event Type */}

            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

            {/* Age Restriction */}
            <div>
              <label className={`block ${typography.small} font-medium text-gray-700 mb-2`}>
                Age Restriction *
              </label>
              <select
                name="ageRestriction"
                value={formData.ageRestriction || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select age restriction</option>
                <option value="All ages welcome">All ages welcome</option>
                <option value="13+">13+</option>
                <option value="18+">18+</option>
                <option value="21+">21+</option>
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleAgendaChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={`Agenda item ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeAgendaItem(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Remove agenda item"
                      >
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <Icon name="calendar" size="lg" className="mx-auto mb-2 text-gray-400" />
                    <p className={`${typography.small}`}>No agenda items yet</p>
                    <p className={`${typography.small} text-gray-400`}>Add items to create an event schedule</p>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={addAgendaItem}
                  className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 rounded-lg transition-colors bg-white dark:bg-gray-800"
                >
                  <Icon name="plus" size="sm" className="mr-2" />
                  <span className={`${typography.small} font-medium`}>Add agenda item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Notification Option */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotification"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="emailNotification" className={`ml-2 ${typography.small} text-gray-700 dark:text-gray-300`}>
                  Send email notification to all participants about these changes
                </label>
              </div>
              {sendEmailNotification && (
                <button
                  type="button"
                  onClick={handleEmailNotification}
                  className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Icon name="mail" size="sm" className="mr-1" />
                  <span className={`${typography.small}`}>Send Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
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
