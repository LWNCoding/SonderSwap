import React from 'react';
import DefaultLayout from './layouts/DefaultLayout';
import { AppRoutes } from './lib/routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DefaultLayout>
            <AppRoutes />
          </DefaultLayout>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;