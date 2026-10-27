import React from 'react';
import { OutpassRequest, PassStatus, User } from '../types';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, ChevronRight, Filter, AlertCircle, Loader, Trash2 } from 'lucide-react';

interface DashboardProps {
  requests: OutpassRequest[];
  user: User;
  onSelectPass: (pass: OutpassRequest) => void;
  onSearchStudent?: (usn: string) => void;
  onDeleteStudent?: (usn: string) => void;
  onDeleteRequest?: (id: string) => void;
  title?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ requests, user, onSelectPass, onSearchStudent, onDeleteStudent, onDeleteRequest, title }) => {
  const [searchUsn, setSearchUsn] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsn.trim() && onSearchStudent) {
      onSearchStudent(searchUsn.trim());
    }
  };

  const getStatusIcon = (status: PassStatus) => {
    switch (status) {
      case PassStatus.APPROVED: return <CheckCircle className="w-5 h-5 text-green-600" />;
      case PassStatus.REJECTED: return <XCircle className="w-5 h-5 text-red-600" />;
      case PassStatus.UNDER_PROGRESS: return <Loader className="w-5 h-5 text-blue-600 animate-spin-slow" />;
      case PassStatus.APPLIED: default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: PassStatus) => {
    switch (status) {
      case PassStatus.APPROVED: return 'bg-green-100/80 text-green-800 border-green-200';
      case PassStatus.REJECTED: return 'bg-red-100/80 text-red-800 border-red-200';
      case PassStatus.UNDER_PROGRESS: return 'bg-blue-100/80 text-blue-800 border-blue-200';
      case PassStatus.APPLIED: default: return 'bg-yellow-100/80 text-yellow-800 border-yellow-200';
    }
  };



  const handleDeleteStudent = (e: React.MouseEvent, usn: string, studentName: string) => {
    e.stopPropagation(); // Prevent triggering onSelectPass
    if (window.confirm(`Are you sure you want to delete the account for ${studentName} (${usn})? This action cannot be undone and will delete all their outpass requests.`)) {
      if (onDeleteStudent) {
        onDeleteStudent(usn);
      }
    }
  };

  const handleDeleteRequest = (e: React.MouseEvent, id: string, destination: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the outpass request to ${destination}? This action cannot be undone.`)) {
      if (onDeleteRequest) {
        onDeleteRequest(id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {title || (user.role === 'ADMIN' ? 'All Student Requests' : 'My Outpass History')}
          </h2>
          <p className="text-blue-50 text-sm drop-shadow-md font-medium">
            {user.role === 'ADMIN' ? 'Manage, Review and Update status of requests' : 'Track the status of your applications'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'ADMIN' && onSearchStudent && (
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search Student USN..."
                value={searchUsn}
                onChange={(e) => setSearchUsn(e.target.value)}
                className="pl-4 pr-10 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur-sm w-64"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-100 hover:text-white transition-colors"
              >
                <Filter className="w-4 h-4" />
              </button>
            </form>
          )}
          <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-xl border border-white/40 shadow-lg">
            <p className="text-gray-700 font-medium">No records found.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectPass(req)}
              className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 flex items-center justify-between hover:bg-white hover:scale-[1.01] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full shadow-inner bg-white/50`}>
                  {getStatusIcon(req.status)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{req.destination}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <span>{format(new Date(req.departureTime), 'MMM d, h:mm a')}</span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{req.reason}</span>
                  </div>
                  {user.role === 'ADMIN' && (
                    <span className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-1">
                      <span className="opacity-75">Student:</span> {req.fullName} ({req.studentId})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
                {user.role === 'ADMIN' && onDeleteRequest && (
                  <button
                    onClick={(e) => handleDeleteRequest(e, req.id, req.destination)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all hover:scale-110 border border-red-200 shadow-sm"
                    title={`Delete request`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};