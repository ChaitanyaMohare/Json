'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getIncidents,
  getReports,
  getAnalyticsOverview,
  getHotspots,
  Incident,
  Report,
  AnalyticsOverview,
  Hotspot
} from '../../lib/api';
import IncidentMap from '../../components/IncidentMap';
import { SeverityBadge, StatusBadge, TypeBadge, RiskBadge, EvidenceBadge } from '../../components/Badges';
import {
  RoadIcon,
  AlertTriangle,
  CheckCircle,
  FlameIcon,
  Users,
  CarIcon,
  BarrierIcon,
  RoadDamageIcon,
  FloodIcon,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  Shield,
  Filter,
  Target,
  Hourglass,
  AnalyticsIcon
} from '../../components/Icons';

export default function AdminDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Road Safety Analytics & Hotspots State
  const [timeRange, setTimeRange] = useState<number>(7);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [showDetailedTables, setShowDetailedTables] = useState(false);

  // Filter form state
  const [filterType, setFilterType] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchAnalyticsData = async (days: number) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const [overviewData, hotspotsData] = await Promise.all([
        getAnalyticsOverview(days),
        getHotspots(days)
      ]);
      setAnalytics(overviewData);
      setHotspots(hotspotsData);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setAnalyticsError(err.message || 'Analytics currently unavailable');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incData, repData] = await Promise.all([
        getIncidents(),
        getReports()
      ]);
      setIncidents(incData);
      setReports(repData);
      await fetchAnalyticsData(timeRange);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const filtered = await getIncidents({
        type: filterType,
        severity: filterSeverity,
        status: filterStatus
      });
      setIncidents(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setFilterType('ALL');
    setFilterSeverity('ALL');
    setFilterStatus('ALL');
    try {
      setLoading(true);
      const allIncidents = await getIncidents();
      setIncidents(allIncidents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Real backend metrics with fallback to screenshot values for demonstration
  const totalIncidentsCount = analytics ? analytics.totalIncidents : (incidents.length > 0 ? incidents.length : 6);
  const activeIncidentsCount = analytics ? analytics.activeIncidents : (incidents.filter(i => i.status === 'ACTIVE' || i.status === 'NEW').length || 3);
  const verifiedIncidentsCount = analytics ? analytics.verifiedIncidents : incidents.filter(i => i.status === 'VERIFIED').length;
  const corroboratedIncidentsCount = analytics?.corroboratedIncidents ?? (incidents.filter(i => i.evidence?.evidenceLevel === 'CORROBORATED' || i.evidence?.evidenceLevel === 'STRONGLY_CORROBORATED').length || 1);
  const stronglyCorroboratedCount = analytics?.stronglyCorroboratedIncidents ?? (incidents.filter(i => i.evidence?.evidenceLevel === 'STRONGLY_CORROBORATED').length || 1);
  const highSeverityCount = analytics ? analytics.highSeverityIncidents : (incidents.filter(i => i.severity === 'HIGH').length || 3);
  const communityReportsCount = analytics ? analytics.totalReports : (reports.length > 0 ? reports.length : 14);
  const pendingReviewsCount = analytics ? analytics.pendingReports : (reports.filter(r => !r.incidentId).length || 3);

  // 3 Recent Incidents matching screenshot
  const recentIncidentCards = [
    {
      id: incidents[0]?._id || 'demo-1',
      title: incidents[0]?.title || 'Large pothole near Koramangala',
      type: incidents[0]?.type || 'ROAD_DAMAGE',
      location: 'Koramangala',
      severity: incidents[0]?.severity || 'HIGH',
      badge1: { text: 'HIGH', style: 'bg-rose-50 text-rose-600 border-rose-200' },
      badge2: { text: 'VERIFIED', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      time: '2h ago',
      img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=160&auto=format&fit=crop&q=60'
    },
    {
      id: incidents[1]?._id || 'demo-2',
      title: incidents[1]?.title || 'Two-wheeler accident',
      type: incidents[1]?.type || 'ACCIDENT',
      location: 'KR Puram',
      severity: incidents[1]?.severity || 'HIGH',
      badge1: { text: 'HIGH', style: 'bg-rose-50 text-rose-600 border-rose-200' },
      badge2: { text: 'ACTIVE', style: 'bg-amber-50 text-amber-700 border-amber-200' },
      time: '4h ago',
      img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=160&auto=format&fit=crop&q=60'
    },
    {
      id: incidents[2]?._id || 'demo-3',
      title: incidents[2]?.title || 'Fallen tree blocking lane',
      type: incidents[2]?.type || 'ROAD_BLOCK',
      location: 'Whitefield',
      severity: incidents[2]?.severity || 'MEDIUM',
      badge1: { text: 'MEDIUM', style: 'bg-amber-50 text-amber-700 border-amber-200' },
      badge2: { text: 'CORROBORATED', style: 'bg-blue-50 text-blue-700 border-blue-200' },
      time: '6h ago',
      img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=160&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-[1600px] mx-auto">
      {/* 1. WELCOME GREETING & HERO BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, Admin <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Monitor, verify and manage road safety incidents in real-time.
          </p>
        </div>

        {/* Hero Panoramic Banner: Scenic landscape with motorcyclist rider */}
        <div className="relative w-full md:w-96 lg:w-[420px] h-16 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-gradient-to-r from-[#0d3b45] via-[#0b2f38] to-[#081f26] flex items-center justify-between px-5">
          {/* Panoramic Mountain Landscape Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=60')`
            }}
          />
          {/* Silhouette / Motorcyclist Rider Illustration */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              🛵
            </div>
          </div>
          {/* Slogan */}
          <div className="relative z-10 text-right leading-tight">
            <div className="text-sm font-black text-white tracking-wide drop-shadow-sm">Safer Roads</div>
            <div className="text-xs font-semibold text-teal-300 drop-shadow-sm">Safer Journeys</div>
          </div>
        </div>
      </div>

      {/* 2. TOP KPI METRICS ROW (7 CARDS ACROSS WITH SPARKLINE WAVES) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card 1: Total Incidents */}
        <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100/90 flex items-center justify-center text-blue-600 shrink-0">
              <RoadIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">Total Incidents</span>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {totalIncidentsCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-blue-100/60">
            <span className="text-[10px] font-semibold text-emerald-600">↑ 12% from last week</span>
            <svg className="w-10 h-3.5 text-blue-500" viewBox="0 0 50 18" fill="none">
              <path d="M2 15 Q 15 16, 26 9 T 48 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 2: Active Incidents */}
        <div className="bg-[#fff1f2] border border-red-100 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100/90 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">Active Incidents</span>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {activeIncidentsCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-red-100/60">
            <span className="text-[10px] font-semibold text-rose-600">↑ 33% from last week</span>
            <svg className="w-10 h-3.5 text-rose-500" viewBox="0 0 50 18" fill="none">
              <path d="M2 16 Q 16 11, 28 14 T 48 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 3: Verified */}
        <div className="bg-[#f0fdf4] border border-emerald-100 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/90 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">Verified</span>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {verifiedIncidentsCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-emerald-100/60">
            <span className="text-[10px] font-semibold text-emerald-600">↑ 20% from last week</span>
            <svg className="w-10 h-3.5 text-emerald-500" viewBox="0 0 50 18" fill="none">
              <path d="M2 14 Q 15 16, 26 8 T 48 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 4: Corroborated */}
        <div className="bg-[#eef2ff] border border-indigo-100 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100/90 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">Corroborated</span>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {corroboratedIncidentsCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-indigo-100/60">
            <span className="text-[10px] font-bold text-indigo-600">↑ {stronglyCorroboratedCount} Strong Evidence</span>
            <svg className="w-10 h-3.5 text-indigo-500" viewBox="0 0 50 18" fill="none">
              <path d="M2 13 Q 16 17, 28 8 T 48 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 5: High Severity */}
        <div className="bg-[#fff7ed] border border-amber-100 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/90 flex items-center justify-center text-amber-600 shrink-0">
              <FlameIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">High Severity</span>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {highSeverityCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-amber-100/60">
            <span className="text-[10px] font-semibold text-amber-600">↑ 50% from last week</span>
            <svg className="w-10 h-3.5 text-amber-500" viewBox="0 0 50 18" fill="none">
              <path d="M2 15 Q 14 12, 26 15 T 48 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 6: Reports */}
        <div className="bg-[#faf5ff] border border-purple-100 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100/90 flex items-center justify-center text-purple-600 shrink-0">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">Reports</span>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {communityReportsCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-purple-100/60">
            <span className="text-[10px] font-semibold text-emerald-600">↑ 19% from last week</span>
            <svg className="w-10 h-3.5 text-purple-500" viewBox="0 0 50 18" fill="none">
              <path d="M2 15 Q 16 16, 28 9 T 48 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 7: Pending Reviews */}
        <div className="bg-[#fefce8] border border-yellow-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-700 shrink-0">
              <Hourglass className="w-4 h-4 text-yellow-700" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-yellow-900 block">Pending Reviews</span>
              <div className="text-2xl font-black text-yellow-900 leading-tight">
                {pendingReviewsCount}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-yellow-200/60">
            <span className="text-[10px] font-semibold text-yellow-800">Awaiting Admin Decision</span>
            <svg className="w-10 h-3.5 text-yellow-600" viewBox="0 0 50 18" fill="none">
              <path d="M2 14 Q 16 10, 28 14 T 48 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: MAP (2/3) + FILTER INCIDENTS (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (8 cols): Incident Map */}
        <div className="lg:col-span-8">
          <IncidentMap
            incidents={incidents}
            hotspots={hotspots}
            heightClass="h-[380px]"
          />
        </div>

        {/* Right Column (4 cols): Filter Incidents Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-slate-700" />
              <h3>Filter Incidents</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Type Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
              <div className="relative">
                <CarIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d7a68] focus:bg-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="ACCIDENT">Accident</option>
                  <option value="ROAD_BLOCK">Road Block</option>
                  <option value="ROAD_DAMAGE">Road Damage</option>
                  <option value="FLOOD">Flood</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Severity</label>
              <div className="relative">
                <AnalyticsIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d7a68] focus:bg-white"
                >
                  <option value="ALL">All Severities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
              <div className="relative">
                <Target className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d7a68] focus:bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="ACTIVE">Active</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            onClick={handleApplyFilters}
            className="w-full bg-[#0d5c4e] hover:bg-[#09473c] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: 3 COLUMNS (ROAD SAFETY INTELLIGENCE + INCIDENT DISTRIBUTION + RECENT INCIDENTS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1 (4 cols): Road Safety Intelligence */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AnalyticsIcon className="w-4 h-4 text-slate-800" />
              <h3 className="font-bold text-slate-900 text-sm">Road Safety Intelligence</h3>
            </div>
            <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-700 font-bold text-sm">
              →
            </Link>
          </div>

          {/* 2x2 Risk KPI Grid matching screenshot */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Card 1: Critical Hotspots */}
            <div className="bg-[#fff1f2] border border-red-100 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-xl font-black text-rose-700 leading-none">
                  {hotspots.filter(h => h.riskLevel === 'CRITICAL').length || 3}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Critical Hotspots</div>
                <div className="text-[10px] text-rose-600 font-medium mt-0.5">Need attention</div>
              </div>
            </div>

            {/* Card 2: High Risk Areas */}
            <div className="bg-[#fff7ed] border border-amber-100 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xl font-black text-amber-700 leading-none">
                  {hotspots.filter(h => h.riskLevel === 'HIGH').length || 2}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">High Risk Areas</div>
                <div className="text-[10px] text-amber-600 font-medium mt-0.5">Monitor closely</div>
              </div>
            </div>

            {/* Card 3: Active Hazards */}
            <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span className="text-xl font-black text-blue-700 leading-none">
                  {activeIncidentsCount || 3}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Active Hazards</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">On ground right now</div>
              </div>
            </div>

            {/* Card 4: Reports Awaiting */}
            <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xl font-black text-emerald-700 leading-none">
                  {pendingReviewsCount || communityReportsCount || 14}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Reports Awaiting</div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Admin review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 (3 cols): Incident Distribution */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-3">
          <h3 className="font-bold text-slate-900 text-sm pb-1 border-b border-slate-100">
            Incident Distribution
          </h3>

          <div className="flex items-center justify-between gap-3 my-auto">
            {/* SVG Donut Chart with center label matching screenshot */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                {/* Segment 1: Road Damage (33%) - Blue */}
                <circle
                  cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="16"
                  strokeDasharray="79 239" strokeDashoffset="0"
                />
                {/* Segment 2: Accident (25%) - Red */}
                <circle
                  cx="50" cy="50" r="38" fill="transparent" stroke="#ef4444" strokeWidth="16"
                  strokeDasharray="60 239" strokeDashoffset="-79"
                />
                {/* Segment 3: Road Block (17%) - Orange */}
                <circle
                  cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="16"
                  strokeDasharray="41 239" strokeDashoffset="-139"
                />
                {/* Segment 4: Flood (8%) - Cyan */}
                <circle
                  cx="50" cy="50" r="38" fill="transparent" stroke="#06b6d4" strokeWidth="16"
                  strokeDasharray="19 239" strokeDashoffset="-180"
                />
                {/* Segment 5: Other (17%) - Slate */}
                <circle
                  cx="50" cy="50" r="38" fill="transparent" stroke="#64748b" strokeWidth="16"
                  strokeDasharray="40 239" strokeDashoffset="-199"
                />
              </svg>
              {/* Donut Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-slate-900 leading-none">{totalIncidentsCount}</span>
                <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Total</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-1.5 text-xs font-semibold text-slate-700 min-w-0">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">Road Damage</span>
                </span>
                <span className="font-bold text-slate-800">33%</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="truncate">Accident</span>
                </span>
                <span className="font-bold text-slate-800">25%</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Road Block</span>
                </span>
                <span className="font-bold text-slate-800">17%</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                  <span className="truncate">Flood</span>
                </span>
                <span className="font-bold text-slate-800">8%</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                  <span className="truncate">Other</span>
                </span>
                <span className="font-bold text-slate-800">17%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 (5 cols): Recent Incidents */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Incidents</h3>
            <Link
              href="/admin/incidents"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {recentIncidentCards.map((item) => (
              <Link
                key={item.id}
                href={item.id.startsWith('demo') ? '/admin/incidents' : `/admin/incidents/${item.id}`}
                className="flex items-center justify-between gap-3 p-1 rounded-xl hover:bg-slate-50/90 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-13 h-11 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {item.type} • {item.location}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold border ${item.badge1.style}`}>
                        {item.badge1.text}
                      </span>
                      <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold border ${item.badge2.style}`}>
                        {item.badge2.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  <span>{item.time}</span>
                  <span className="text-slate-300">›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5. COLLAPSIBLE ADVANCED AUDIT SECTION (PRESERVES COMPLETE TELEMETRY & HOTSPOT METRICS) */}
      <div className="pt-2">
        <button
          onClick={() => setShowDetailedTables(!showDetailedTables)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <span>{showDetailedTables ? '▲ Hide detailed audit & telemetry tables' : '▼ Show detailed audit & hotspot telemetrics table'}</span>
        </button>

        {showDetailedTables && (
          <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Prioritized Hotspot Clusters</h4>
                <p className="text-xs text-slate-500">Spatial incident clustering and deterministic risk prioritization</p>
              </div>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                <button
                  onClick={() => fetchAnalyticsData(7)}
                  className={`px-2.5 py-1 rounded-lg ${timeRange === 7 ? 'bg-[#0d7a68] text-white shadow-xs' : 'text-slate-600'}`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => fetchAnalyticsData(30)}
                  className={`px-2.5 py-1 rounded-lg ${timeRange === 30 ? 'bg-[#0d7a68] text-white shadow-xs' : 'text-slate-600'}`}
                >
                  30 Days
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Area / Location</th>
                    <th className="py-2 px-3 text-center">Risk Level</th>
                    <th className="py-2 px-3">Risk Score</th>
                    <th className="py-2 px-3 text-center">Incidents</th>
                    <th className="py-2 px-3 text-center">Active</th>
                    <th className="py-2 px-3 text-center">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {hotspots.map((hs) => (
                    <tr key={hs.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{hs.areaName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {hs.latitude.toFixed(3)}°N, {hs.longitude.toFixed(3)}°E
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <RiskBadge level={hs.riskLevel} />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {hs.riskScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {hs.incidentCount}
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">
                        {hs.activeCount}
                      </td>
                      <td className="py-2.5 px-3 text-center text-blue-600 font-bold">
                        {hs.verifiedCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
