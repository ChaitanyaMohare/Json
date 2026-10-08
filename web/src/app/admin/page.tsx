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
  AnalyticsIcon,
  MapPin
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
      {/* 1. HERO BANNER WITH MOTORCYCLIST - "Safer Riders, Brighter Destinations" */}
      <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg border border-slate-200/80">
        {/* Panoramic Mountain & Motorcyclist Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=1200&auto=format&fit=crop&q=80')`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
              Safer Riders
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2dd4bf] mt-1 drop-shadow-lg">
              Brighter Destinations
            </h2>
            <p className="text-sm md:text-base text-white/90 mt-3 max-w-xl font-medium drop-shadow-md">
              Monitor real-time incidents, track journeys and keep every rider safe on the road.
            </p>
          </div>
          
          {/* Stats Banner at Bottom */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Users className="w-5 h-5 text-white" />
              <div>
                <div className="text-xs font-semibold text-white/80">Active Journeys</div>
                <div className="text-xl font-black text-white leading-tight">1,248</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                <span>↑</span>
                <span>12%</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5">
              <div className="text-xs font-semibold text-white/80">Riders currently on road</div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div>
        <p className="text-xs text-slate-500 font-medium">
          Welcome back, Admin 👋 Monitor, verify and manage road safety incidents in real-time.
        </p>
      </div>

      {/* 2. TOP KPI METRICS ROW (4 MAIN CARDS MATCHING REFERENCE IMAGE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Incidents - RED theme */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Total Incidents</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900">{totalIncidentsCount}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-bold text-red-600">↑ 18%</span>
                <span className="text-xs text-slate-400">Full view this week</span>
              </div>
            </div>
            {/* Mini sparkline chart - red */}
            <svg className="w-16 h-10" viewBox="0 0 60 30" fill="none">
              <path d="M2 28 L 12 25 L 20 20 L 28 22 L 36 15 L 44 18 L 52 12 L 58 8" 
                stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 28 L 12 25 L 20 20 L 28 22 L 36 15 L 44 18 L 52 12 L 58 8 L 58 30 L 2 30 Z" 
                fill="url(#redGradient)" opacity="0.2"/>
              <defs>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 2: Verified Incidents - GREEN theme */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Verified Incidents</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900">{verifiedIncidentsCount}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-bold text-emerald-600">↑ 73%</span>
                <span className="text-xs text-slate-400">Full view this week</span>
              </div>
            </div>
            {/* Mini sparkline chart - green */}
            <svg className="w-16 h-10" viewBox="0 0 60 30" fill="none">
              <path d="M2 25 L 12 22 L 20 18 L 28 20 L 36 14 L 44 16 L 52 10 L 58 6" 
                stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 25 L 12 22 L 20 18 L 28 20 L 36 14 L 44 16 L 52 10 L 58 6 L 58 30 L 2 30 Z" 
                fill="url(#greenGradient)" opacity="0.2"/>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 3: Active Journeys - YELLOW theme */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <RoadIcon className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Active Journeys</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900">1,248</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-bold text-emerald-600">↑ 12%</span>
                <span className="text-xs text-slate-400">Average last 90 days</span>
              </div>
            </div>
            {/* Mini sparkline chart - yellow */}
            <svg className="w-16 h-10" viewBox="0 0 60 30" fill="none">
              <path d="M2 24 L 12 20 L 20 22 L 28 18 L 36 16 L 44 19 L 52 14 L 58 10" 
                stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 24 L 12 20 L 20 22 L 28 18 L 36 16 L 44 19 L 52 14 L 58 10 L 58 30 L 2 30 Z" 
                fill="url(#yellowGradient)" opacity="0.2"/>
              <defs>
                <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 4: Total Riders - BLUE theme */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Total Riders</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900">5,420</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-bold text-emerald-600">↑ 22%</span>
                <span className="text-xs text-slate-400">Community members</span>
              </div>
            </div>
            {/* Mini sparkline chart - blue */}
            <svg className="w-16 h-10" viewBox="0 0 60 30" fill="none">
              <path d="M2 26 L 12 23 L 20 19 L 28 21 L 36 15 L 44 17 L 52 11 L 58 7" 
                stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 26 L 12 23 L 20 19 L 28 21 L 36 15 L 44 17 L 52 11 L 58 7 L 58 30 L 2 30 Z" 
                fill="url(#blueGradient)" opacity="0.2"/>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: LIVE MAP + RECENT INCIDENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (8 cols): Live Incident Map */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Map Header with Live Badge */}
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-900 text-base">Live Incident Map</h3>
              <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0d7a68]">
                <option>All Incidents</option>
                <option>Critical Only</option>
                <option>High Severity</option>
              </select>
              <Link href="/admin/map" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          
          <IncidentMap
            incidents={incidents}
            hotspots={hotspots}
            heightClass="h-[380px]"
          />
        </div>

        {/* Right Column (4 cols): Recent Incidents */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
            <h3 className="font-bold text-slate-900 text-base">Recent Incidents</h3>
            <Link href="/admin/incidents" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Incidents List */}
          <div className="flex-1 overflow-y-auto">
            {recentIncidentCards.slice(0, 5).map((item, idx) => (
              <Link
                key={item.id}
                href={item.id.startsWith('demo') ? '/admin/incidents' : `/admin/incidents/${item.id}`}
                className="flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                {/* Incident Image */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                />
                
                {/* Incident Info */}
                <div className="flex-1 min-w-0">
                  {/* Severity Badge */}
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1.5 ${
                    item.badge1.text === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    item.badge1.text === 'HIGH' ? 'bg-red-100 text-red-700' :
                    item.badge1.text === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.badge1.text}
                  </span>
                  
                  {/* Title */}
                  <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  
                  {/* Location & Type */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${item.badge2.style}`}>
                    {item.badge2.text}
                  </span>
                </div>
                
                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 mt-2" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 4. POWER SAFETY MONITORING + HIGH RISK ROUTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Power Safety Monitoring */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Power Safety Monitoring</h3>
            <Link href="/admin/analytics" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-5 space-y-3">
            {/* Sample User Monitoring Entries */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  RS
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Rohit Sharma</div>
                  <div className="text-xs text-slate-500">Mumbai → Leh</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
                <span className="text-xs text-slate-400">2h 16m</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  AV
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Aman Verma</div>
                  <div className="text-xs text-slate-500">Delhi → Solih</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
                <span className="text-xs text-slate-400">1h 50m</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                  VS
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Vikram Singh</div>
                  <div className="text-xs text-slate-500">Ahmedabad → Leh</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
                <span className="text-xs text-slate-400">3h 20m</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
                  KM
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Karan Mehta</div>
                  <div className="text-xs text-slate-500">Bengaluru → Rameshwaram</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  No Movement
                </span>
                <span className="text-xs text-slate-400">48m</span>
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Routes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">High Risk Routes</h3>
            <Link href="/admin/map" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-5 space-y-3">
            {/* Risk Route Cards */}
            <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900">Manali → Leh</h4>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">High risk</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">High risk • 26 incidents</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white"></div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900">Srinagar → Badrinath</h4>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">High risk</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">High risk • 26 incidents</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900">Rishikesh → Badrinath</h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">Moderate risk</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Moderate risk • 20 incidents</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INCIDENT CATEGORIES + INCIDENT TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Incident Categories Donut */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Incident Categories</h3>
            <select className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          
          <div className="flex items-center justify-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#e2e8f0" strokeWidth="14" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#ef4444" strokeWidth="14"
                  strokeDasharray="69 220" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f59e0b" strokeWidth="14"
                  strokeDasharray="44 220" strokeDashoffset="-69" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#3b82f6" strokeWidth="14"
                  strokeDasharray="33 220" strokeDashoffset="-113" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#8b5cf6" strokeWidth="14"
                  strokeDasharray="28 220" strokeDashoffset="-146" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#64748b" strokeWidth="14"
                  strokeDasharray="24 220" strokeDashoffset="-174" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-slate-900">{totalIncidentsCount}</div>
                <div className="text-xs font-semibold text-slate-400">Total</div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-slate-700 font-medium">Potholes</span>
                </span>
                <span className="font-bold text-slate-900">32%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700 font-medium">Accidents</span>
                </span>
                <span className="font-bold text-slate-900">20%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-slate-700 font-medium">Road Blockage</span>
                </span>
                <span className="font-bold text-slate-900">15%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span className="text-slate-700 font-medium">Weather Hazard</span>
                </span>
                <span className="font-bold text-slate-900">11%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <span className="text-slate-700 font-medium">Others</span>
                </span>
                <span className="font-bold text-slate-900">22%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Trends Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Incident Trends</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Critical
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  High
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Medium
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Low
                </span>
              </div>
              <select className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2">
            {[
              { date: 'Sep 14', critical: 35, high: 25, medium: 40, low: 20 },
              { date: 'Sep 15', critical: 40, high: 30, medium: 35, low: 25 },
              { date: 'Sep 16', critical: 30, high: 35, medium: 45, low: 30 },
              { date: 'Sep 17', critical: 45, high: 40, medium: 30, low: 35 },
              { date: 'Sep 18', critical: 35, high: 35, medium: 50, low: 25 },
              { date: 'Sep 19', critical: 50, high: 45, medium: 35, low: 40 },
              { date: 'Sep 20', critical: 40, high: 35, medium: 55, low: 30 },
              { date: 'Sep 21', critical: 55, high: 50, medium: 40, low: 45 },
              { date: 'Sep 22', critical: 45, high: 40, medium: 60, low: 35 },
              { date: 'Oct 4', critical: 60, high: 55, medium: 45, low: 50 },
              { date: 'Oct 6', critical: 50, high: 45, medium: 65, low: 40 },
              { date: 'Oct 7', critical: 65, high: 60, medium: 50, low: 55 },
            ].map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex flex-col gap-0.5">
                  <div 
                    className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                    style={{ height: `${day.critical}%` }}
                  ></div>
                  <div 
                    className="w-full bg-amber-500 hover:bg-amber-600 transition-colors"
                    style={{ height: `${day.high}%` }}
                  ></div>
                  <div 
                    className="w-full bg-blue-500 hover:bg-blue-600 transition-colors"
                    style={{ height: `${day.medium}%` }}
                  ></div>
                  <div 
                    className="w-full bg-emerald-500 rounded-b hover:bg-emerald-600 transition-colors"
                    style={{ height: `${day.low}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                  {day.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ORIGINAL SECTIONS BELOW - KEEPING FILTER PANEL AND OTHER FEATURES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Filter Incidents Card */}
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

        {/* Road Safety Intelligence - Keeping existing */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AnalyticsIcon className="w-4 h-4 text-slate-800" />
              <h3 className="font-bold text-slate-900 text-sm">Road Safety Intelligence</h3>
            </div>
            <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-700 font-bold text-sm">
              →
            </Link>
          </div>

          {/* 2x2 Risk KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Critical Hotspots */}
            <div className="bg-[#fff1f2] border border-red-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span className="text-2xl font-black text-rose-700 leading-none">
                  {hotspots.filter(h => h.riskLevel === 'CRITICAL').length || 3}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-slate-800 leading-tight">Critical Hotspots</div>
                <div className="text-xs text-rose-600 font-medium mt-0.5">Need attention</div>
              </div>
            </div>

            {/* Card 2: High Risk Areas */}
            <div className="bg-[#fff7ed] border border-amber-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-2xl font-black text-amber-700 leading-none">
                  {hotspots.filter(h => h.riskLevel === 'HIGH').length || 2}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-slate-800 leading-tight">High Risk Areas</div>
                <div className="text-xs text-amber-600 font-medium mt-0.5">Monitor closely</div>
              </div>
            </div>

            {/* Card 3: Active Hazards */}
            <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-black text-blue-700 leading-none">
                  {activeIncidentsCount || 3}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-slate-800 leading-tight">Active Hazards</div>
                <div className="text-xs text-blue-600 font-medium mt-0.5">On ground right now</div>
              </div>
            </div>

            {/* Card 4: Reports Awaiting */}
            <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-black text-emerald-700 leading-none">
                  {pendingReviewsCount || communityReportsCount || 14}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-slate-800 leading-tight">Reports Awaiting</div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">Admin review</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. COLLAPSIBLE ADVANCED AUDIT SECTION (PRESERVES COMPLETE TELEMETRY & HOTSPOT METRICS) */}
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
