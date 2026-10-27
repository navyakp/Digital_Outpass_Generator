# Outpass - Digital Outpass System

A modern digital outpass management system for educational institutions.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or remote connection)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/outpass_db
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running the Application

#### Option 1: Run Everything Together (Recommended)
```bash
npm run start:all
```
or
```bash
./start.sh
```

This will start both the backend server (port 5001) and frontend dev server.

#### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Default Login Credentials

**Student Account:**
- USN: `S2023001`
- Password: `password123`

**Warden/Admin Account:**
- Warden ID: `W001`
- Password: `admin`

## 📝 Features

- ✅ Student outpass request management
- ✅ Warden approval workflow
- ✅ AI-powered request analysis
- ✅ Parent verification system
- ✅ QR code generation for approved passes
- ✅ Account management (students can delete their own accounts)
- ✅ Profile management
- ✅ MongoDB integration for persistent storage

## 🛠️ Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Lucide React Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Google Gemini AI

## 📱 Usage

1. **Students** can:
   - Register new account
   - Apply for outpass
   - View outpass history
   - Update profile
   - Delete account

2. **Wardens** can:
   - Review outpass requests
   - Approve/reject requests
   - Verify parent consent
   - Delete student accounts
   - View all requests

## 🔧 Troubleshooting

### "Load failed" error when submitting requests

This means the backend server is not running. Make sure to:
1. Run `npm run server` in a separate terminal, OR
2. Use `npm run start:all` to run both frontend and backend

### MongoDB connection error

1. Make sure MongoDB is running locally
2. Check your `.env` file has the correct `MONGODB_URI`

## 📄 License

MIT License
