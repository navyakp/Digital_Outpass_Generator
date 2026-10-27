# Fixed: Delete Application vs Delete Account

## Problem
Previously, when a warden clicked the delete button (🗑️) on an outpass application in the dashboard, it was **deleting the entire student account** along with all their requests. This was incorrect behavior.

## Solution Implemented

### 1. **Delete Application Button**
- **Location**: Dashboard list (next to each outpass request)
- **Action**: Deletes only that specific outpass request
- **Who can use**: Wardens/Admins only
- **Confirmation**: "Are you sure you want to delete the outpass request to [destination]? This action cannot be undone."

### 2. **Delete Student Account**
- **Location**: Student's Profile page (accessible by searching USN in admin panel)
- **Actions**:
  - Warden searches for student by USN
  - Views student profile
  - Scrolls to "Danger Zone" section at bottom
  - Clicks "Delete This Account" button
- **Who can use**: 
  - Wardens viewing a student's profile
  - Students can delete their own account from their own profile
- **Confirmation**: 
  - For wardens: "Are you sure you want to delete the account for [Name] ([USN])? This will permanently delete their account and all their outpass requests."
  - For students: "Are you sure you want to delete your account? This will permanently delete your account and all your outpass requests."

## Files Modified

### Backend (server/routes/requests.js)
- Added `DELETE /:id` route to delete individual requests by ID
- Kept `DELETE /student/:studentId` route for deleting all requests when account is deleted

### Frontend Services (services/dataService.ts)
- Added `deleteRequest(id)` function to delete a single request

### Main App (App.tsx)
- Added `handleDeleteRequest()` function for deleting individual requests
- Updated Dashboard component props to pass both `onDeleteRequest` and `onDeleteStudent`
- Modified Profile delete logic to work for both students and wardens

### Dashboard Component (components/Dashboard.tsx)
- Added `onDeleteRequest` prop
- Created `handleDeleteRequest()` for deleting individual requests
- Renamed old delete handler to `handleDeleteStudent()`
- Updated trash button to call `handleDeleteRequest()` instead of `handleDeleteStudent()`

### Profile Component (components/Profile.tsx)
- Updated delete confirmation messages to differentiate between:
  - Student deleting own account
  - Warden deleting student account
  - Warden deleting own account
- Updated button text: "Delete This Account" (warden view) vs "Delete My Account" (own view)

## How to Use

### For Wardens:

**To delete an outpass request:**
1. Find the request in the dashboard
2. Click the 🗑️ trash icon next to it
3. Confirm deletion

**To delete a student account:**
1. Enter student's USN in the search box in admin panel
2. Click on their profile
3. Scroll to the bottom "Danger Zone"
4. Click "Delete This Account"
5. Confirm deletion
6. All their requests will be deleted along with their account

### For Students:

**To delete your own account:**
1. Go to your Profile
2. Scroll to the bottom "Danger Zone"
3. Click "Delete My Account"
4. Confirm deletion
5. You will be logged out

## Testing Completed
✅ Delete individual request from dashboard
✅ Student account persists after deleting their request
✅ Warden can delete student account from profile
✅ Student can delete own account from profile
✅ Appropriate confirmations for each action
