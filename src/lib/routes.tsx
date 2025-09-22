import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CurrentEvents from '../pages/CurrentEvents';
import EventDetail from '../pages/EventDetail';
import EventDashboard from '../pages/EventDashboard';
import UserProfile from '../pages/UserProfile';
import UserPublicProfile from '../pages/UserPublicProfile';
import MyEvents from '../pages/MyEvents';
import CreateEvent from '../pages/CreateEvent';

// Route configuration
export const ROUTE_PATHS = {
  HOME: '/',
  CURRENT_EVENTS: '/current-events',
  MY_EVENTS: '/my-events',
  EVENT_DETAIL: '/event/:eventId',
  EVENT_DASHBOARD: '/event/:eventId/dashboard',
  PROFILE: '/profile',
  USER_PROFILE: '/user/:userId',
  CREATE_EVENT: '/create-event',
} as const;

// Route components
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.HOME} element={<Home />} />
      <Route path={ROUTE_PATHS.CURRENT_EVENTS} element={<CurrentEvents />} />
      <Route path={ROUTE_PATHS.MY_EVENTS} element={<MyEvents />} />
      <Route path={ROUTE_PATHS.EVENT_DETAIL} element={<EventDetail />} />
      <Route path={ROUTE_PATHS.EVENT_DASHBOARD} element={<EventDashboard />} />
      <Route path={ROUTE_PATHS.PROFILE} element={<UserProfile />} />
      <Route path={ROUTE_PATHS.USER_PROFILE} element={<UserPublicProfile />} />
      <Route path={ROUTE_PATHS.CREATE_EVENT} element={<CreateEvent />} />
    </Routes>
  );
};
