import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from './lib/toast';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import CreateJob from './pages/CreateJob';
import RoleDashboard from './pages/RoleDashboard';
import CandidateDetail from './pages/CandidateDetail';
import Candidates from './pages/Candidates';
import Shortlisted from './pages/Shortlisted';
import AutoSourcing from './pages/AutoSourcing';
import Outreach from './pages/Outreach';
import Scheduling from './pages/Scheduling';
import PrepPack from './pages/PrepPack';
import AnalyticsPage from './pages/AnalyticsPage';
import Pipeline from './pages/Pipeline';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import Homepage from './pages/Homepage';
import PricingPage from './pages/PricingPage';
import SolutionsPage from './pages/SolutionsPage';
import ContactPage from './pages/ContactPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <LoginScreen />;
  return <>{children}</>;
}

function LoginScreen() {
  const { signIn } = useAuth();
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">HireLoop</h1>
          <p className="mt-2 text-sm text-slate-500">AI-Powered Recruiting Platform</p>
        </div>
        <button
          onClick={() => signIn()}
          className="w-full rounded-md bg-gradient-primary px-4 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Sign In (Mock)
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          {/* Marketing Pages */}
          <Route path="/" element={<Homepage />} />
          <Route path="/product" element={<Homepage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Dashboard (Protected) */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/new" element={<CreateJob />} />
            <Route path="jobs/:id" element={<RoleDashboard />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:id" element={<CandidateDetail />} />
            <Route path="shortlisted" element={<Shortlisted />} />
            <Route path="auto-sourcing" element={<AutoSourcing />} />
            <Route path="outreach" element={<Outreach />} />
            <Route path="scheduling" element={<Scheduling />} />
            <Route path="prep-pack" element={<PrepPack />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="settings" element={<Settings />} />
            <Route path="integrations" element={<Integrations />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
