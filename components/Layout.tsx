import React from 'react';
import { User, ViewState } from '../types';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Shield, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  currentView,
  onChangeView,
  onLogout
}) => {
  return (
    <div
      className="min-h-screen md:flex bg-cover bg-center bg-fixed bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: 'url("/background.jpg")' }}
    >
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-white/40 fixed h-full z-20 shadow-xl">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <a href="https://aiet.org.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm overflow-hidden p-1 hover:shadow-md transition-shadow">
              <img src="alvas_logo.png" alt="Logo" className="w-full h-full object-contain" />
            </a>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Outpass</span>
          </div>
          {(currentView !== 'DASHBOARD' && currentView !== 'ADMIN_PANEL') && (
            <button
              onClick={() => {
                if (currentView === 'PROFILE') {
                  onChangeView(user.role === 'ADMIN' ? 'ADMIN_PANEL' : 'DASHBOARD');
                } else if (currentView === 'NEW_REQUEST' || currentView === 'PASS_DETAILS') {
                  onChangeView('DASHBOARD');
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </button>
          )}
        </div>

        <div className="px-6 py-4 bg-blue-50/60 border-b border-blue-100/30 cursor-pointer hover:bg-blue-100/50 transition-colors" onClick={() => onChangeView('PROFILE')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-200/80 flex items-center justify-center text-blue-700">
              <UserIcon className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-gray-900 truncate text-sm">{user.name}</p>
              <p className="text-xs text-gray-700 uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-1 flex-1">
          <button
            onClick={() => onChangeView('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === 'DASHBOARD'
              ? 'bg-blue-100/70 text-blue-800 shadow-sm'
              : 'text-gray-700 hover:bg-white/60'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          {user.role === 'STUDENT' && (
            <button
              onClick={() => onChangeView('NEW_REQUEST')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === 'NEW_REQUEST'
                ? 'bg-blue-100/70 text-blue-800 shadow-sm'
                : 'text-gray-700 hover:bg-white/60'
                }`}
            >
              <PlusCircle className="w-5 h-5" />
              New Request
            </button>
          )}

          {user.role === 'ADMIN' && (
            <button
              onClick={() => onChangeView('ADMIN_PANEL')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === 'ADMIN_PANEL'
                ? 'bg-blue-100/70 text-blue-800 shadow-sm'
                : 'text-gray-700 hover:bg-white/60'
                }`}
            >
              <Shield className="w-5 h-5" />
              Pending Approvals
            </button>
          )}
        </div>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50/70 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-xl border-b border-white/40 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          {(currentView !== 'DASHBOARD' && currentView !== 'ADMIN_PANEL') && (
            <button
              onClick={() => {
                if (currentView === 'PROFILE') {
                  onChangeView(user.role === 'ADMIN' ? 'ADMIN_PANEL' : 'DASHBOARD');
                } else if (currentView === 'NEW_REQUEST' || currentView === 'PASS_DETAILS') {
                  onChangeView('DASHBOARD');
                }
              }}
              className="p-2 text-gray-700 hover:bg-white/40 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}
          <a href="https://aiet.org.in" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm overflow-hidden p-1 hover:shadow-md transition-shadow">
            <img src="alvas_logo.png" alt="Logo" className="w-full h-full object-contain" />
          </a>
          <span className="font-bold text-lg text-gray-900">Outpass</span>
        </div>
        <button onClick={onLogout} className="p-2 text-gray-700 hover:bg-white/40 rounded-full">
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {children}

          {/* Watermark / Footer */}
          <footer className="mt-12 py-6 text-center text-gray-500 text-sm border-t border-gray-200/50">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="/alvas_logo.png" alt="Logo" className="w-5 h-5 opacity-50 grayscale" />
              <span className="font-semibold opacity-75">Alva's Smart Campus Initiative</span>
            </div>
            <p className="text-xs opacity-60">Innovating Campus Life • 2025</p>
          </footer>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/40 px-6 py-3 flex items-center justify-around z-30 pb-safe shadow-lg">
        <button
          onClick={() => onChangeView('DASHBOARD')}
          className={`flex flex-col items-center gap-1 ${currentView === 'DASHBOARD' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        {user.role === 'STUDENT' && (
          <button
            onClick={() => onChangeView('NEW_REQUEST')}
            className={`flex flex-col items-center gap-1 ${currentView === 'NEW_REQUEST' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">New</span>
          </button>
        )}
        {user.role === 'ADMIN' && (
          <button
            onClick={() => onChangeView('ADMIN_PANEL')}
            className={`flex flex-col items-center gap-1 ${currentView === 'ADMIN_PANEL' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <Shield className="w-6 h-6" />
            <span className="text-[10px] font-medium">Review</span>
          </button>
        )}
      </div>
    </div>
  );
};