import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('lokesh@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(identifier);
    navigate('/account');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-8 bg-[#FAF2EB]">
      <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#EEDCD1] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Brand Story & Model Photo */}
        <div className="hidden md:flex md:col-span-6 bg-cover bg-center p-8 flex-col justify-between text-white relative min-h-[460px]"
          style={{
            backgroundImage: 'url(/assets/banners/hero_model.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D141A]/95 via-[#63132B]/60 to-transparent" />
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C99632]">
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
          <div className="flex border-b border-[#EEDCD1] mb-6 text-xs font-semibold">
            <button className="flex-1 pb-2.5 border-b-2 border-[#AC1443] text-[#AC1443]">
              Customer Login
            </button>
            <Link
              to="/register"
              className="flex-1 pb-2.5 text-[#74565D] hover:text-[#2D141A] text-center"
            >
              Create Account
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email or Phone */}
            <div>
              <label className="block text-[#2D141A] font-semibold mb-1">
                Email address or mobile number
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or +91..."
                  className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded py-2 pl-9 pr-3 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                />
                <Mail className="w-4 h-4 text-[#74565D] absolute left-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#2D141A] font-semibold mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded py-2 pl-9 pr-9 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                />
                <Lock className="w-4 h-4 text-[#74565D] absolute left-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#74565D] hover:text-[#AC1443]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#74565D]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#AC1443] rounded"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="text-[#AC1443] hover:underline font-semibold">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#AC1443] hover:bg-[#860E33] text-white py-2.5 rounded font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Social Sign-in Options */}
          <div className="mt-5 pt-4 border-t border-[#F5EAE2] space-y-2 text-xs">
            <span className="block text-center text-[11px] text-[#9B8086]">or continue with</span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  login('google.user@example.com', 'Google User');
                  navigate('/account');
                }}
                className="border border-[#DEC3B4] hover:bg-[#FAF2EB] py-2 rounded flex items-center justify-center gap-1.5 font-medium text-[#2D141A] transition-colors"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  login('apple.user@example.com', 'Apple User');
                  navigate('/account');
                }}
                className="border border-[#DEC3B4] hover:bg-[#FAF2EB] py-2 rounded flex items-center justify-center gap-1.5 font-medium text-[#2D141A] transition-colors"
              >
                <span>Apple</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#74565D] mt-5">
            New to DORASANI?{' '}
            <Link to="/register" className="text-[#AC1443] font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
