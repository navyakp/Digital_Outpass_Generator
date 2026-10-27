import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { OutpassRequest, PassStatus, VerificationStatus } from '../types';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, ShieldCheck, Download, Loader, CheckCircle2, Phone, Bot, PhoneCall, Mic2, FileText, AlertTriangle, Copy } from 'lucide-react';

interface PassCardProps {
  pass: OutpassRequest;
  onDownload?: () => void;
  showQr?: boolean;
  onVerifyParent?: () => void; // Trigger for AI verification
  onManualVerifyParent?: () => void; // Trigger for manual verification
}

export const PassCard: React.FC<PassCardProps> = ({ pass, onDownload, showQr = true, onVerifyParent, onManualVerifyParent }) => {
  const getStatusColor = (status: PassStatus) => {
    switch (status) {
      case PassStatus.APPROVED: return 'bg-green-100/90 text-green-800 border-green-200';
      case PassStatus.REJECTED: return 'bg-red-100/90 text-red-800 border-red-200';
      case PassStatus.UNDER_PROGRESS: return 'bg-blue-100/90 text-blue-800 border-blue-200';
      case PassStatus.USED: return 'bg-gray-100/90 text-gray-600 border-gray-200';
      case PassStatus.APPLIED: default: return 'bg-yellow-100/90 text-yellow-800 border-yellow-200';
    }
  };

  const isApproved = pass.status === PassStatus.APPROVED;
  const isUsed = pass.status === PassStatus.USED;

  return (
    <div className={`max-w-md mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/40 transform transition-all hover:scale-[1.01] ${isUsed ? 'grayscale-[0.5] opacity-90' : ''}`}>
      {/* Header */}
      <div className={`p-6 text-white text-center relative overflow-hidden ${isApproved ? 'bg-gradient-to-r from-blue-600/90 to-indigo-700/90' : isUsed ? 'bg-gray-600/90' : 'bg-gray-700/90'} backdrop-blur-sm`}>
        <div className="relative z-10 flex flex-col items-center">
          <img src="/alvas_logo.png" alt="Alva's Logo" className="h-20 mb-3 drop-shadow-md" />
          <h2 className="text-xl font-bold tracking-wide uppercase shadow-sm">Outpass</h2>
          <p className="text-blue-50 text-sm mt-1 font-medium">
            {isApproved ? 'Official Outpass Document' : isUsed ? 'Archived Pass' : 'Request Details'}
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-white opacity-20 rounded-full"></div>
        <div className="absolute bottom-[-10px] right-[-10px] w-16 h-16 bg-white opacity-20 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">

        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 shadow-sm ${getStatusColor(pass.status)}`}>
            {pass.status === PassStatus.APPROVED && <CheckCircle className="w-4 h-4" />}
            {pass.status === PassStatus.REJECTED && <XCircle className="w-4 h-4" />}
            {pass.status === PassStatus.UNDER_PROGRESS && <Loader className="w-4 h-4 animate-spin" />}
            {pass.status === PassStatus.APPLIED && <Clock className="w-4 h-4" />}
            {pass.status === PassStatus.USED && <CheckCircle2 className="w-4 h-4" />}
            {pass.status}
          </span>
        </div>

        {/* QR Code Section */}
        {isApproved && showQr && (
          <div className="flex flex-col items-center justify-center py-4 bg-white/60 rounded-lg border border-dashed border-gray-400">
            <QRCodeSVG value={`${window.location.origin}?view=status&id=${pass.id}`} size={140} level="H" />
            <p className="text-xs text-gray-600 mt-2 font-mono font-bold">{pass.id.split('-')[0]}</p>
          </div>
        )}

        {isUsed && (
          <div className="flex flex-col items-center justify-center py-8 bg-gray-100 rounded-lg border border-gray-200">
            <CheckCircle2 className="w-16 h-16 text-gray-400 mb-2" />
            <p className="text-gray-500 font-bold uppercase tracking-wider">Already Used</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">Reason</p>
            <p className="font-bold text-gray-900">{pass.reason}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">Student Name</p>
            <p className="font-bold text-gray-900 truncate">{pass.fullName}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">Student ID</p>
            <p className="font-bold text-gray-900">{pass.studentId}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">Place (Destination)</p>
            <p className="font-bold text-gray-900">{pass.destination}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">From</p>
            <p className="font-bold text-gray-900">{format(new Date(pass.departureTime), 'MMM d, h:mm a')}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">To</p>
            <p className="font-bold text-gray-900">{format(new Date(pass.returnTime), 'MMM d, h:mm a')}</p>
          </div>
        </div>

        {/* Parent Verification Section (Admin/Warden View Only usually, but shown if data exists) */}
        {pass.parentMobile && (
          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Parent Mobile</p>
                  <p className="text-sm font-semibold text-gray-900">{pass.parentMobile}</p>
                </div>
              </div>

              {/* Status Indicator */}
              {pass.verificationStatus === 'VERIFIED' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> AI Verified
                </span>
              )}
              {pass.verificationStatus === 'REJECTED_BY_PARENT' && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Denied
                </span>
              )}
            </div>

            {/* AI Call Interface */}
            {(onVerifyParent || onManualVerifyParent) && pass.verificationStatus !== 'VERIFIED' && pass.verificationStatus !== 'REJECTED_BY_PARENT' && (
              <div className="mt-3 space-y-2">
                {pass.verificationStatus === 'CALLING' ? (
                  <div className="bg-black/80 text-green-400 p-3 rounded-lg font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-2">
                      <span className="flex items-center gap-2 animate-pulse">
                        <PhoneCall className="w-3 h-3" /> Calling Parent...
                      </span>
                      <Mic2 className="w-3 h-3 text-red-500 animate-pulse" />
                    </div>
                    <div className="space-y-1 opacity-80 h-16 overflow-hidden relative">
                      <p>[SYSTEM]: Dialing +91-{pass.parentMobile}...</p>
                      <p>[AI]: Connecting to Voice Gateway...</p>
                      <p className="text-white">[AI]: Hello, this is the Automated Warden System...</p>
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Manual Verification & Copy Link */}
                    {onManualVerifyParent && (
                      <div className="flex gap-2">
                        <button
                          onClick={onManualVerifyParent}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Manual Verify
                        </button>
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}?view=parent&requestId=${pass.id}`;
                            navigator.clipboard.writeText(link);
                            alert("Parent Approval Link copied to clipboard!\n\nShare this link with the parent via WhatsApp/SMS.");
                          }}
                          className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                          title="Copy Parent Approval Link"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </button>
                      </div>
                    )}

                    {/* AI Call - SECONDARY OPTION (May be offline) */}
                    {onVerifyParent && (
                      <button
                        onClick={onVerifyParent}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm opacity-75"
                      >
                        <Bot className="w-3 h-3" />
                        AI Call (May be offline)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Transcript Display */}
            {pass.verificationTranscript && (
              <div className="mt-3">
                <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3" /> Call Transcript
                </p>
                <div className="bg-white/80 p-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-700 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {pass.verificationTranscript}
                </div>
                {pass.verificationStatus === 'REJECTED_BY_PARENT' && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4" /> Parent denied permission.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Security Footer */}
        <div className="pt-4 border-t border-gray-300/50 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-gray-600" />
            <span>Secure System</span>
          </div>
          <span>Applied: {format(new Date(pass.createdAt), 'dd/MM/yyyy')}</span>
        </div>
      </div>

      {/* Action Button */}
      {onDownload && isApproved && showQr && (
        <button
          onClick={onDownload}
          className="w-full py-3 bg-gray-50/60 hover:bg-gray-100/70 text-gray-800 font-bold text-sm border-t border-gray-300/50 flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
        >
          <Download className="w-4 h-4" /> Download Pass
        </button>
      )}
    </div>
  );
};