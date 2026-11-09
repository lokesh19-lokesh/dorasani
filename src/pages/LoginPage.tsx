import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Forgot password inline mode
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { login, user, authLoading, showToast } = useStore();
  const navigate = useNavigate();

  // If already authenticated (or returning from confirmation email), route based on DB role
  useEffect(() => {
    if (!authLoading && user) {
      if (user.isAdmin) {
        navigate(redirectParam && redirectParam.startsWith('/admin') ? redirectParam : '/admin', {
          replace: true,
        });
      } else {
        navigate(redirectParam && !redirectParam.startsWith('/admin') ? redirectParam : '/account', {
          replace: true,
        });
      }
    }
  }, [authLoading, user, navigate, redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setNeedsConfirmation(false);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate(redirectParam && !redirectParam.startsWith('/admin') ? redirectParam : '/account', {
            replace: true,
          });
        }
        return;
      }

      setErrorMessage(result.error || 'Unable to sign in. Please check your credentials.');
      if (result.emailUnconfirmed) {
        setNeedsConfirmation(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) return;
    setResendingConfirmation(true);
    setErrorMessage(null);
    try {
      const res = await authService.resendConfirmation(email);
      if (res.success) {
        setInfoMessage(`Verification email resent to ${email.trim().toLowerCase()}. Please check your inbox.`);
        showToast('Verification email resent!');
      } else {
        setErrorMessage(res.error || 'Could not resend verification email.');
      }
    } finally {
      setResendingConfirmation(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSendingReset(true);

    try {
      const res = await authService.resetPassword(resetEmail);
      if (res.success) {
        setInfoMessage(`Password reset instructions sent to ${resetEmail.trim().toLowerCase()}.`);
        showToast('Password reset link sent!');
      } else {
        setErrorMessage(res.error || 'Unable to send password reset email.');
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-8 bg-[#FAF5EE]">
      <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#D8C7B5] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Brand Story & Model Photo */}
        <div
          className="hidden md:flex md:col-span-6 bg-cover bg-center p-8 flex-col justify-between text-white relative min-h-[460px]"
          style={{
            backgroundImage: 'url(/assets/banners/hero_model.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A3B2B]/95 via-[#285A3C]/60 to-transparent" />
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#D0E9C0]">
              ✦ DORASANI LUXURY ✦
            </span>
          </div>

          <div className="relative z-10 space-y-2">
            <h2 className="font-serif-royal text-2xl lg:text-3xl font-bold leading-tight">
              Welcome Back<br />
              <span className="text-[#D0E9C0]">To a World of Timeless Elegance</span>
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Sign in to continue your journey with DORASANI, track your orders and explore our exquisite handwoven collections.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center">
          {/* Logo Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block transition-transform duration-200 hover:scale-102">
              <img
                src="/assets/logo.png"
                alt="DORASANI - Where Heritage Meets Divine Elegance"
                className="h-14 sm:h-16 md:h-18 w-auto mx-auto object-contain"
              />
            </Link>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[#E8DCCF] mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setErrorMessage(null);
              }}
              className="flex-1 pb-2.5 border-b-2 border-[#285A3C] text-[#285A3C]"
            >
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 pb-2.5 text-[#4F6355] hover:text-[#1A3B2B] text-center"
            >
              Create Account
            </Link>
          </div>

          {/* Status & Error Banners */}
          <div aria-live="polite" className="space-y-2 mb-4">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-medium leading-snug">{errorMessage}</p>
                  {needsConfirmation && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingConfirmation}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#285A3C] hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendingConfirmation ? 'animate-spin' : ''}`} />
                      <span>{resendingConfirmation ? 'Resending...' : 'Resend verification email'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                <p className="font-medium leading-snug">{infoMessage}</p>
              </div>
            )}
          </div>

          {!isForgotMode ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-[#1A3B2B] font-semibold mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    spellCheck={false}
                    enterKeyHint="next"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2.5 pl-9 pr-3 text-sm sm:text-xs text-[#1A3B2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285A3C] focus:border-[#285A3C]"
                  />
                  <Mail className="w-4 h-4 text-[#4F6355] absolute left-3 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-[#1A3B2B] font-semibold mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    enterKeyHint="done"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2.5 pl-9 pr-10 text-sm sm:text-xs text-[#1A3B2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285A3C] focus:border-[#285A3C]"
                  />
                  <Lock className="w-4 h-4 text-[#4F6355] absolute left-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 p-1 text-[#4F6355] hover:text-[#285A3C] rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end text-[11px] pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                    setResetEmail(email);
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className="text-[#285A3C] hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white py-2.5 rounded font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                {!isSubmitting && (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              <p className="text-[#4F6355] leading-relaxed">
                Enter your registered email address and we will send you a password reset link.
              </p>

              <div>
                <label htmlFor="reset-email" className="block text-[#1A3B2B] font-semibold mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    spellCheck={false}
                    enterKeyHint="done"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2.5 pl-9 pr-3 text-sm sm:text-xs text-[#1A3B2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285A3C] focus:border-[#285A3C]"
                  />
                  <Mail className="w-4 h-4 text-[#4F6355] absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className="flex-1 border border-[#D8C7B5] hover:bg-[#FAF5EE] text-[#1A3B2B] py-2.5 rounded font-semibold transition-colors"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="flex-1 bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white py-2.5 rounded font-bold transition-all shadow-md"
                >
                  {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-[#4F6355] mt-6 pt-4 border-t border-[#E8DCCF]">
            New to DORASANI?{' '}
            <Link to="/register" className="text-[#285A3C] font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
