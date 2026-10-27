# AI Call Replaced with Offline Message

## Summary
Replaced the AI parent verification call feature with a clear offline message when no Gemini API key is configured. Manual verification is now the primary recommended option.

## Changes Made

### 1. **services/geminiService.ts**
- **Updated `simulateParentCall` function**
- When no API key is available, returns:
  ```
  approved: false
  transcript: "[SYSTEM OFFLINE]: AI Voice Gateway is currently unavailable (API key not configured).
  
  Please use "Manual Verify Parent" option to proceed with parent verification via phone or in-person contact."
  ```
- Removed the old fallback simulation that auto-approved requests

### 2. **App.tsx**
- **Enhanced `handleAIVerification` function**
- Detects when AI returns offline message
- Shows user-friendly alert: `⚠️ AI Call Service Offline`
- Automatically resets verification status to PENDING
- Updated error message to suggest manual verification

### 3. **components/PassCard.tsx**
- **Reordered verification buttons** (Manual is now PRIMARY):
  1. **Manual Verify (Phone/In-Person)** ← Green button, prominent
  2. **AI Call (May be offline)** ← Gray button, smaller, with warning
- Improved button styling to guide wardens to use manual verification

## User Experience

### Before:
- AI call would fail or show confusing errors
- Manual verification was hidden/secondary
- No clear indication that AI was offline

### After:
1. Warden clicks "Mark Under Progress"
2. Sees **two clear options**:
   - ✅ **Manual Verify (Phone/In-Person)** - Green, prominent (RECOMMENDED)
   - 🤖 **AI Call (May be offline)** - Gray, smaller
3. If they try AI call without API key:
   - Clear popup: "AI Call Service Offline"
   - Explains API is not configured
   - Directs them to use Manual Verify
4. Manual verification:
   - Instantly marks as verified
   - Adds note: "Manually verified by Warden (Parent contacted via phone/in-person)"
   - Can proceed to approve request

## Benefits
✅ **No confusion** - Clear offline message instead of errors  
✅ **Primary workflow** - Manual verification is the default option  
✅ **Optional AI** - AI features can be enabled later by adding API key  
✅ **Better UX** - Wardens know exactly what to do  

## To Enable AI Features (Optional)
If you want to enable AI call simulation and translations:
1. Get API key from https://aistudio.google.com/app/apikey
2. Edit `.env` file
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key
4. Restart the server
