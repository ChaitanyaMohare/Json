'use client';

import React, { useEffect, useState } from 'react';
import { getAnalyticsOverview, getHotspots, AnalyticsOverview, Hotspot } from '../../../lib/api';
import { RiskBadge } from '../../../components/Badges';
import {
  AnalyticsIcon,
  FlameIcon,
  RefreshCw
} from '../../../components/Icons';

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedDays: number) => {
    try {
      setLoading(true);
      const [overviewData, hotspotsData] = await Promise.all([
        getAnalyticsOverview(selectedDays),
        getHotspots(selectedDays)
      ]);
      setAnalytics(overviewData);
      setHotspots(hotspotsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const corroborationRate = analytics && analytics.totalIncidents > 0
    ? Math.round(((analytics.corroboratedIncidents || 0) / analytics.totalIncidents) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <AnalyticsIcon className="w-4 h-4" />
            </span>
            Road Safety & Hazard Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated traffic safety metrics, AI corroboration KPIs, and geographic high-risk clusters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-semibold">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  days === d
                    ? 'bg-[#0d7a68] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchAnalytics(days)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hazards</div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            {analytics?.totalIncidents ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {analytics?.activeIncidents ?? 0} active | {analytics?.verifiedIncidents ?? 0} verified
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crowd Reports</div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            {analytics?.totalReports ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {analytics?.pendingReports ?? 0} pending operator triage
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corroboration Rate</div>
          <div className="mt-2 text-3xl font-black text-emerald-600">
            {corroborationRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {analytics?.stronglyCorroboratedIncidents ?? 0} high-evidence multi-reports
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged As Suspicious</div>
          <div className="mt-2 text-3xl font-black text-amber-600">
            {analytics?.suspiciousReports ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            AI spam & anomaly detection filter
          </div>
        </div>
      </div>

      {/* Hotspots Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FlameIcon className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-slate-900 text-base">Identified Hazard Hotspot Sectors</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {hotspots.length} critical clusters detected
          </span>
        </div>

        {hotspots.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No high-density clusters found for the selected time window.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Corridor / Sector</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Incidents</th>
                  <th className="py-3 px-4">Total Reports</th>
                  <th className="py-3 px-4">Primary Hazard</th>
                  <th className="py-3 px-4">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotspots.map((h, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-800">{h.areaName}</td>
                    <td className="py-3 px-4"><RiskBadge level={h.riskLevel} /></td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{h.incidentCount}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{h.totalSupportingReports ?? h.incidentCount}</td>
                    <td className="py-3 px-4 text-slate-600">{(h.topHazards && h.topHazards[0]) || 'Hazard'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{h.riskScore}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
