import React, { useState, useEffect } from 'react';
import { OutpassRequest } from '../types';
import { getRequestById, updateParentVerificationStatus } from '../services/dataService';
import { translateText } from '../services/geminiService';
import { CheckCircle2, XCircle, Globe, Loader2, MapPin, Calendar, User, Building2 } from 'lucide-react';

interface ParentApprovalProps {
    requestId: string;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' }
];

export const ParentApproval: React.FC<ParentApprovalProps> = ({ requestId }) => {
    const [request, setRequest] = useState<OutpassRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('en');
    const [translatedData, setTranslatedData] = useState({ reason: '', destination: '' });
    const [translating, setTranslating] = useState(false);
    const [actionTaken, setActionTaken] = useState<'APPROVED' | 'REJECTED' | null>(null);

    useEffect(() => {
        const fetchRequest = async () => {
            const data = await getRequestById(requestId);
            setRequest(data);
            if (data) {
                setTranslatedData({ reason: data.reason, destination: data.destination });
                if (data.verificationStatus === 'VERIFIED') setActionTaken('APPROVED');
                if (data.verificationStatus === 'REJECTED_BY_PARENT') setActionTaken('REJECTED');
            }
            setLoading(false);
        };
        fetchRequest();
    }, [requestId]);

    const handleLanguageChange = async (langCode: string) => {
        setLanguage(langCode);
        if (!request) return;

        if (langCode === 'en') {
            setTranslatedData({ reason: request.reason, destination: request.destination });
            return;
        }

        setTranslating(true);
        const [tReason, tDestination] = await Promise.all([
            translateText(request.reason, LANGUAGES.find(l => l.code === langCode)?.name || 'English'),
            translateText(request.destination, LANGUAGES.find(l => l.code === langCode)?.name || 'English')
        ]);
        setTranslatedData({ reason: tReason, destination: tDestination });
        setTranslating(false);
    };

    const handleAction = async (action: 'VERIFIED' | 'REJECTED_BY_PARENT') => {
        setLoading(true);
        const success = await updateParentVerificationStatus(requestId, action);
        if (success) {
            setActionTaken(action === 'VERIFIED' ? 'APPROVED' : 'REJECTED');
        } else {
            alert("Failed to update status. Please try again.");
        }
        setLoading(false);
    };

    if (loading && !request) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Request Not Found</h2>
                    <p className="text-gray-600">This link may be invalid or expired.</p>
                </div>
            </div>
        );
    }

    if (actionTaken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    {actionTaken === 'APPROVED' ? (
                        <div className="text-green-600 mb-4 flex justify-center"><CheckCircle2 className="w-16 h-16" /></div>
                    ) : (
                        <div className="text-red-600 mb-4 flex justify-center"><XCircle className="w-16 h-16" /></div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {actionTaken === 'APPROVED' ? 'Thank You!' : 'Response Recorded'}
                    </h2>
                    <p className="text-gray-600">
                        {actionTaken === 'APPROVED'
                            ? 'You have approved this outpass request.'
                            : 'You have rejected this outpass request.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center">
                    <h1 className="text-xl font-bold">Parent Approval Required</h1>
                    <p className="text-blue-100 text-sm mt-1">Please review the request below</p>
                </div>

                {/* Language Selector */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Globe className="w-4 h-4" />
                        <span>Select Language:</span>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>

                <div className="p-6 space-y-6">
                    {/* Student Details */}
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{request.fullName}</h3>
                            <p className="text-sm text-gray-600">{request.studentId}</p>
                            <p className="text-xs text-gray-500 mt-1">{request.department} • {request.hostelName}</p>
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Destination
                            </label>
                            <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-100 min-h-[3rem]">
                                {translating ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : translatedData.destination}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> Reason
                            </label>
                            <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-100 min-h-[4rem]">
                                {translating ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : translatedData.reason}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> From
                                </label>
                                <div className="text-sm font-medium text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    {new Date(request.departureTime).toLocaleString()}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> To
                                </label>
                                <div className="text-sm font-medium text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    {new Date(request.returnTime).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAction('REJECTED_BY_PARENT')}
                            disabled={loading || translating}
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-5 h-5" />
                            Don't Send
                        </button>
                        <button
                            onClick={() => handleAction('VERIFIED')}
                            disabled={loading || translating}
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Send (Approve)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
