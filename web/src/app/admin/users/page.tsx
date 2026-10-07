'use client';

import React from 'react';
import { Users, Shield, CheckCircle } from '../../../components/Icons';

export default function UsersPage() {
  const mockUsers = [
    { id: '1', name: 'Rider #1042 (Bengaluru East)', phone: '+91 98450-XXXXX', trustScore: 98, reportsCount: 24, status: 'Active Verified', badge: 'Elite Scout' },
    { id: '2', name: 'Rider #2189 (Koramangala)', phone: '+91 98210-XXXXX', trustScore: 92, reportsCount: 16, status: 'Active Verified', badge: 'Road Guard' },
    { id: '3', name: 'Rider #3011 (Indiranagar)', phone: '+91 97412-XXXXX', trustScore: 88, reportsCount: 9, status: 'Active', badge: 'Contributor' },
    { id: '4', name: 'Rider #4190 (Whitefield)', phone: '+91 96113-XXXXX', trustScore: 45, reportsCount: 3, status: 'Reviewing', badge: 'Probation' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </span>
          Rider & Reporter Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor mobile app participants, crowdsourced reputation ratings, and verification credibility.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-sm">Registered Mobile App Riders</span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg">4 Active Operators</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Rider Identifier</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Reputation Score</th>
              <th className="py-3 px-4">Total Submissions</th>
              <th className="py-3 px-4">Rank Tier</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-slate-800">{u.name}</td>
                <td className="py-3 px-4 text-slate-600">{u.phone}</td>
                <td className="py-3 px-4">
                  <span className={`font-bold ${u.trustScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {u.trustScore}%
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{u.reportsCount}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {u.badge}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
