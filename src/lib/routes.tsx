import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CurrentEvents from '../pages/CurrentEvents';
import EventDetail from '../pages/EventDetail';
import EventDashboard from '../pages/EventDashboard';
import UserProfile from '../pages/UserProfile';
import UserPublicProfile from '../pages/UserPublicProfile';

// Route configuration
export const ROUTE_PATHS = {
  HOME: '/',
  CURRENT_EVENTS: '/current-events',
  EVENT_DETAIL: '/event/:eventId',
  EVENT_DASHBOARD: '/event/:eventId/dashboard',
  PROFILE: '/profile',
  USER_PROFILE: '/user/:userId',
} as const;

// Route components
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.HOME} element={<Home />} />
      <Route path={ROUTE_PATHS.CURRENT_EVENTS} element={<CurrentEvents />} />
      <Route path={ROUTE_PATHS.EVENT_DETAIL} element={<EventDetail />} />
      <Route path={ROUTE_PATHS.EVENT_DASHBOARD} element={<EventDashboard />} />
      <Route path={ROUTE_PATHS.PROFILE} element={<UserProfile />} />
      <Route path={ROUTE_PATHS.USER_PROFILE} element={<UserPublicProfile />} />
    </Routes>
  );
};
