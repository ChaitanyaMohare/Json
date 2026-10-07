'use client';

import React, { useState } from 'react';
import { SettingsIcon, CheckCircle, Shield } from '../../../components/Icons';

export default function SettingsPage() {
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');
  const [corroborationDistance, setCorroborationDistance] = useState(500);
  const [corroborationThreshold, setCorroborationThreshold] = useState(75);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4" />
          </span>
          System & Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure mobile telemetry endpoints, AI corroboration thresholds, and risk scoring parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Backend API URL (Mobile & Web)
          </label>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0d7a68]/20 focus:border-[#0d7a68]"
          />
          <p className="text-[11px] text-slate-400 mt-1">Point this to your local IP or production domain for physical mobile device connections.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Corroboration Radius (meters)
            </label>
            <input
              type="number"
              value={corroborationDistance}
              onChange={(e) => setCorroborationDistance(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0d7a68]/20 focus:border-[#0d7a68]"
            />
            <p className="text-[11px] text-slate-400 mt-1">Maximum geographic proximity window to cluster duplicate hazards.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Evidence Fusion Threshold
            </label>
            <input
              type="number"
              value={corroborationThreshold}
              onChange={(e) => setCorroborationThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0d7a68]/20 focus:border-[#0d7a68]"
            />
            <p className="text-[11px] text-slate-400 mt-1">Minimum score required to designate an incident STRONGLY_CORROBORATED.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-[#0d7a68] hover:bg-[#0b6354] text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Save Configuration
          </button>
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
