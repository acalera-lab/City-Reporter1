import { useState, useMemo } from 'react';
import { Search, Filter, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Report, ReportType, ReportStatus } from '../App';

interface ReportsFeedProps {
  reports: Report[];
}

export function ReportsFeed({ reports }: ReportsFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Skip null or invalid reports
      if (!report || !report.title) return false;
      
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || report.type === filterType;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchTerm, filterType, filterStatus]);

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

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
    }
  };

  const getTypeLabel = (type: ReportType) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-900">Recent Reports</h2>
            <p className="text-sm text-slate-500 mt-1">
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <AlertCircle className="w-6 h-6 text-slate-400" />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ReportType | 'all')}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white appearance-none"
              >
                <option value="all">All Types</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="safety">Safety</option>
                <option value="environment">Environment</option>
                <option value="traffic">Traffic</option>
                <option value="public-services">Public Services</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'all')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No reports found matching your criteria</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image */}
                  {report.imageUrl && (
                    <div className="sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      <img 
                        src={report.imageUrl} 
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-slate-900">{report.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {report.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimestamp(report.timestamp)}</span>
                      </div>
                      <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">
                        {getTypeLabel(report.type)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}