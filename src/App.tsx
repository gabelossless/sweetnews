import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Code-split each sub-app so customers never download admin/fleet code
const CustomerApp = lazy(() => import('./CustomerApp'));
const AdminApp = lazy(() => import('./AdminApp'));
const FleetApp = lazy(() => import('./FleetApp'));
const PrivacyView = lazy(() => import('./views/PrivacyView'));

function AppShell() {
  return <div className="min-h-screen bg-background" />;
}

// On fleet.sweetnews.shop, render FleetApp directly — no /fleet path prefix needed
const isFleetDomain =
  typeof window !== 'undefined' && window.location.hostname.startsWith('fleet.');

export default function App() {
  if (isFleetDomain) {
    return (
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<AppShell />}>
            <FleetApp />
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <ErrorBoundary>
                <Suspense fallback={<AppShell />}>
                  <AdminApp />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/fleet/*"
            element={
              <ErrorBoundary>
                <Suspense fallback={<AppShell />}>
                  <FleetApp />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={<AppShell />}>
                <PrivacyView />
              </Suspense>
            }
          />
          <Route
            path="/*"
            element={
              <ErrorBoundary>
                <Suspense fallback={<AppShell />}>
                  <CustomerApp />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
