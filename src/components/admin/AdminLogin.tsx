import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Building2, Mail, LogIn } from 'lucide-react';
import { api } from '../../services/api';
import { AdminUser } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('admin@galaxyrealestate.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      triggerError('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      triggerError('Please enter your administrator password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.auth.login(password, email.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        triggerError(res.error || 'Invalid credentials. Access denied.');
      }
    } catch (err: any) {
      triggerError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleQuickFill = () => {
    setEmail('admin@galaxyrealestate.com');
    setPassword('admin123@Galaxy');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#071324] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#D4A84F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0B1F3A]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Luxury Admin Login Card */}
      <div className={`w-full max-w-md bg-[#0B1F3A]/90 border border-slate-700/60 rounded-3xl shadow-2xl p-7 sm:p-9 backdrop-blur-xl relative z-10 transition-transform duration-300 ${shake ? 'animate-bounce' : ''}`}>
        
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4A84F]/20 to-[#D4A84F]/5 border border-[#D4A84F]/30 text-[#D4A84F] mb-3 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display">
            GALAXY
          </h1>
          <div className="text-xs uppercase font-extrabold tracking-[0.25em] text-[#D4A84F] mt-0.5">
            REAL ESTATE
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-[11px] font-bold text-slate-300 mt-3 tracking-wider uppercase">
            <Lock className="w-3 h-3 text-[#D4A84F]" /> Admin Portal Login
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Enter your credentials to access the management dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="admin@galaxyrealestate.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4A84F] focus:ring-2 focus:ring-[#D4A84F]/20 transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••••••"
                autoFocus
                className="w-full pl-10 pr-11 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4A84F] focus:ring-2 focus:ring-[#D4A84F]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center font-semibold flex items-center justify-center gap-1.5 animate-fadeIn">
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4A84F] to-[#c7983c] hover:from-[#e0b75e] hover:to-[#d4a84f] text-[#0B1F3A] font-extrabold text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-[#D4A84F]/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0B1F3A] border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-[#D4A84F]/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-medium text-slate-400">Admin Email:</span>
            <span className="font-mono text-white text-[11px]">admin@galaxyrealestate.com</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-medium text-slate-400">Default Password:</span>
            <code className="text-[#D4A84F] font-mono font-bold bg-slate-900/80 px-2 py-0.5 rounded text-[11px]">
              admin123@Galaxy
            </code>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="w-full mt-1 py-2 px-3 bg-[#D4A84F]/20 hover:bg-[#D4A84F]/30 text-[#D4A84F] border border-[#D4A84F]/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-fill Demo Credentials</span>
          </button>
        </div>

        {/* Bottom Options & Back Link */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500">
            Authorized Personnel Only
          </span>

          <button
            type="button"
            onClick={onBackToSite}
            className="text-[#D4A84F] hover:text-[#e0b75e] font-bold text-xs flex items-center gap-1 transition"
          >
            <span>Public Website</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected with bcrypt encryption & HTTP-only sessions</span>
        </div>

      </div>
    </div>
  );
};
