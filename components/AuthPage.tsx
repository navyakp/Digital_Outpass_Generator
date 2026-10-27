import React, { useState } from 'react';
import { User } from '../types';
import { registerUser, loginUser, requestPasswordReset, confirmPasswordReset } from '../services/authService';
import { Shield, User as UserIcon, Lock, Mail, Phone, Hash, ArrowRight, AlertCircle, Loader2, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

// Extracted InputField component to prevent re-rendering issues
interface InputFieldProps {
  name: string;
  type?: string;
  placeholder: string;
  icon: any;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  name, type = "text", placeholder, icon: Icon, value, onChange, error
}) => (
  <div className="space-y-1">
    <div className="relative">
      <Icon className={`absolute left-3 top-3 w-5 h-5 ${error ? 'text-red-500' : 'text-gray-600'}`} />
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all bg-white/70 backdrop-blur-sm text-gray-900 font-medium placeholder-gray-500
          ${error ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-300/60 focus:ring-blue-500 border-gray-200'}`}
      />
    </div>
    {error && <p className="text-red-600 text-xs font-semibold ml-1 animate-pulse">{error}</p>}
  </div>
);

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    id: '', // USN or WardenID
    password: '',
    confirmPassword: '',
    otp: '',
    department: '',
    hostelName: '',
    parentName: '',
    parentMobile: '',
    parentMobile2: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Auto-uppercase ID field (USN/WardenID)
    const finalValue = name === 'id' ? value.toUpperCase() : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setFormError('');
    setSuccessMsg('');
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setFormError('');
    setSuccessMsg('');
    setFieldErrors({});
    setOtpSent(false); // Reset OTP state
    // Keep ID populated if switching between login/forgot
    if (mode === 'REGISTER') {
      setFormData({ name: '', email: '', mobile: '', id: '', password: '', confirmPassword: '', otp: '' });
    } else {
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '', otp: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // ID Validation
    if (!formData.id.trim()) {
      errors.id = role === 'STUDENT' ? "USN is required" : "Warden ID is required";
    }

    if (authMode === 'FORGOT_PASSWORD') {
      if (otpSent) {
        if (!formData.otp.trim()) errors.otp = "OTP is required";
        if (!formData.password) errors.password = "New password is required";
        if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
      }
      // If not otpSent, we only validate ID (already done above)
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    }

    // Password Validation (Login & Register)
    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (authMode === 'REGISTER') {
      if (!formData.name.trim()) errors.name = "Full Name is required";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        errors.email = "Invalid email address";
      }

      const phoneRegex = /^\d{10}$/;
      if (!formData.mobile.trim()) {
        errors.mobile = "Mobile number is required";
      } else if (!phoneRegex.test(formData.mobile)) {
        errors.mobile = "Mobile must be 10 digits";
      }

      if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      if (role === 'STUDENT') {
        if (!formData.department.trim()) errors.department = "Department is required";
        if (!formData.hostelName.trim()) errors.hostelName = "Hostel Name is required";
        if (!formData.parentName.trim()) errors.parentName = "Parent Name is required";

        const phoneRegex = /^\d{10}$/;
        if (!formData.parentMobile.trim()) {
          errors.parentMobile = "Parent Mobile is required";
        } else if (!phoneRegex.test(formData.parentMobile)) {
          errors.parentMobile = "Invalid mobile number";
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // UX Delay

      if (authMode === 'LOGIN') {
        const result = loginUser(formData.id, formData.password, role);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setFormError(result.message);
        }
      } else if (authMode === 'REGISTER') {
        const newUser: User = {
          role,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          ...(role === 'STUDENT' ? {
            usn: formData.id,
            department: formData.department,
            hostelName: formData.hostelName,
            parentName: formData.parentName,
            parentMobile: formData.parentMobile,
            parentMobile2: formData.parentMobile2
          } : { wardenId: formData.id })
        };
        const result = registerUser(newUser);
        if (result.success) {
          setSuccessMsg(result.message);
          setTimeout(() => switchMode('LOGIN'), 1500);
        } else {
          setFormError(result.message);
        }
      } else if (authMode === 'FORGOT_PASSWORD') {
        if (!otpSent) {
          // STEP 1: Request OTP
          const result = requestPasswordReset(formData.id, role);
          if (result.success) {
            setOtpSent(true);
            setSuccessMsg(result.message);
            // Simulate receiving the OTP via "SMS" for testing
            if (result.debugOtp) {
              alert(`[SIMULATION] Your OTP is: ${result.debugOtp}`);
            }
          } else {
            setFormError(result.message);
          }
        } else {
          // STEP 2: Confirm OTP & Reset
          const result = confirmPasswordReset(formData.id, role, formData.otp, formData.password);
          if (result.success) {
            setSuccessMsg(result.message);
            setOtpSent(false); // Reset state
            setTimeout(() => switchMode('LOGIN'), 2000);
          } else {
            setFormError(result.message);
          }
        }
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center p-4 py-8 bg-cover bg-center bg-fixed bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: 'url("/background.jpg")' }}
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-visible border border-white/40 transition-all mb-10 relative z-10">

        {/* Header */}
        <div className="bg-white/90 p-8 text-center border-b border-gray-100 relative">
          {authMode === 'FORGOT_PASSWORD' && (
            <button
              onClick={() => switchMode('LOGIN')}
              className="absolute left-4 top-4 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <a href="https://aiet.org.in" target="_blank" rel="noopener noreferrer" className="w-24 h-24 mx-auto mb-4 p-2 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center hover:shadow-xl transition-shadow">
            <img src="/alvas_logo.png" alt="Alva's Logo" className="w-full h-full object-contain" />
          </a>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Outpass</h1>
          <p className="text-gray-600 mt-2 font-medium">Digital Outpass System</p>
        </div>

        {/* Role Toggles */}
        <div className="flex border-b border-gray-200/30">
          <button
            type="button"
            onClick={() => { setRole('STUDENT'); setFieldErrors({}); setFormError(''); }}
            className={`flex-1 py-4 text-sm font-bold transition-all ${role === 'STUDENT' ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/40' : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'}`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => { setRole('ADMIN'); setFieldErrors({}); setFormError(''); }}
            className={`flex-1 py-4 text-sm font-bold transition-all ${role === 'ADMIN' ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/40' : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'}`}
          >
            Warden
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 drop-shadow-sm flex items-center justify-between">
            {authMode === 'LOGIN' && 'Welcome Back'}
            {authMode === 'REGISTER' && `Create ${role === 'STUDENT' ? 'Student' : 'Warden'} Account`}
            {authMode === 'FORGOT_PASSWORD' && (otpSent ? 'Enter OTP' : 'Reset Password')}

            {authMode === 'REGISTER' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full uppercase tracking-wider">New</span>}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {authMode === 'FORGOT_PASSWORD' && !otpSent && (
              <p className="text-sm text-gray-600 mb-4">
                Enter your registered {role === 'STUDENT' ? 'USN' : 'Warden ID'}. We will send a One-Time Password (OTP) to your registered contact.
              </p>
            )}

            {authMode === 'FORGOT_PASSWORD' && otpSent && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Enter the 6-digit OTP sent to your device.
              </div>
            )}

            {authMode === 'REGISTER' && (
              <>
                <InputField
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  icon={UserIcon}
                  error={fieldErrors.name}
                />
                <InputField
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email Address"
                  icon={Mail}
                  error={fieldErrors.email}
                />
                <InputField
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Mobile Number"
                  icon={Phone}
                  error={fieldErrors.mobile}
                />
                {role === 'STUDENT' && (
                  <>
                    <InputField
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department (e.g., CS, ME)"
                      icon={Hash}
                      error={fieldErrors.department}
                    />
                    <InputField
                      name="hostelName"
                      value={formData.hostelName}
                      onChange={handleChange}
                      placeholder="Hostel Name (e.g., Block A)"
                      icon={Hash}
                      error={fieldErrors.hostelName}
                    />
                    <InputField
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="Parent Name"
                      icon={UserIcon}
                      error={fieldErrors.parentName}
                    />
                    <InputField
                      name="parentMobile"
                      value={formData.parentMobile}
                      onChange={handleChange}
                      type="tel"
                      placeholder="Parent Mobile Number"
                      icon={Phone}
                      error={fieldErrors.parentMobile}
                    />
                    <InputField
                      name="parentMobile2"
                      value={formData.parentMobile2}
                      onChange={handleChange}
                      type="tel"
                      placeholder="Parent Mobile Number 2 (Optional)"
                      icon={Phone}
                      error={fieldErrors.parentMobile2}
                    />
                  </>
                )}
              </>
            )}

            {/* ID Field */}
            <div className={`${otpSent ? 'opacity-50 pointer-events-none' : ''}`}>
              <InputField
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder={role === 'STUDENT' ? "USN (e.g., 4ALXXXXXXX)" : "Warden ID (e.g., W001)"}
                icon={Hash}
                error={fieldErrors.id}
              />
            </div>

            {authMode === 'FORGOT_PASSWORD' && otpSent && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <InputField
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 6-digit OTP"
                  icon={KeyRound}
                  error={fieldErrors.otp}
                />
                <InputField
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="New Password"
                  icon={Lock}
                  error={fieldErrors.password}
                />
                <InputField
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  placeholder="Confirm New Password"
                  icon={Lock}
                  error={fieldErrors.confirmPassword}
                />
              </div>
            )}

            {authMode !== 'FORGOT_PASSWORD' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <InputField
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Password"
                    icon={Lock}
                    error={fieldErrors.password}
                  />
                  {authMode === 'LOGIN' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => switchMode('FORGOT_PASSWORD')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {authMode === 'REGISTER' && (
                  <InputField
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="Confirm Password"
                    icon={Lock}
                    error={fieldErrors.confirmPassword}
                  />
                )}
              </div>
            )}

            {/* Global Messages */}
            {formError && (
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm bg-red-50/80 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 text-green-700 font-medium text-sm bg-green-50/80 p-3 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 bg-blue-600/90 hover:bg-blue-700/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all backdrop-blur-sm transform hover:scale-[1.02] ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <> <Loader2 className="w-4 h-4 animate-spin" /> Processing... </>
              ) : (
                <>
                  {authMode === 'LOGIN' && 'Login'}
                  {authMode === 'REGISTER' && 'Create Account'}
                  {authMode === 'FORGOT_PASSWORD' && !otpSent && 'Send OTP'}
                  {authMode === 'FORGOT_PASSWORD' && otpSent && 'Reset Password'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {authMode !== 'FORGOT_PASSWORD' && (
            <div className="mt-6 text-center text-sm text-gray-700 font-medium">
              {authMode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => switchMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="ml-2 text-blue-700 font-bold hover:underline"
              >
                {authMode === 'LOGIN' ? 'Register' : 'Login'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Watermark Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-gray-600/80 text-xs font-medium pointer-events-none">
        <div className="flex items-center justify-center gap-2 bg-white/50 backdrop-blur-md py-2 px-4 rounded-full inline-flex shadow-sm border border-white/40">
          <img src="/alvas_logo.png" alt="Logo" className="w-4 h-4 opacity-80" />
          <span>Alva's Smart Campus Initiative • 2025</span>
        </div>
      </div>
    </div>
  );
};