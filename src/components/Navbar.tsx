import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavbarProps } from '../types';
import { typography } from '../lib/typography';
import AuthModal from './AuthModal';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { GRADIENTS, ANIMATION } from '../lib/constants';

const Navbar: React.FC<NavbarProps> = ({ items }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsOpen(false); // Close mobile menu if open
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className={`${typography.navBrand} text-primary-600`}>SonderSwap</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-gray-700 hover:text-primary-600 px-3 py-2 ${typography.navLink} transition-colors duration-200`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-md text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-lg">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <span className={`hidden sm:block ${typography.navLink}`}>{user?.firstName}</span>
                </button>
                
                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl py-3 z-50 border border-gray-100">
                    <div className="px-6 py-4 text-lg text-gray-700 border-b border-gray-200">
                      <div className="font-semibold text-xl">{user?.firstName} {user?.lastName}</div>
                      <div className="text-gray-500 text-base mt-1">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="block w-full text-left px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className={`px-4 py-2 rounded-md text-white font-medium ${GRADIENTS.PRIMARY_SECONDARY} ${GRADIENTS.BUTTON_HOVER} ${ANIMATION.TRANSITION_DURATION}`}
              >
                Login / Sign Up
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
              aria-label="Toggle menu"
            >
              <Icon name={isOpen ? "close" : "menu"} size="lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-gray-700 hover:text-primary-600 block px-3 py-2 ${typography.navLinkMobile} transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-6">
                <div className="px-3 py-4 text-lg text-gray-700">
                  <div className="font-semibold text-xl">{user?.firstName} {user?.lastName}</div>
                  <div className="text-gray-500 text-base mt-1">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-4 text-lg text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className={`w-full text-left px-3 py-2 rounded-md text-white font-medium ${GRADIENTS.PRIMARY_SECONDARY} ${GRADIENTS.BUTTON_HOVER} ${ANIMATION.TRANSITION_DURATION}`}
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;

