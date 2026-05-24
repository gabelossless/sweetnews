import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Code-split each sub-app so customers never download admin/fleet code
const CustomerApp = lazy(() => import('./CustomerApp'));
const AdminApp = lazy(() => import('./AdminApp'));
const FleetApp = lazy(() => import('./FleetApp'));

function AppShell() {
  return <div className="min-h-screen bg-black" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<AppShell />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route
            path="/fleet/*"
            element={
              <Suspense fallback={<AppShell />}>
                <FleetApp />
              </Suspense>
            }
          />
          <Route
            path="/*"
            element={
              <Suspense fallback={<AppShell />}>
                <CustomerApp />
              </Suspense>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
