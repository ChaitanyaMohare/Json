'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getIncidents, updateIncidentStatus, Incident, IncidentStatus } from '../../../lib/api';
import { SeverityBadge, StatusBadge, TypeBadge, EvidenceBadge } from '../../../components/Badges';
import {
  AlertTriangle,
  RefreshCw,
  Eye,
  ChevronDown,
  CarIcon,
  BarrierIcon,
  RoadDamageIcon,
  FloodIcon,
  MoreHorizontal
} from '../../../components/Icons';

const TYPES = ['ALL', 'ACCIDENT', 'ROAD_BLOCK', 'ROAD_DAMAGE', 'FLOOD', 'OTHER'];
const SEVERITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['ALL', 'NEW', 'ACTIVE', 'VERIFIED', 'RESOLVED', 'REJECTED'];

export default function IncidentsManagementPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchIncidentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIncidents({
        type: selectedType,
        severity: selectedSeverity,
        status: selectedStatus
      });
      setIncidents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData();
  }, [selectedType, selectedSeverity, selectedStatus]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-red-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </span>
            Road Incidents Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, and verify all live road hazards across the network.
          </p>
        </div>
        <button
          onClick={fetchIncidentsData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar matching design */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Filter by Type
          </label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All Types' : t}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Filter by Severity
          </label>
          <div className="relative">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Severities' : s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Filter by Status
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            Fetching incidents from RouteGuard API...
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            No incidents matched the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Evidence</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {incidents.map((inc, idx) => {
                  const typeIcon = inc.type === 'ACCIDENT' ? (
                    <span className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                      <CarIcon className="w-3.5 h-3.5" />
                    </span>
                  ) : inc.type === 'ROAD_BLOCK' ? (
                    <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                      <BarrierIcon className="w-3.5 h-3.5" />
                    </span>
                  ) : inc.type === 'FLOOD' ? (
                    <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FloodIcon className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-md bg-yellow-50 text-yellow-600 flex items-center justify-center">
                      <RoadDamageIcon className="w-3.5 h-3.5" />
                    </span>
                  );

                  return (
                    <tr key={inc._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3.5 px-3">{typeIcon}</td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/incidents/${inc._id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {inc.title}
                        </Link>
                        {inc.description && (
                          <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                            {inc.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-600">
                        {(inc.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="py-3.5 px-3">
                        <EvidenceBadge level={inc.evidence?.evidenceLevel || 'ISOLATED'} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(inc.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin/incidents/${inc._id}`}
                          className="px-3 py-1 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
