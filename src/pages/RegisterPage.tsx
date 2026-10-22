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
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-8 bg-[#FAF2EB]">
      <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#EEDCD1] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Brand Benefits */}
        <div className="hidden md:flex md:col-span-5 bg-[#FBE5EB] p-8 flex-col justify-between text-[#2D141A] border-r border-[#EEDCD1]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#AC1443]">
              ✦ PRIVILEGED CLUB ✦
            </span>
            <h2 className="font-serif-royal text-2xl font-bold mt-2 text-[#2D141A] leading-snug">
              Create Your<br />DORASANI Account
            </h2>
            <p className="text-xs text-[#74565D] mt-1.5 leading-relaxed">
              Join a world of timeless traditions and exquisite handwoven collections.
            </p>

            {/* 4 Benefit Bullets */}
            <div className="space-y-4 mt-8 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#AC1443] shadow-xs shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#2D141A]">Exclusive Offers</h4>
                  <p className="text-[11px] text-[#74565D]">Get early access to new collections and festive discounts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#AC1443] shadow-xs shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#2D141A]">Wishlist Anytime</h4>
                  <p className="text-[11px] text-[#74565D]">Save your favourite styles and access across any device.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#AC1443] shadow-xs shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#2D141A]">Faster Checkout</h4>
                  <p className="text-[11px] text-[#74565D]">Enjoy a seamless, saved-address shopping experience.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#AC1443] shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#2D141A]">Personalized Recommendations</h4>
                  <p className="text-[11px] text-[#74565D]">Discover heritage weaves styled to your taste.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#9B8086] pt-6 border-t border-[#EEDCD1]">
            Trusted by 50,000+ patrons of South Indian handlooms across India.
          </p>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          {/* Logo Header */}
          <div className="text-center mb-5">
            <div className="w-7 h-6 mx-auto mb-1">
              <img
                src="/assets/brand/lotus_mark.png"
                alt="Lotus"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-cinzel-royal text-xl font-bold text-[#AC1443] tracking-widest uppercase">
              DORASANI
            </h3>
            <p className="text-[9px] uppercase tracking-wider text-[#74565D]">
              Where Heritage Meets Divine Elegance
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[#EEDCD1] mb-5 text-xs font-semibold">
            <button className="flex-1 pb-2.5 border-b-2 border-[#AC1443] text-[#AC1443]">
              Create Account
            </button>
            <Link
              to="/login"
              className="flex-1 pb-2.5 text-[#74565D] hover:text-[#2D141A] text-center"
            >
              Login
            </Link>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[#2D141A] font-semibold mb-1">Full Name *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded py-2 pl-9 pr-3 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                />
                <User className="w-4 h-4 text-[#74565D] absolute left-3" />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[#2D141A] font-semibold mb-1">Mobile Number *</label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded py-2 pl-9 pr-3 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                />
                <Phone className="w-4 h-4 text-[#74565D] absolute left-3" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#2D141A] font-semibold mb-1">Email Address (Optional)</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded py-2 pl-9 pr-3 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                />
                <Mail className="w-4 h-4 text-[#74565D] absolute left-3" />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#2D141A] font-semibold mb-1">Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded py-2 pl-8 pr-7 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#74565D] absolute left-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 text-[#74565D]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#2D141A] font-semibold mb-1">Confirm Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded py-2 pl-8 pr-3 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#74565D] absolute left-2.5" />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#74565D] pt-1">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-[#AC1443] rounded"
              />
              <span>I agree to the <Link to="/terms" className="underline text-[#AC1443]">Terms & Conditions</Link> and <Link to="/privacy" className="underline text-[#AC1443]">Privacy Policy</Link></span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#AC1443] hover:bg-[#860E33] text-white py-2.5 rounded font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="text-center text-xs text-[#74565D] mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#AC1443] font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
