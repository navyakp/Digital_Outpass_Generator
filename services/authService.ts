import { User } from '../types';

const STORAGE_KEY = 'outpass_users';
// Temporary in-memory storage for OTPs (Simulation)
const otpStore: Record<string, string> = {};

// Seed initial users if empty
const seedUsers = () => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const defaultUsers: User[] = [
        {
          role: 'STUDENT',
          name: 'Alice Johnson',
          email: 'alice@college.edu',
          mobile: '9876543210',
          usn: 'S2023001',
          password: 'password123',
          department: 'Computer Science',
          hostelName: 'Block A',
          parentName: 'Robert Johnson',
          parentMobile: '9988776655'
        },
        {
          role: 'ADMIN',
          name: 'Warden Smith',
          email: 'warden@college.edu',
          mobile: '9988776655',
          wardenId: 'W001',
          password: 'admin'
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  } catch (error) {
    console.error("Failed to seed users:", error);
  }
};

const getUsers = (): User[] => {
  seedUsers();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

export const registerUser = (user: User): { success: boolean; message: string } => {
  try {
    const users = getUsers();

    // Normalize IDs to uppercase for uniqueness check
    if (user.usn) user.usn = user.usn.toUpperCase();
    if (user.wardenId) user.wardenId = user.wardenId.toUpperCase();

    // Check duplicates
    if (user.role === 'STUDENT') {
      if (users.find(u => u.usn === user.usn)) {
        return { success: false, message: 'A student account with this USN already exists.' };
      }
    } else {
      if (users.find(u => u.wardenId === user.wardenId)) {
        return { success: false, message: 'A warden account with this ID already exists.' };
      }
    }

    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'This email address is already registered.' };
    }

    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return { success: true, message: 'Registration successful! You can now log in.' };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: 'System error during registration. Please try again.' };
  }
};

export const loginUser = (
  identifier: string, // USN for student, WardenID for warden
  password: string,
  role: 'STUDENT' | 'ADMIN'
): { success: boolean; user?: User; message: string } => {
  try {
    const users = getUsers();
    const normalizedId = identifier.toUpperCase();

    const user = users.find(u => {
      if (u.role !== role) return false;
      const idMatch = role === 'STUDENT' ? u.usn === normalizedId : u.wardenId === normalizedId;
      return idMatch;
    });

    if (!user) {
      return { success: false, message: `No ${role.toLowerCase()} account found with this ID.` };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    return { success: true, user, message: 'Login successful' };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: 'System error during login. Please try again.' };
  }
};

export const requestPasswordReset = (
  identifier: string,
  role: 'STUDENT' | 'ADMIN'
): { success: boolean; message: string; debugOtp?: string } => {
  try {
    const users = getUsers();
    const normalizedId = identifier.toUpperCase();

    const user = users.find(u => {
      if (u.role !== role) return false;
      const idMatch = role === 'STUDENT' ? u.usn === normalizedId : u.wardenId === normalizedId;
      return idMatch;
    });

    if (!user) {
      return { success: false, message: 'No account found with provided details.' };
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store it mapped to the identifier
    otpStore[normalizedId] = otp;

    // In a real app, this would trigger an SMS/Email API call
    return {
      success: true,
      message: `OTP sent to ${user.mobile ? 'mobile ending in ' + user.mobile.slice(-4) : user.email}`,
      debugOtp: otp // Returned so UI can show it for testing
    };
  } catch (error) {
    return { success: false, message: 'Failed to generate OTP.' };
  }
};

export const confirmPasswordReset = (
  identifier: string,
  role: 'STUDENT' | 'ADMIN',
  otp: string,
  newPassword: string
): { success: boolean; message: string } => {
  try {
    const normalizedId = identifier.toUpperCase();

    // 1. Verify OTP
    const storedOtp = otpStore[normalizedId];
    if (!storedOtp || storedOtp !== otp) {
      return { success: false, message: 'Invalid or expired OTP.' };
    }

    // 2. Update User Password
    const users = getUsers();
    const userIndex = users.findIndex(u => {
      if (u.role !== role) return false;
      return role === 'STUDENT' ? u.usn === normalizedId : u.wardenId === normalizedId;
    });

    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    users[userIndex].password = newPassword;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // 3. Clear OTP
    delete otpStore[normalizedId];

    return { success: true, message: 'Password reset successful! Please login with new password.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to reset password.' };
  }
};

export const updateUser = async (updatedUser: User): Promise<boolean> => {
  try {
    const users = getUsers();
    if (updatedUser.usn) updatedUser.usn = updatedUser.usn.toUpperCase();
    if (updatedUser.wardenId) updatedUser.wardenId = updatedUser.wardenId.toUpperCase();

    const index = users.findIndex(u => {
      if (u.role !== updatedUser.role) return false;
      return updatedUser.role === 'STUDENT' ? u.usn === updatedUser.usn : u.wardenId === updatedUser.wardenId;
    });

    if (index === -1) return false;

    // Update fields
    users[index] = { ...users[index], ...updatedUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    console.error("Failed to update user", e);
    return false;
  }
};

export const getUserByUSN = (usn: string): User | undefined => {
  try {
    const users = getUsers();
    const normalizedUsn = usn.toUpperCase();
    return users.find(u => u.role === 'STUDENT' && u.usn === normalizedUsn);
  } catch (e) {
    console.error("Failed to fetch user by USN", e);
    return undefined;
  }
};

export const deleteUser = (usn: string): { success: boolean; message: string } => {
  try {
    const users = getUsers();
    const normalizedUsn = usn.toUpperCase();
    const userIndex = users.findIndex(u => u.role === 'STUDENT' && u.usn === normalizedUsn);

    if (userIndex === -1) {
      return { success: false, message: 'Student account not found.' };
    }

    // Remove the user from the array
    users.splice(userIndex, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    return { success: true, message: 'Student account deleted successfully!' };
  } catch (e) {
    console.error("Failed to delete user", e);
    return { success: false, message: 'Failed to delete student account.' };
  }
};