import { useAuth } from './context/AuthContext';
import FleetLoginView from './views/fleet/FleetLoginView';
import FleetApplyView from './views/fleet/FleetApplyView';
import FleetPendingView from './views/fleet/FleetPendingView';
import FleetDashboardView from './views/fleet/FleetDashboardView';

export default function FleetApp() {
  const { user, profile, loading, isDriver, isDriverPending } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Not logged in -> Show Login/Signup
  if (!user) {
    return <FleetLoginView />;
  }

  // 2. Logged in as customer -> Show Application Form
  if (profile?.role === 'customer') {
    return <FleetApplyView />;
  }

  // 3. Application submitted -> Show Waiting Room
  if (isDriverPending) {
    return <FleetPendingView />;
  }

  // 4. Approved -> Show Dashboard
  if (isDriver || profile?.role === 'admin') {
    return <FleetDashboardView />;
  }

  // Fallback (e.g. if something is wrong with the role)
  return <FleetApplyView />;
}
