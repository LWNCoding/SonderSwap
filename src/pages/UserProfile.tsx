import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { ERROR_MESSAGES, API_CONFIG, LAYOUT, GRADIENTS } from '../lib/constants';
import { typography } from '../lib/typography';
import { authService } from '../lib/authService';
import { useBackNavigation } from '../hooks/useBackNavigation';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const UserProfile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { goBack } = useBackNavigation();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    profile: {
      bio: '',
      description: '',
      title: 'learner' as 'learner' | 'swapper' | 'both',
      interests: [] as string[],
      location: '',
      website: '',
      phone: '',
      socialMedia: {
        linkedin: '',
        twitter: '',
        github: ''
      },
      profileImage: ''
    }
  });

  useEffect(() => {
    console.log('UserProfile useEffect - isAuthenticated:', isAuthenticated);
    console.log('UserProfile useEffect - authService.isAuthenticated():', authService.isAuthenticated());
    console.log('UserProfile useEffect - authService.getToken():', authService.getToken());
    
    if (!isAuthenticated || !authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to home');
      navigate('/');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.user);
      setEditForm({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        profile: {
          bio: data.user.profile.bio || '',
          description: data.user.profile.description || '',
          title: data.user.profile.title || 'learner',
          interests: data.user.profile.interests || [],
          location: data.user.profile.location || '',
          website: data.user.profile.website || '',
          phone: data.user.profile.phone || '',
          socialMedia: {
            linkedin: data.user.profile.socialMedia?.linkedin || '',
            twitter: data.user.profile.socialMedia?.twitter || '',
            github: data.user.profile.socialMedia?.github || ''
          },
          profileImage: data.user.profile.profileImage || ''
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Saving profile with data:', editForm);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);
      
      // Update local state
      setProfile(data.user);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'profile') {
        setEditForm(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            [child]: value
          }
        }));
      }
    } else if (field.includes('socialMedia.')) {
      const [, socialField] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          socialMedia: {
            ...prev.profile.socialMedia,
            [socialField]: value
          }
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleInterestsChange = (value: string) => {
    const interests = value.split(',').map(item => item.trim()).filter(item => item);
    setEditForm(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        interests
      }
    }));
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        profile: {
          bio: profile.profile.bio || '',
          description: profile.profile.description || '',
          title: profile.profile.title || 'learner',
          interests: profile.profile.interests || [],
          location: profile.profile.location || '',
          website: profile.profile.website || '',
          phone: profile.profile.phone || '',
          socialMedia: {
            linkedin: profile.profile.socialMedia?.linkedin || '',
            twitter: profile.profile.socialMedia?.twitter || '',
            github: profile.profile.socialMedia?.github || ''
          },
          profileImage: profile.profile.profileImage || ''
        }
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const getTitleColor = (title: string) => {
    switch (title) {
      case 'learner': return 'bg-blue-100 text-blue-800';
      case 'swapper': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        <div className="text-center py-12">
          <Icon name="alertCircle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`${typography.h2} mb-2`}>Error Loading Profile</h2>
          <p className={`${typography.body} text-gray-600 mb-6`}>{error}</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        <div className="text-center py-12">
          <h2 className={`${typography.h2} mb-2`}>Profile Not Found</h2>
          <p className={`${typography.body} text-gray-600 mb-6`}>Unable to load your profile information.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.HEADER_PADDING}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const returnTo = location.state?.returnTo;
                if (returnTo) {
                  // If returnTo state exists, use it directly
                  navigate(returnTo);
                } else {
                  // Otherwise, use the back navigation hook
                  goBack();
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${GRADIENTS.PRIMARY_SECONDARY} ${GRADIENTS.BUTTON_HOVER} text-white hover:shadow-lg`}
            >
              <Icon name="arrowLeft" className="w-5 h-5" />
              <span className={typography.body}>Back</span>
            </button>
            <h1 className={typography.h1}>Profile</h1>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'outline' : 'primary'}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <Icon name="checkCircle" className="w-5 h-5 mr-2" />
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

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              {/* Profile Image */}
              <div className="relative">
                {profile.profile.profileImage ? (
                  <img
                    src={profile.profile.profileImage}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                    <Icon name="user" className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors">
                    <Icon name="camera" className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-white">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="px-3 py-2 rounded-md text-gray-900 placeholder-gray-500"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="px-3 py-2 rounded-md text-gray-900 placeholder-gray-500"
                        placeholder="Last Name"
                      />
                    </div>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="px-3 py-2 rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className={`${typography.h2} text-white mb-2`}>
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className={`${typography.body} text-blue-100`}>{profile.email}</p>
                  </div>
                )}
              </div>

              {/* Title Badge */}
              <div className="text-right">
                {isEditing ? (
                  <select
                    value={editForm.profile.title}
                    onChange={(e) => handleInputChange('profile.title', e.target.value)}
                    className="px-3 py-2 rounded-md text-gray-900"
                  >
                    <option value="learner">Learner</option>
                    <option value="swapper">Swapper</option>
                    <option value="both">Both</option>
                  </select>
                ) : (
                  <Badge
                    label={profile.profile.title.charAt(0).toUpperCase() + profile.profile.title.slice(1)}
                    variant="primary"
                    className={`${getTitleColor(profile.profile.title)} text-lg px-4 py-2`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className={`${typography.h3} mb-3`}>About</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.profile.bio}
                      onChange={(e) => handleInputChange('profile.bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className={`${typography.body} text-gray-600`}>
                      {profile.profile.bio || 'No bio provided.'}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className={`${typography.h3} mb-3`}>Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.profile.description}
                      onChange={(e) => handleInputChange('profile.description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Brief description of your skills and interests..."
                    />
                  ) : (
                    <p className={`${typography.body} text-gray-600`}>
                      {profile.profile.description || 'No description provided.'}
                    </p>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <h3 className={`${typography.h3} mb-3`}>Interests</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.profile.interests.join(', ')}
                      onChange={(e) => handleInterestsChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter interests separated by commas..."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.profile.interests && profile.profile.interests.length > 0 ? (
                        profile.profile.interests.map((interest, index) => (
                          <Badge key={index} label={interest} variant="secondary" />
                        ))
                      ) : (
                        <p className={`${typography.body} text-gray-500`}>No interests specified.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className={`${typography.h3} mb-3`}>Contact Information</h3>
                  <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center space-x-3">
                      <Icon name="mapPin" className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.profile.location}
                          onChange={(e) => handleInputChange('profile.location', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Location"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {profile.profile.location || 'Not specified'}
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-3">
                      <Icon name="phone" className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.profile.phone}
                          onChange={(e) => handleInputChange('profile.phone', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Phone number"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {profile.profile.phone || 'Not specified'}
                        </span>
                      )}
                    </div>

                    {/* Website */}
                    <div className="flex items-center space-x-3">
                      <Icon name="globe" className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.profile.website}
                          onChange={(e) => handleInputChange('profile.website', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Website URL"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {profile.profile.website ? (
                            <a
                              href={profile.profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {profile.profile.website}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className={`${typography.h3} mb-3`}>Social Media</h3>
                  <div className="space-y-3">
                    {/* LinkedIn */}
                    <div className="flex items-center space-x-3">
                      <Icon name="linkedin" className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.profile.socialMedia.linkedin}
                          onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="LinkedIn URL"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {profile.profile.socialMedia?.linkedin ? (
                            <a
                              href={profile.profile.socialMedia.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {profile.profile.socialMedia.linkedin}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </span>
                      )}
                    </div>

                    {/* Twitter */}
                    <div className="flex items-center space-x-3">
                      <Icon name="twitter" className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.profile.socialMedia.twitter}
                          onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Twitter URL"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {profile.profile.socialMedia?.twitter ? (
                            <a
                              href={profile.profile.socialMedia.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {profile.profile.socialMedia.twitter}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </span>
                      )}
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center space-x-3">
                      <Icon name="github" className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.profile.socialMedia.github}
                          onChange={(e) => handleInputChange('socialMedia.github', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="GitHub URL"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {profile.profile.socialMedia?.github ? (
                            <a
                              href={profile.profile.socialMedia.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {profile.profile.socialMedia.github}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
