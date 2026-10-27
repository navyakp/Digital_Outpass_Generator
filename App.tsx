import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RequestForm } from './components/RequestForm';
import { PassCard } from './components/PassCard';
import { AuthPage } from './components/AuthPage';
import { QRScanner } from './components/QRScanner';
import { ParentApproval } from './components/ParentApproval';
import { PublicPassView } from './components/PublicPassView';
import { Profile } from './components/Profile';
import { User, ViewState, OutpassRequest, PassStatus, VerificationStatus } from './types';
import { getRequests, createRequest, updateRequestStatus, verifyPassEntry, updateRequest, getRequestById, deleteStudentRequests, deleteRequest } from './services/dataService';
import { updateUser, getUserByUSN, deleteUser } from './services/authService';
import { simulateParentCall } from './services/geminiService';
import { downloadPassAsPDF } from './services/pdfService';
import { ArrowLeft, Check, X, Loader, QrCode } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [requests, setRequests] = useState<OutpassRequest[]>([]);
  const [selectedPass, setSelectedPass] = useState<OutpassRequest | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean, message: string } | null>(null);
  const [adminQrVisible, setAdminQrVisible] = useState(false);
  const [parentRequestId, setParentRequestId] = useState<string | null>(null);
  const [publicPassId, setPublicPassId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for parent approval link
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const requestIdParam = params.get('requestId');

    if (viewParam === 'parent' && requestIdParam) {
      setParentRequestId(requestIdParam);
      return; // Skip normal auth check
    }

    if (viewParam === 'status' && requestIdParam) {
      setPublicPassId(requestIdParam);
      return;
    }

    // Note: Removed automatic login from localStorage for security
    // Users must explicitly log in each time they open the application
  }, []);

  // Auto-logout after 10 minutes of inactivity
  useEffect(() => {
    if (!user) return; // No need to set timer when no user is logged in
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Perform logout due to inactivity
        handleLogout();
        alert('Logged out due to inactivity (10 minutes).');
      }, 10 * 60 * 1000); // 10 minutes
    };
    // List of events that indicate activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));
    // Initialize timer
    resetTimer();
    // Cleanup on unmount or when user changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  // Parent View Render
  if (parentRequestId) {
    return <ParentApproval requestId={parentRequestId} />;
  }

  // Public Pass View
  if (publicPassId) {
    return <PublicPassView passId={publicPassId} onLogin={() => {
      setPublicPassId(null);
      window.history.pushState({}, '', '/'); // Clear URL params
    }} />;
  }

  // Load requests when user or view changes
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const data = await getRequests(user);
        setRequests(data);
      }
    };
    loadData();
  }, [user, view]);

  // Handle Login
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView(loggedInUser.role === 'ADMIN' ? 'ADMIN_PANEL' : 'DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setView('DASHBOARD');
    setSelectedPass(null);
    setRequests([]);
    // Clean up any stale session data
    localStorage.removeItem('outpass_user');
  };

  const handleSubmitRequest = async (request: OutpassRequest) => {
    await createRequest(request);
    // Refresh data
    if (user) {
      const data = await getRequests(user);
      setRequests(data);
    }
    setView('DASHBOARD');
  };

  const handleSelectPass = (pass: OutpassRequest) => {
    setSelectedPass(pass);
    setAdminQrVisible(false);
    setView('PASS_DETAILS');
  };

  const handleUpdateStatus = async (id: string, status: PassStatus) => {
    try {
      const updatedRequest = await updateRequestStatus(id, status);

      if (updatedRequest) {
        // Update local list
        if (user) {
          const data = await getRequests(user);
          setRequests(data);
        }

        // If viewing details, update that too
        if (selectedPass && selectedPass.id === id) {
          setSelectedPass(updatedRequest);
        }

        // Simulate SMS Notification on Approval
        if (status === PassStatus.APPROVED) {
          const mobile = updatedRequest.parentMobile || "Parent's Mobile";
          // Use setTimeout to allow the UI to update first
          setTimeout(() => {
            alert(`SMS sent to parent (${mobile}): "Your son/daughter ${updatedRequest.fullName} is permitted to go to ${updatedRequest.destination}."`);
          }, 500);
        }
      } else {
        alert("Failed to update status. Server returned no data.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status.");
    }
  };

  const handleAIVerification = async (passId: string) => {
    if (!selectedPass || !selectedPass.parentMobile) return;

    // 1. Set status to Calling
    let updatedPass = { ...selectedPass, verificationStatus: 'CALLING' as VerificationStatus };
    setSelectedPass(updatedPass);

    // In a real app, we would save this state to DB so refresh doesn't break it
    // updateRequest(updatedPass); 

    try {
      // 2. Perform AI Simulation
      const result = await simulateParentCall(
        selectedPass.fullName,
        selectedPass.destination,
        selectedPass.reason,
        selectedPass.parentMobile
      );

      // Check if AI is offline (not approved and has offline message)
      if (!result.approved && result.transcript.includes('SYSTEM OFFLINE')) {
        // Show offline message and reset to pending
        alert('⚠️ AI Call Service Offline\n\n' + result.transcript);
        setSelectedPass({ ...selectedPass, verificationStatus: 'PENDING' });
        return;
      }

      // 3. Update Result
      const finalStatus: VerificationStatus = result.approved ? 'VERIFIED' : 'REJECTED_BY_PARENT';

      updatedPass = {
        ...updatedPass,
        verificationStatus: finalStatus,
        verificationTranscript: result.transcript
      };

      // Update persistent storage
      await updateRequest(updatedPass);
      if (user) {
        const data = await getRequests(user);
        setRequests(data);
      }

      setSelectedPass(updatedPass);

    } catch (e) {
      console.error(e);
      alert("AI Verification Failed. Please try again or use Manual Verification.");
      setSelectedPass({ ...selectedPass, verificationStatus: 'PENDING' });
    }
  };

  const handleManualVerification = async (passId: string) => {
    if (!selectedPass) return;

    let updatedPass = {
      ...selectedPass,
      verificationStatus: 'VERIFIED' as VerificationStatus,
      verificationTranscript: "Manually verified by Warden (Parent contacted via phone/in-person)."
    };

    // Update persistent storage
    await updateRequest(updatedPass);
    if (user) {
      const data = await getRequests(user);
      setRequests(data);
    }

    setSelectedPass(updatedPass);
  };

  const handleQRScan = async (decodedText: string) => {
    try {
      let passId = '';

      // Try parsing as JSON first (legacy support)
      try {
        const data = JSON.parse(decodedText);
        if (data.id) passId = data.id;
      } catch (e) {
        // Not JSON, check if it's a URL
        try {
          const url = new URL(decodedText);
          const id = url.searchParams.get('id');
          if (id) passId = id;
        } catch (e2) {
          // Not a URL either, maybe just the ID string?
          // For safety, let's assume if it's a simple string it might be an ID if we want to support that, 
          // but for now let's stick to URL or JSON.
        }
      }

      if (!passId) throw new Error("Invalid QR Code");

      const result = await verifyPassEntry(passId);
      setScanResult({ success: result.success, message: result.message });

      // If valid, show the pass details
      if (result.pass) {
        setSelectedPass(result.pass);
        if (user) {
          const data = await getRequests(user);
          setRequests(data);
        }
      }

      setView('PASS_DETAILS');

    } catch (e) {
      setScanResult({ success: false, message: "Failed to read QR Code. Invalid format." });
      setView('DASHBOARD');
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const handleSearchStudent = (usn: string) => {
    const student = getUserByUSN(usn);
    if (student) {
      setViewingUser(student);
      setView('PROFILE');
    } else {
      alert("Student not found with this USN.");
    }
  };



  const handleDeleteStudent = async (usn: string) => {
    // First, delete all associated requests from MongoDB
    await deleteStudentRequests(usn);

    // Then delete the user account
    const result = deleteUser(usn);
    if (result.success) {
      alert(result.message);
      // Refresh the requests list to remove deleted student's requests
      if (user) {
        const data = await getRequests(user);
        setRequests(data);
      }
      // If we were viewing this student's profile, go back to admin panel
      if (viewingUser && viewingUser.usn === usn) {
        setViewingUser(null);
        setView('ADMIN_PANEL');
      }
    } else {
      alert(result.message);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    const success = await deleteRequest(id);
    if (success) {
      // Refresh requests
      if (user) {
        const data = await getRequests(user);
        setRequests(data);
      }
    } else {
      alert("Failed to delete request");
    }
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (scanResult && view !== 'SCANNER') {
      // Increase timeout for better visibility
      setTimeout(() => setScanResult(null), 4000);
    }

    // Large Overlay for Scan Result
    const renderScanOverlay = () => {
      if (!scanResult) return null;

      const isSuccess = scanResult.success;
      // Determine if it's an approval or rejection based on message content or logic
      // Ideally we'd have a status enum in scanResult, but message parsing works for now
      const isRejection = scanResult.message.toLowerCase().includes('rejected') || scanResult.message.toLowerCase().includes('denied');
      const isUsed = scanResult.message.toLowerCase().includes('used');

      let bgColor = 'bg-green-500';
      let title = 'APPROVED';
      let icon = <Check className="w-24 h-24 text-white" />;

      if (!isSuccess || isRejection) {
        bgColor = 'bg-red-500';
        title = 'REJECTED';
        icon = <X className="w-24 h-24 text-white" />;
      } else if (isUsed) {
        bgColor = 'bg-gray-600';
        title = 'ALREADY USED';
        icon = <Check className="w-24 h-24 text-white" />;
      }

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`${bgColor} w-full max-w-lg mx-4 rounded-3xl shadow-2xl overflow-hidden text-white p-12 flex flex-col items-center text-center relative`}>
            <button
              onClick={() => setScanResult(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-md shadow-inner">
              {icon}
            </div>

            <h2 className="text-6xl font-black tracking-tighter mb-4 drop-shadow-lg">
              {title}
            </h2>

            <p className="text-xl font-medium opacity-90 max-w-xs mx-auto leading-relaxed">
              {scanResult.message}
            </p>

            <div className="mt-8 w-full">
              <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/50 animate-progress origin-left" style={{ animationDuration: '4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    switch (view) {
      case 'PROFILE':
        const profileUser = viewingUser || user;
        return (
          <Profile
            user={profileUser}
            onBack={viewingUser ? () => {
              setViewingUser(null);
              setView('ADMIN_PANEL');
            } : undefined}
            onUpdateUser={async (updatedUser) => {
              const success = await updateUser(updatedUser);
              if (success) {
                if (viewingUser && viewingUser.usn === updatedUser.usn) {
                  setViewingUser(updatedUser);
                } else if (user.role === updatedUser.role && (user.usn === updatedUser.usn || user.wardenId === updatedUser.wardenId)) {
                  setUser(updatedUser);
                }
                alert("Profile updated successfully!");
              } else {
                alert("Failed to update profile.");
              }
            }}
            onDeleteAccount={
              // Show delete button if:
              // 1. Student viewing their own profile
              // 2. Warden viewing a student's profile
              (profileUser.role === 'STUDENT' && !viewingUser) || // Student's own profile
                (viewingUser && viewingUser.role === 'STUDENT')    // Warden viewing student
                ? async () => {
                  if (profileUser.usn) {
                    await handleDeleteStudent(profileUser.usn);
                    // If student deleting their own account, log them out
                    if (!viewingUser) {
                      handleLogout();
                    }
                    // If warden deleted a student, go back to admin panel
                    if (viewingUser) {
                      setViewingUser(null);
                      setView('ADMIN_PANEL');
                    }
                  }
                }
                : undefined
            }
          />
        );

      case 'SCANNER':
        if (user.role !== 'ADMIN') return null;
        return (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setView('DASHBOARD')}
          />
        );

      case 'NEW_REQUEST':
        return (
          <RequestForm
            user={user}
            onSubmit={handleSubmitRequest}
            onCancel={() => setView('DASHBOARD')}
          />
        );

      case 'PASS_DETAILS':
        if (!selectedPass) return null;
        return (
          <div className="space-y-6 animate-fade-in relative">
            {renderScanOverlay()}

            <button
              onClick={() => {
                setView(user.role === 'ADMIN' ? 'ADMIN_PANEL' : 'DASHBOARD');
                setScanResult(null);
              }}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4 font-medium drop-shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>

            <PassCard
              pass={selectedPass}
              onDownload={() => downloadPassAsPDF(selectedPass)}
              showQr={user.role === 'STUDENT' || adminQrVisible}
              onVerifyParent={user.role === 'ADMIN' && selectedPass.status === PassStatus.UNDER_PROGRESS ? () => handleAIVerification(selectedPass.id) : undefined}
              onManualVerifyParent={user.role === 'ADMIN' && selectedPass.status === PassStatus.UNDER_PROGRESS ? () => handleManualVerification(selectedPass.id) : undefined}
            />

            {/* Admin Actions */}
            {user.role === 'ADMIN' && (
              <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Warden Controls</h3>

                {/* AI Insight for Admin */}
                {selectedPass.aiAnalysis && selectedPass.status === PassStatus.APPLIED && (
                  <div className="mb-4 p-3 bg-purple-50 text-purple-900 rounded-lg text-sm">
                    <p className="font-bold mb-1">AI Recommendation: {selectedPass.aiAnalysis.recommendedAction}</p>
                    <p>{selectedPass.aiAnalysis.riskAssessment}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  {/* Flow: Applied -> Under Progress -> Approved/Rejected */}

                  {selectedPass.status === PassStatus.APPLIED && (
                    <button
                      onClick={() => handleUpdateStatus(selectedPass.id, PassStatus.UNDER_PROGRESS)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium"
                    >
                      <Loader className="w-4 h-4" /> Mark Under Progress
                    </button>
                  )}

                  {(selectedPass.status === PassStatus.UNDER_PROGRESS || selectedPass.status === PassStatus.APPLIED) && (
                    <div className="flex flex-col gap-3 mt-1">
                      {/* Requirement: Cannot approve until parent is verified */}
                      {selectedPass.parentMobile && selectedPass.verificationStatus !== 'VERIFIED' && (
                        <p className="text-xs text-orange-600 font-bold bg-orange-50 p-2 rounded text-center">
                          Request Parent Verification via AI Call to Approve.
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateStatus(selectedPass.id, PassStatus.REJECTED)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-medium"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedPass.id, PassStatus.APPROVED)}
                          disabled={!!selectedPass.parentMobile && selectedPass.verificationStatus !== 'VERIFIED'}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If Admin manually wants to verify without scanning (fallback) */}
                  {selectedPass.status === PassStatus.APPROVED && (
                    <div className="flex gap-3 mt-1">
                      {!adminQrVisible ? (
                        <button
                          onClick={() => setAdminQrVisible(true)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium"
                        >
                          <QrCode className="w-4 h-4" /> Generate QR
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 font-medium cursor-default">
                          <Check className="w-4 h-4" /> QR Generated
                        </div>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(selectedPass.id, PassStatus.USED)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 shadow-sm font-medium"
                      >
                        <Check className="w-4 h-4" /> Mark Used
                      </button>
                    </div>
                  )}

                  {(selectedPass.status === PassStatus.USED || selectedPass.status === PassStatus.REJECTED) && (
                    <p className="text-center text-gray-500 text-sm italic">This request has been finalized.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'ADMIN_PANEL':
        if (user.role !== 'ADMIN') return null;
        // Filter out Approved, Rejected, and Used requests for the "Pending Approvals" view
        const pendingRequests = requests.filter(req =>
          req.status !== PassStatus.APPROVED &&
          req.status !== PassStatus.REJECTED &&
          req.status !== PassStatus.USED
        );

        return (
          <div className="space-y-8 relative">
            {renderScanOverlay()}
            <Dashboard
              requests={pendingRequests}
              user={user}
              onSelectPass={handleSelectPass}
              onSearchStudent={handleSearchStudent}
              onDeleteStudent={handleDeleteStudent}
              onDeleteRequest={handleDeleteRequest}
              title="Pending Student Requests"
            />
          </div>
        );

      case 'DASHBOARD':
      default:
        return (
          <div className="space-y-8 relative">
            {renderScanOverlay()}
            <Dashboard
              requests={requests}
              user={user}
              onSelectPass={handleSelectPass}
              onDeleteStudent={user.role === 'ADMIN' ? handleDeleteStudent : undefined}
              onDeleteRequest={user.role === 'ADMIN' ? handleDeleteRequest : undefined}
            />
          </div>
        );
    }
  };

  return (
    <Layout
      user={user}
      currentView={view}
      onChangeView={setView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;