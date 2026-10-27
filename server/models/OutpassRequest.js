import mongoose from 'mongoose';

const outpassRequestSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID for compatibility with frontend UUIDs
    fullName: { type: String, required: true },
    studentId: { type: String, required: true },
    department: { type: String, required: false },
    destination: { type: String, required: true },
    reason: { type: String, required: true },
    departureTime: { type: String, required: true },
    returnTime: { type: String, required: true },
    status: {
        type: String,
        enum: ['Applied', 'Under Progress', 'Approved', 'Rejected', 'Used'],
        default: 'Applied'
    },
    parentMobile: { type: String },
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'CALLING', 'VERIFIED', 'REJECTED_BY_PARENT'],
        default: 'PENDING'
    },
    verificationTranscript: { type: String },
    aiAnalysis: {
        category: String,
        urgencyLevel: String,
        riskAssessment: String,
        recommendedAction: String
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('OutpassRequest', outpassRequestSchema);
