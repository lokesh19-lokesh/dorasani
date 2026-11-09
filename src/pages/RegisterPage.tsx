import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Gift,
  Heart,
  Zap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { authService } from '../services/authService';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false);
  const [resending, setResending] = useState(false);

  const { register, user, authLoading, showToast } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.isAdmin ? '/admin' : '/account', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(fullName, email, phone, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Unable to create account. Please try again.');
        return;
      }

      if (result.requiresConfirmation) {
        setAwaitingEmailConfirm(true);
        return;
      }

      if (result.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) return;
    setResending(true);
    setErrorMessage(null);
    try {
      const res = await authService.resendConfirmation(email);
      if (res.success) {
        showToast(`Verification email resent to ${email.trim().toLowerCase()}`);
      } else {
        setErrorMessage(res.error || 'Failed to resend verification email.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-8 bg-[#FAF5EE]">
      <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#D8C7B5] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Brand Benefits */}
        <div className="hidden md:flex md:col-span-5 bg-[#D0E9C0]/35 p-8 flex-col justify-between text-[#1A3B2B] border-r border-[#BCD8AA]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#285A3C]">
              ✦ PRIVILEGED CLUB ✦
            </span>
            <h2 className="font-serif-royal text-2xl font-bold mt-2 text-[#1A3B2B] leading-snug">
              Create Your<br />DORASANI Account
            </h2>
            <p className="text-xs text-[#4F6355] mt-1.5 leading-relaxed">
              Join a world of timeless traditions and exquisite handwoven collections.
            </p>

            {/* 4 Benefit Bullets */}
            <div className="space-y-4 mt-8 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#285A3C] shadow-xs shrink-0 border border-[#BCD8AA]">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3B2B]">Exclusive Offers</h4>
                  <p className="text-[11px] text-[#4F6355]">Get early access to new collections and festive discounts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#285A3C] shadow-xs shrink-0 border border-[#BCD8AA]">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3B2B]">Wishlist Anytime</h4>
                  <p className="text-[11px] text-[#4F6355]">Save your favourite styles and access across any device.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#285A3C] shadow-xs shrink-0 border border-[#BCD8AA]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3B2B]">Faster Checkout</h4>
                  <p className="text-[11px] text-[#4F6355]">Enjoy a seamless, saved-address shopping experience.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#285A3C] shadow-xs shrink-0 border border-[#BCD8AA]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3B2B]">Personalized Recommendations</h4>
                  <p className="text-[11px] text-[#4F6355]">Discover heritage weaves styled to your taste.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#4F6355] pt-6 border-t border-[#BCD8AA]">
            Trusted by 50,000+ patrons of South Indian handlooms across India.
          </p>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          {/* Logo Header */}
          <div className="text-center mb-5">
            <Link to="/" className="inline-block transition-transform duration-200 hover:scale-102">
              <img
                src="/assets/logo.png"
                alt="DORASANI - Where Heritage Meets Divine Elegance"
                className="h-14 sm:h-16 md:h-18 w-auto mx-auto object-contain"
              />
            </Link>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[#E8DCCF] mb-5 text-xs font-semibold">
            <button type="button" className="flex-1 pb-2.5 border-b-2 border-[#285A3C] text-[#285A3C]">
              Create Account
            </button>
            <Link
              to="/login"
              className="flex-1 pb-2.5 text-[#4F6355] hover:text-[#1A3B2B] text-center"
            >
              Sign In
            </Link>
          </div>

          {awaitingEmailConfirm ? (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Confirm Your Email Address</span>
              </div>
              <p className="leading-relaxed text-emerald-900">
                We have sent a verification link to <strong>{email.trim().toLowerCase()}</strong>. Please open your inbox and click the confirmation link before signing in.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/login"
                  className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-4 py-2 rounded font-semibold transition-colors"
                >
                  Go to Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 border border-emerald-300 bg-white hover:bg-emerald-100/60 text-emerald-900 px-3.5 py-2 rounded font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Resending...' : 'Resend Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div aria-live="polite">
                {errorMessage && (
                  <div
                    role="alert"
                    className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <p className="font-medium leading-snug">{errorMessage}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                {/* Full Name */}
                <div>
                  <label htmlFor="reg-name" className="block text-[#1A3B2B] font-semibold mb-1">
                    Full Name *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2.5 pl-9 pr-3 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285A3C] focus:border-[#285A3C]"
                    />
                    <User className="w-4 h-4 text-[#4F6355] absolute left-3 pointer-events-none" />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="reg-phone" className="block text-[#1A3B2B] font-semibold mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      enterKeyHint="next"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2.5 pl-9 pr-3 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285A3C] focus:border-[#285A3C]"
                    />
                    <Phone className="w-4 h-4 text-[#4F6355] absolute left-3 pointer-events-none" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="block text-[#1A3B2B] font-semibold mb-1">
                    Email Address *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      spellCheck={false}
                      enterKeyHint="next"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2.5 pl-9 pr-3 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285A3C] focus:border-[#285A3C]"
                    />
                    <Mail className="w-4 h-4 text-[#4F6355] absolute left-3 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="block text-[#1A3B2B] font-semibold mb-1">
                    Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-password"
                      name="new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      enterKeyHint="done"
                      minLength={6}
                      aria-describedby="reg-password-constraints"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password (min 6 characters)"
                      className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2.5 pl-9 pr-10 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285A3C] focus:border-[#285A3C]"
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
                  <p id="reg-password-constraints" className="text-[11px] text-[#4F6355] mt-1">
                    Minimum 6 characters. Browsers can generate and save a strong password automatically.
                  </p>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#4F6355] pt-1">
                  <input
                    id="reg-terms"
                    name="agreeTerms"
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="accent-[#285A3C] rounded"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="underline text-[#285A3C]">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="underline text-[#285A3C]">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white py-2.5 rounded font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
                >
                  <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                  {!isSubmitting && (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-[#4F6355] mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#285A3C] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
