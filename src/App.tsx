import React from 'react';
import DefaultLayout from './layouts/DefaultLayout';
import { AppRoutes } from './lib/routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DefaultLayout>
          <AppRoutes />
        </DefaultLayout>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;