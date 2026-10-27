import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, Phone, Building, Hash, Users, Save, Edit2, ChevronLeft, Trash2 } from 'lucide-react';

interface ProfileProps {
    user: User;
    onUpdateUser: (updatedUser: User) => Promise<void>;
    onBack?: () => void;
    onDeleteAccount?: () => void;
    canEdit?: boolean;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onBack, onDeleteAccount }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdateUser(formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        const isWardenViewingStudent = onBack && user.role === 'STUDENT';
        const confirmMessage = isWardenViewingStudent
            ? `Are you sure you want to delete the account for ${user.name} (${user.usn})?\n\nThis will permanently delete:\n• Their account\n• All their outpass requests\n\nThis action cannot be undone!`
            : user.role === 'STUDENT'
                ? `Are you sure you want to delete your account?\n\nThis will permanently delete:\n• Your account (${user.usn})\n• All your outpass requests\n\nThis action cannot be undone!`
                : `Are you sure you want to delete your warden account? This will permanently delete your account and log you out.`;

        if (window.confirm(confirmMessage)) {
            if (onDeleteAccount) {
                onDeleteAccount();
            }
        }
    };

    const canEdit = user.role === 'ADMIN';

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm mr-2"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-blue-100 opacity-90">{user.role === 'ADMIN' ? 'Warden / Admin' : 'Student'}</p>
                        </div>
                    </div>
                    {canEdit && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                            title="Edit Profile"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2 mb-4">Personal Details</h3>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role Specific Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2 mb-4">
                                {user.role === 'STUDENT' ? 'Academic & Hostel' : 'Warden Details'}
                            </h3>

                            {user.role === 'STUDENT' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">USN / Student ID</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="usn"
                                                value={formData.usn || ''}
                                                onChange={handleChange}
                                                disabled={true}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Hostel Name &amp; Room</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="hostelName"
                                                value={formData.hostelName || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="Hostel Name - Room No"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {user.role === 'ADMIN' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Warden ID</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="wardenId"
                                            value={formData.wardenId || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Parent Info (Student Only) */}
                    {user.role === 'STUDENT' && (
                        <div className="col-span-1 md:col-span-2 space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2 mb-4">Parent / Guardian Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Parent Name</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="parentName"
                                            value={formData.parentName || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Parent Mobile</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="parentMobile"
                                            value={formData.parentMobile || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Parent Mobile 2 (Optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="parentMobile2"
                                            value={formData.parentMobile2 || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(user);
                                    setIsEditing(false);
                                }}
                                className="px-6 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (<>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>)}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Delete Account Section - For Both Students and Wardens */}
            {onDeleteAccount && !isEditing && (
                <div className="px-8 pb-8">
                    <div className="border-t border-gray-200 pt-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Danger Zone
                            </h3>
                            <p className="text-sm text-red-700 mb-4">
                                {onBack && user.role === 'STUDENT'
                                    ? `Once you delete this student's account, there is no going back. This will permanently delete their account and all their outpass requests.`
                                    : user.role === 'STUDENT'
                                        ? 'Once you delete your account, there is no going back. This will permanently delete your account and all your outpass requests.'
                                        : 'Once you delete your warden account, there is no going back. This will permanently delete your account and logout immediately.'}
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {onBack && user.role === 'STUDENT' ? 'Delete This Account' : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
