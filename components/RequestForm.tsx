import React, { useState } from 'react';
import { OutpassRequest, PassStatus, AIAnalysisResult, User } from '../types';

import { v4 as uuidv4 } from 'uuid';
import { Loader2, Sparkles, AlertTriangle, Check, Info } from 'lucide-react';
import { differenceInHours } from 'date-fns';

interface RequestFormProps {
  user: User;
  onSubmit: (request: OutpassRequest) => void;
  onCancel: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Auto-fill from logged in user
    fullName: user.name,
    studentId: user.usn || '',
    destination: '',
    reason: '',
    departureTime: '',
    returnTime: '',
    parentMobile: user.parentMobile || ''
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRequest: OutpassRequest = {
      id: uuidv4(),
      ...formData,
      status: PassStatus.APPLIED, // Initial status
      createdAt: new Date().toISOString()
    };

    onSubmit(newRequest);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-white/40">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New Outpass Request</h2>
        <p className="text-gray-700 font-medium">Fill in the details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info - Read Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Full Name</label>
            <input
              required
              disabled
              name="fullName"
              value={formData.fullName}
              className="w-full px-4 py-2 rounded-lg border border-gray-200/50 bg-gray-50/50 text-gray-600 cursor-not-allowed font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Student ID (USN)</label>
            <input
              required
              disabled
              name="studentId"
              value={formData.studentId}
              className="w-full px-4 py-2 rounded-lg border border-gray-200/50 bg-gray-50/50 text-gray-600 cursor-not-allowed font-medium"
            />
          </div>
        </div>

        {/* Trip Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">From Date & Time</label>
            <input
              required
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm text-gray-900 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">To Date & Time</label>
            <input
              required
              type="datetime-local"
              name="returnTime"
              value={formData.returnTime}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm text-gray-900 font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Place (Destination)</label>
          <input
            required
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 font-medium"
            placeholder="e.g., City Hospital, Central Market"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">
            Reason for Leaving
          </label>
          <textarea
            required
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 font-medium"
            placeholder="Please explain why you need to leave..."
          />
        </div>



        <div className="flex items-center gap-4 pt-4 border-t border-gray-200/50">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-100/60 hover:bg-gray-200/80 text-gray-800 font-semibold rounded-lg transition-colors border border-gray-200/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600/90 hover:bg-blue-700/90 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 backdrop-blur-sm"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};