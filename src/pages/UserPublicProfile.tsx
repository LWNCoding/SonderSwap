import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { ERROR_MESSAGES, API_CONFIG, LAYOUT, GRADIENTS } from '../lib/constants';
import { typography } from '../lib/typography';
import { useBackNavigation } from '../hooks/useBackNavigation';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { useAuth } from '../contexts/AuthContext';

const UserPublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { goBack } = useBackNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser && userId === currentUser._id;

  useEffect(() => {
    // If viewing own profile, redirect to /profile but preserve returnTo state
    if (isOwnProfile) {
      const returnTo = location.state?.returnTo;
      navigate('/profile', { 
        state: returnTo ? { returnTo } : undefined 
      });
      return;
    }
    
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, isOwnProfile, navigate, location.state]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get user by ID (speakers are now users)
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC);
    } finally {
      setLoading(false);
    }
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
          <Button onClick={fetchUserProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        <div className="text-center py-12">
          <h2 className={`${typography.h2} mb-2`}>User Not Found</h2>
          <p className={`${typography.body} text-gray-600 mb-6`}>The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.HEADER_PADDING}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBack}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${GRADIENTS.PRIMARY_SECONDARY} ${GRADIENTS.BUTTON_HOVER} text-white hover:shadow-lg`}
            >
              <Icon name="arrowLeft" className="w-5 h-5" />
              <span className={typography.body}>Back</span>
            </button>
            <h1 className={typography.h1}>User Profile</h1>
          </div>
          
          {/* Edit Button - only show if viewing own profile */}
          {isOwnProfile && (
            <Button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2"
            >
              <Icon name="edit" className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${LAYOUT.MAX_WIDTH} mx-auto ${LAYOUT.CONTAINER_PADDING} ${LAYOUT.CONTENT_PADDING}`}>
        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              {/* Profile Image */}
              <div className="relative">
                {user.profile.profileImage ? (
                  <img
                    src={user.profile.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                    <Icon name="user" className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-white">
                <h2 className={`${typography.h2} text-white mb-2`}>
                  {user.firstName} {user.lastName}
                </h2>
                <p className={`${typography.body} text-blue-100`}>{user.email}</p>
              </div>

              {/* Title Badge */}
              <div className="text-right">
                <Badge
                  label={user.profile.title.charAt(0).toUpperCase() + user.profile.title.slice(1)}
                  variant="primary"
                  className={`${getTitleColor(user.profile.title)} text-lg px-4 py-2`}
                />
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
                  <p className={`${typography.body} text-gray-600`}>
                    {user.profile.bio || 'No bio provided.'}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h3 className={`${typography.h3} mb-3`}>Description</h3>
                  <p className={`${typography.body} text-gray-600`}>
                    {user.profile.description || 'No description provided.'}
                  </p>
                </div>

                {/* Interests */}
                <div>
                  <h3 className={`${typography.h3} mb-3`}>Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.profile.interests && user.profile.interests.length > 0 ? (
                      user.profile.interests.map((interest, index) => (
                        <Badge key={index} label={interest} variant="secondary" />
                      ))
                    ) : (
                      <p className={`${typography.body} text-gray-500`}>No interests specified.</p>
                    )}
                  </div>
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
                      <span className={`${typography.body} text-gray-600`}>
                        {user.profile.location || 'Not specified'}
                      </span>
                    </div>

                    {/* Website */}
                    <div className="flex items-center space-x-3">
                      <Icon name="globe" className="w-5 h-5 text-gray-400" />
                      <span className={`${typography.body} text-gray-600`}>
                        {user.profile.website ? (
                          <a
                            href={user.profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {user.profile.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </span>
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
                      <span className={`${typography.body} text-gray-600`}>
                        {user.profile.socialMedia?.linkedin ? (
                          <a
                            href={user.profile.socialMedia.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {user.profile.socialMedia.linkedin}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </span>
                    </div>

                    {/* Twitter */}
                    <div className="flex items-center space-x-3">
                      <Icon name="twitter" className="w-5 h-5 text-gray-400" />
                      <span className={`${typography.body} text-gray-600`}>
                        {user.profile.socialMedia?.twitter ? (
                          <a
                            href={user.profile.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {user.profile.socialMedia.twitter}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </span>
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center space-x-3">
                      <Icon name="github" className="w-5 h-5 text-gray-400" />
                      <span className={`${typography.body} text-gray-600`}>
                        {user.profile.socialMedia?.github ? (
                          <a
                            href={user.profile.socialMedia.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {user.profile.socialMedia.github}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPublicProfile;
