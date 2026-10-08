'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuardLogo, Lock, Mail, ArrowRight } from '../../components/Icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide an email and password to access the operations console.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      router.push('/admin');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0b1329] flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-800 antialiased">
      {/* Background glow decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl relative z-10 space-y-6 border border-slate-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 items-center justify-center mb-1">
            <RouteGuardLogo className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Waysure</h1>
          <p className="text-xs uppercase font-bold tracking-wider text-teal-600">
            Road Safety Intelligence
          </p>
          <p className="text-xs text-slate-500 pt-1">
            Sign in to the Operations Console to monitor and manage road hazards.
          </p>
        </div>

        {/* Prototype notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium">
          💡 <b>Prototype Mode:</b> Enter any email and password to continue.
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@waysure.io"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Operations Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400">
          Waysure 30h Hackathon • Node.js + Next.js
        </div>
      </div>
    </div>
  );
}
