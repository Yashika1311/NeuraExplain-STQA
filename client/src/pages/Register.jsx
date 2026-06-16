import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  CheckCircle,
  Mail,
  User,
  Lock,
  Phone,
  Building2,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import API from "../api";
import { useTheme } from "../context/ThemeContext";
import "./Register.css";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await API.post("/auth/register", data);
      setPendingEmail(data.email);
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Registration failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const code = otp.join('');
      const res = await API.post('/auth/verify-otp', { email: pendingEmail, otp: code });

      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res?.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'OTP verification failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`registerPage ${theme === "dark" ? "dark" : ""}`}>
        <div className="registerShell">
          <div className="registerForm registerSuccessWrap">
            <div className="registerSuccessIcon">
              <CheckCircle style={{ color: '#10b981', width: '2.5rem', height: '2.5rem' }} />
            </div>
            <h2 className="registerSuccessTitle">Welcome to Neura!</h2>
            <p className="registerSuccessSubtitle">Your account has been created successfully.</p>
            <button
              onClick={() => navigate("/login")}
              className="registerButton"
              type="button"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`registerPage ${theme === "dark" ? "dark" : ""}`}>
      <div className="registerShell">
        <div className="registerForm">
          <div className="registerHeader">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-cyan-400 mr-2" />
              <span className="text-2xl font-bold text-white">Neura</span>
            </div>
            <h1>{step === 1 ? 'Create your account' : 'Verify your email'}</h1>
            <p>
              {step === 1
                ? "Join Neura today. It's quick and easy."
                : `We sent a 6-digit code to ${pendingEmail || 'your email'}.`}
            </p>
          </div>

          {error && (
            <div className="registerError">{error}</div>
          )}

          {step === 1 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="registerFields">
            <div className="registerGroup">
              <label htmlFor="name">Full Name</label>
              <div className="registerInputWrap">
                <User size={20} className="registerIcon" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="registerInput"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && <span className="registerErrorText">{errors.name.message}</span>}
            </div>

            <div className="registerGroup">
              <label htmlFor="email">Email Address</label>
              <div className="registerInputWrap">
                <Mail size={20} className="registerIcon" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="registerInput"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && <span className="registerErrorText">{errors.email.message}</span>}
            </div>

            <div className="registerGroup">
              <label htmlFor="phone">Phone Number</label>
              <div className="registerInputWrap">
                <Phone size={20} className="registerIcon" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="registerInput"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                />
              </div>
              {errors.phone && <span className="registerErrorText">{errors.phone.message}</span>}
            </div>

            <div className="registerGroup">
              <label htmlFor="password">Password</label>
              <div className="registerInputWrap">
                <Lock size={20} className="registerIcon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="registerInput registerPasswordInput"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/,
                      message: 'Must include uppercase, number & special character'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="registerTogglePw"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="registerErrorText">{errors.password.message}</span>}
            </div>

            <div className="registerGroup">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="registerInputWrap">
                <Lock size={20} className="registerIcon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="registerInput registerPasswordInput"
                  {...register('confirmPassword', {
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="registerTogglePw"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="registerErrorText">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="registerButton"
            >
              {isLoading ? (
                <>
                  <svg
                    className="registerSpinner"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                    <path
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                      opacity="0.75"
                    />
                  </svg>
                  Sending Code...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          ) : (
            <div>
              <p className="registerOtpHint">Enter the verification code</p>
              <div className="registerOtpContainer">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                      const next = [...otp];
                      next[index] = val;
                      setOtp(next);
                      if (val && index < 5) {
                        document.getElementById(`otp-${index + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                    className="registerOtpInput"
                  />
                ))}
              </div>

              <div className="registerSecondaryButtonRow">
                <button
                  type="button"
                  className="registerSecondaryButton"
                  disabled={isLoading}
                  onClick={() => {
                    setStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setError(null);
                  }}
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                <button
                  type="button"
                  disabled={isLoading || otp.some((d) => !d)}
                  className="registerButton"
                  onClick={onVerifyOtp}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="registerSpinner"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                        <path
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          fill="currentColor"
                          opacity="0.75"
                        />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="registerDivider">
            <div className="registerDividerLine" />
            <span>or</span>
            <div className="registerDividerLine" />
          </div>

          <Link
            to="/login"
            className="registerLoginLink"
          >
            Sign in to your account
          </Link>
        </div>

        <div className="registerIllustration">
          <div className="registerIllustrationIcon">
            <Building2 size={40} />
          </div>
          <h2>Welcome to Our Platform</h2>
          <p>
            Join thousands of users who trust our platform for their needs. Create your account and get started today.
          </p>
          <div className="registerFeatures">
            <div className="registerFeature">
              <CheckCircle size={20} className="registerFeatureIcon" />
              <span>No credit card required</span>
            </div>
            <div className="registerFeature">
              <CheckCircle size={20} className="registerFeatureIcon" />
              <span>14-day free trial</span>
            </div>
            <div className="registerFeature">
              <CheckCircle size={20} className="registerFeatureIcon" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
