import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CustomerApp from './CustomerApp';
import AdminApp from './AdminApp';
import FleetApp from './FleetApp';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin Command Center Route */}
          <Route path="/admin/*" element={<AdminApp />} />
          
          {/* Driver Fleet PWA Route */}
          <Route path="/fleet/*" element={<FleetApp />} />

          {/* Customer PWA Route (Catch-all) */}
          <Route path="/*" element={<CustomerApp />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
