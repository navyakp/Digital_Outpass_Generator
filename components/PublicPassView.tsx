import React, { useEffect, useState } from 'react';
import { PassCard } from './PassCard';
import { OutpassRequest, PassStatus } from '../types';
import { getRequestById } from '../services/dataService';
import { Loader, AlertCircle, LogIn, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PublicPassViewProps {
    passId: string;
    onLogin: () => void;
}

export const PublicPassView: React.FC<PublicPassViewProps> = ({ passId, onLogin }) => {
    const [pass, setPass] = useState<OutpassRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPass = async () => {
            try {
                const data = await getRequestById(passId);
                if (data) {
                    setPass(data);
                } else {
                    setError('Pass not found or invalid ID.');
                }
            } catch (e) {
                setError('Failed to load pass details.');
            } finally {
                setLoading(false);
            }
        };

        fetchPass();
    }, [passId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-600 font-medium">Verifying Pass...</p>
                </div>
            </div>
        );
    }

    if (error || !pass) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={onLogin}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const getStatusDisplay = () => {
        switch (pass.status) {
            case PassStatus.APPROVED:
                return {
                    text: 'APPROVED',
                    color: 'bg-green-500',
                    icon: <CheckCircle className="w-12 h-12 text-white" />
                };
            case PassStatus.REJECTED:
                return {
                    text: 'REJECTED',
                    color: 'bg-red-500',
                    icon: <XCircle className="w-12 h-12 text-white" />
                };
            case PassStatus.USED:
                return {
                    text: 'ALREADY USED',
                    color: 'bg-gray-500',
                    icon: <CheckCircle className="w-12 h-12 text-white" />
                };
            default:
                return {
                    text: pass.status.toUpperCase(),
                    color: 'bg-yellow-500',
                    icon: <Clock className="w-12 h-12 text-white" />
                };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className="min-h-screen bg-gray-100 pb-8">
            {/* Large Status Banner */}
            <div className={`${statusDisplay.color} text-white py-12 px-4 flex flex-col items-center justify-center shadow-lg mb-8 animate-fade-in`}>
                <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm">
                    {statusDisplay.icon}
                </div>
                <h1 className="text-5xl font-black tracking-tighter uppercase drop-shadow-md text-center">
                    {statusDisplay.text}
                </h1>
                <p className="mt-2 text-white/90 font-medium text-lg">
                    {pass.status === PassStatus.APPROVED ? 'Entry Permitted' : 'Entry Denied'}
                </p>
            </div>

            <div className="max-w-md mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Pass Details</h2>
                    <button
                        onClick={onLogin}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg shadow-sm"
                    >
                        <LogIn className="w-4 h-4" /> Login
                    </button>
                </div>

                <PassCard pass={pass} showQr={false} />

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        This is a public verification page.
                        <br />
                        To perform administrative actions, please login.
                    </p>
                </div>
            </div>
        </div>
    );
};
