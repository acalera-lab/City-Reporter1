import { useState } from 'react';
import { Report, ReportStatus } from '../App';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

interface AdminDashboardProps {
  reports: Report[];
  onStatusUpdate: (id: string, status: ReportStatus) => void;
}

export function AdminDashboard({ reports, onStatusUpdate }: AdminDashboardProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter out any null or invalid reports
  const validReports = reports.filter(r => r && r.id && r.title);

  // Analytics calculations
  const pendingCount = validReports.filter(r => r.status === 'pending').length;
  const inProgressCount = validReports.filter(r => r.status === 'in-progress').length;
  const resolvedCount = validReports.filter(r => r.status === 'resolved').length;

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pending', value: pendingCount, color: '#fbbf24' },
    { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
    { name: 'Resolved', value: resolvedCount, color: '#10b981' },
  ];

  // Type distribution for bar chart
  const typeData = [
    { name: 'Infrastructure', count: validReports.filter(r => r.type === 'infrastructure').length },
    { name: 'Safety', count: validReports.filter(r => r.type === 'safety').length },
    { name: 'Environment', count: validReports.filter(r => r.type === 'environment').length },
    { name: 'Traffic', count: validReports.filter(r => r.type === 'traffic').length },
    { name: 'Public Services', count: validReports.filter(r => r.type === 'public-services').length },
    { name: 'Other', count: validReports.filter(r => r.type === 'other').length },
  ];

  // Trend data (mock - last 7 days)
  const trendData = [
    { day: 'Mon', reports: 12 },
    { day: 'Tue', reports: 15 },
    { day: 'Wed', reports: 8 },
    { day: 'Thu', reports: 18 },
    { day: 'Fri', reports: 14 },
    { day: 'Sat', reports: 10 },
    { day: 'Sun', reports: 7 },
  ];

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Total Reports</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-slate-900">{validReports.length}</div>
          <p className="text-xs text-slate-500 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-yellow-900">Pending</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-yellow-900">{pendingCount}</div>
          <p className="text-xs text-yellow-700 mt-1">Awaiting review</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-900">In Progress</span>
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-blue-900">{inProgressCount}</div>
          <p className="text-xs text-blue-700 mt-1">Being addressed</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-900">Resolved</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-green-900">{resolvedCount}</div>
          <p className="text-xs text-green-700 mt-1">Completed</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-slate-900 mb-4">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-slate-900 mb-4">Reports by Type</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={typeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Reports Management */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">All Reports</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {validReports.map(report => (
              <div key={report.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex gap-4">
                  {report.imageUrl && (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      <img 
                        src={report.imageUrl} 
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-slate-900">{report.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {report.location}
                      </div>
                      <span>•</span>
                      <span>{formatTimestamp(report.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Status:</span>
                      <select
                        value={report.status}
                        onChange={(e) => onStatusUpdate(report.id, e.target.value as ReportStatus)}
                        className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(report.status)} cursor-pointer outline-none`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">Image</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">Title</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">Location</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">Type</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">Date</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {validReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {report.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                          <img 
                            src={report.imageUrl} 
                            alt={report.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{report.title}</div>
                      <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">{report.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{report.location}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-700">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={report.status}
                        onChange={(e) => onStatusUpdate(report.id, e.target.value as ReportStatus)}
                        className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(report.status)} cursor-pointer outline-none`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}