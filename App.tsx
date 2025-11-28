import { useState, useEffect } from 'react';
import { ReportForm } from './components/report-form';
import { ReportsFeed } from './components/reports-feed';
import { AdminDashboard } from './components/admin-dashboard';
import { AdminLogin } from './components/admin-login';
import { SystemStatus } from './components/system-status';
import { Users, Shield, Loader2, LogOut } from 'lucide-react';
import * as api from './utils/api';

export type ReportStatus = 'pending' | 'in-progress' | 'resolved';

export type ReportType = 
  | 'infrastructure' 
  | 'safety' 
  | 'environment' 
  | 'traffic' 
  | 'public-services'
  | 'other';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  location: string;
  imageUrl?: string;
  status: ReportStatus;
  timestamp: number;
}

function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, []);

  // Remove the aggressive auto-refresh - reports will refresh when user submits or updates status

  const checkAuth = async () => {
    try {
      setAuthChecking(true);
      const user = await api.verifyAuth();
      setIsAuthenticated(true);
      setAdminUser(user);
    } catch (err) {
      setIsAuthenticated(false);
      setAdminUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const user = await api.login(email, password);
    setIsAuthenticated(true);
    setAdminUser(user);
    setView('admin');
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setAdminUser(null);
    setView('user');
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedReports = await api.getAllReports();
      console.log('Loaded reports:', fetchedReports);
      setReports(fetchedReports);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports. Please refresh the page.');
      // Don't throw - just show error message and keep empty reports
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = async (report: Omit<Report, 'id' | 'status' | 'timestamp'>) => {
    try {
      const newReport = await api.createReport(report);
      setReports([newReport, ...reports]);
    } catch (err) {
      console.error('Failed to create report:', err);
      throw err;
    }
  };

  const handleStatusUpdate = async (id: string, status: ReportStatus) => {
    try {
      const updatedReport = await api.updateReportStatus(id, status);
      
      // Add null check
      if (!updatedReport || !updatedReport.id) {
        console.error('Invalid report returned from status update');
        return;
      }
      
      setReports(reports.map(report => 
        report && report.id === id ? updatedReport : report
      ));
    } catch (err) {
      console.error('Failed to update report status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-slate-900 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadReports}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show login page if trying to access admin view without authentication
  if (view === 'admin' && !authChecking && !isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">City Reporter</h1>
                <p className="text-sm text-slate-500">Community-Powered City Improvements</p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setView('user')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    view === 'user'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">User View</span>
                </button>
                <button
                  onClick={() => setView('admin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    view === 'admin'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin View</span>
                </button>
              </div>

              {/* Logout Button (only show when authenticated) */}
              {isAuthenticated && view === 'admin' && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'user' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ReportForm onSubmit={handleNewReport} />
            </div>
            <div className="lg:col-span-2">
              <ReportsFeed reports={reports} />
            </div>
          </div>
        ) : (
          <AdminDashboard reports={reports} onStatusUpdate={handleStatusUpdate} />
        )}
      </main>

      {/* System Status Indicator */}
      <SystemStatus />
    </div>
  );
}

export default App;