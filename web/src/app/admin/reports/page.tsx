'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReports, Report } from '../../../lib/api';
import { TypeBadge } from '../../../components/Badges';
import {
  FileText,
  RefreshCw,
  MapPin,
  Clock,
  Eye,
  ExternalLink,
  CarIcon,
  BarrierIcon,
  RoadDamageIcon,
  FloodIcon,
  AlertTriangle
} from '../../../components/Icons';

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Group reports by type
  const reportsByType = reports.reduce((acc, report) => {
    const type = report.type || 'OTHER';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  // Filter reports based on selected filter
  const filteredReportsByType = selectedFilter
    ? { [selectedFilter]: reportsByType[selectedFilter] || [] }
    : reportsByType;

  // Define type configurations with colors and icons
  const typeConfig: Record<string, { 
    label: string; 
    icon: any; 
    color: string; 
    bgColor: string; 
    borderColor: string;
    iconBg: string;
  }> = {
    ACCIDENT: {
      label: 'Accidents',
      icon: CarIcon,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100'
    },
    ROAD_BLOCK: {
      label: 'Road Blockages',
      icon: BarrierIcon,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100'
    },
    ROAD_DAMAGE: {
      label: 'Road Damage',
      icon: RoadDamageIcon,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100'
    },
    FLOOD: {
      label: 'Floods',
      icon: FloodIcon,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100'
    },
    OTHER: {
      label: 'Other Hazards',
      icon: AlertTriangle,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      iconBg: 'bg-slate-100'
    }
  };

  const sortedTypes = Object.keys(filteredReportsByType).sort((a, b) => {
    return (reportsByType[b]?.length || 0) - (reportsByType[a]?.length || 0);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </span>
            Rider Hazard Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Crowdsourced road hazard reports organized by incident type
          </p>
        </div>
        <button
          onClick={fetchReportsData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Reports
        </button>
      </div>

      {/* Summary Stats with Filter Functionality */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold text-slate-700">Filter by Type:</h2>
        <button
          onClick={() => setSelectedFilter(null)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            selectedFilter === null
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Show All ({reports.length})
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = reportsByType[type]?.length || 0;
          const Icon = config.icon;
          const isActive = selectedFilter === type;
          
          return (
            <button
              key={type}
              onClick={() => setSelectedFilter(isActive ? null : type)}
              disabled={count === 0}
              className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-4 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? 'ring-4 ring-offset-2 ring-offset-white scale-105 shadow-xl' : ''
              } ${isActive ? config.borderColor.replace('border-', 'ring-') : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <span className={`text-2xl font-black ${config.color}`}>{count}</span>
              </div>
              <div className={`text-xs font-bold ${config.color} text-left`}>{config.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 text-left">
                {isActive ? 'Filtering...' : 'Click to filter'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Fetching rider reports...
          </div>
        </div>
      )}

      {/* No Reports */}
      {!loading && reports.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No Reports Yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Community reports will appear here once submitted.
          </p>
        </div>
      )}

      {/* Reports Grouped by Type */}
      {!loading && sortedTypes.length > 0 && (
        <div className="space-y-6">
          {selectedFilter && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Filtering: {typeConfig[selectedFilter]?.label || 'Unknown Type'}
                  </p>
                  <p className="text-xs text-blue-600">
                    Showing {filteredReportsByType[selectedFilter]?.length || 0} report(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFilter(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Clear Filter
              </button>
            </div>
          )}

          {sortedTypes.map((type) => {
        const config = typeConfig[type] || typeConfig.OTHER;
        const Icon = config.icon;
        const typeReports = filteredReportsByType[type] || [];

        if (typeReports.length === 0) return null;

        return (
          <div key={type} className="space-y-3">
            {/* Type Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <h2 className={`text-lg font-black ${config.color}`}>{config.label}</h2>
                  <p className="text-xs text-slate-500">{typeReports.length} report{typeReports.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {typeReports.map((report) => {
                const [lng, lat] = report.location?.coordinates || [0, 0];
                return (
                  <div
                    key={report._id}
                    className={`${config.bgColor} ${config.borderColor} border rounded-2xl overflow-hidden hover:shadow-lg transition-all group`}
                  >
                    {/* Image if available */}
                    {report.imageUrl && (
                      <div className="h-40 overflow-hidden bg-slate-200">
                        <img
                          src={report.imageUrl}
                          alt="Report"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      {/* Description */}
                      <div>
                        <p className="text-sm font-bold text-slate-900 line-clamp-2 mb-1">
                          {report.description || 'No description provided'}
                        </p>
                        <TypeBadge type={report.type} />
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="font-mono">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(report.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>

                        {report.incidentId && (
                          <Link
                            href={`/admin/incidents/${report.incidentId}`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            Linked
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {/* Actions */}
                      <Link
                        href={`/admin/reports/${report._id}`}
                        className={`w-full py-2 px-3 rounded-xl ${config.iconBg} ${config.color} hover:opacity-80 text-xs font-bold inline-flex items-center justify-center gap-2 transition-all`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
}
