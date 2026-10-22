import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, Gift, Heart, Zap, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('Maddiboina Lokesh');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('lokesh@example.com');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useStore();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    register(fullName, email, phone);
    navigate('/account');
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
            <div className="w-8 h-7 mx-auto mb-1">
              <img
                src="/assets/brand/lotus_mark_green.png"
                alt="Lotus"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-cinzel-royal text-xl font-bold text-[#1A3B2B] tracking-widest uppercase">
              DORASANI
            </h3>
            <p className="text-[9px] uppercase tracking-wider text-[#4F6355]">
              Where Heritage Meets Divine Elegance
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[#E8DCCF] mb-5 text-xs font-semibold">
            <button className="flex-1 pb-2.5 border-b-2 border-[#285A3C] text-[#285A3C]">
              Create Account
            </button>
            <Link
              to="/login"
              className="flex-1 pb-2.5 text-[#4F6355] hover:text-[#1A3B2B] text-center"
            >
              Login
            </Link>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[#1A3B2B] font-semibold mb-1">Full Name *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 pl-9 pr-3 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
                <User className="w-4 h-4 text-[#4F6355] absolute left-3" />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[#1A3B2B] font-semibold mb-1">Mobile Number *</label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 pl-9 pr-3 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
                <Phone className="w-4 h-4 text-[#4F6355] absolute left-3" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#1A3B2B] font-semibold mb-1">Email Address (Optional)</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 pl-9 pr-3 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
                <Mail className="w-4 h-4 text-[#4F6355] absolute left-3" />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#1A3B2B] font-semibold mb-1">Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 pl-8 pr-7 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#4F6355] absolute left-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 text-[#4F6355]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#1A3B2B] font-semibold mb-1">Confirm Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 pl-8 pr-3 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#4F6355] absolute left-2.5" />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#4F6355] pt-1">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-[#285A3C] rounded"
              />
              <span>I agree to the <Link to="/terms" className="underline text-[#285A3C]">Terms & Conditions</Link> and <Link to="/privacy" className="underline text-[#285A3C]">Privacy Policy</Link></span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#285A3C] hover:bg-[#1E432D] text-white py-2.5 rounded font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="text-center text-xs text-[#4F6355] mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#285A3C] font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

