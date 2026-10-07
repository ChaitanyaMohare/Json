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
  ExternalLink
} from '../../../components/Icons';

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            Raw incoming crowdsourced road hazard reports submitted via the mobile rider app.
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

      {/* Reports Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            Fetching rider reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            No community reports have been submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Linked Incident</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reports.map((rep) => {
                  const [lng, lat] = rep.location?.coordinates || [0, 0];
                  return (
                    <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <TypeBadge type={rep.type} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 max-w-sm truncate">
                          {rep.description || 'No description provided'}
                        </div>
                        {rep.imageUrl && (
                          <span className="text-[10px] text-blue-600 font-medium mt-0.5 inline-block">
                            [Photo Attachment Included]
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {rep.incidentId ? (
                          <Link
                            href={`/admin/incidents/${rep.incidentId}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>#{rep.incidentId.slice(-6)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">Unlinked</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(rep.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin/reports/${rep._id}`}
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
