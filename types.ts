export enum PassStatus {
  APPLIED = 'Applied',
  UNDER_PROGRESS = 'Under Progress',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  USED = 'Used'
}

export type VerificationStatus = 'PENDING' | 'CALLING' | 'VERIFIED' | 'REJECTED_BY_PARENT';

export interface OutpassRequest {
  id: string;
  fullName: string;
  studentId: string; // USN
  department?: string;
  destination: string; // Place they will visit
  reason: string;
  departureTime: string; // ISO string (From Date/Time)
  returnTime: string; // ISO string (To Date/Time)
  status: PassStatus;
  parentMobile?: string;
  verificationStatus?: VerificationStatus;
  verificationTranscript?: string; // The text log of the AI call
  aiAnalysis?: AIAnalysisResult;
  createdAt: string;
}

export interface AIAnalysisResult {
  category: string;
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskAssessment: string;
  recommendedAction: 'Approve' | 'Review' | 'Reject';
}

export type ViewState = 'DASHBOARD' | 'NEW_REQUEST' | 'PASS_DETAILS' | 'ADMIN_PANEL' | 'SCANNER' | 'PROFILE';

export interface User {
  role: 'STUDENT' | 'ADMIN';
  name: string;
  email: string;
  mobile: string;
  password?: string;
  usn?: string;      // Only for students
  wardenId?: string; // Only for wardens
  department?: string; // Only for students
  hostelName?: string; // Only for students
  parentName?: string; // Only for students
  parentMobile?: string; // Only for students
  parentMobile2?: string; // Only for students
}