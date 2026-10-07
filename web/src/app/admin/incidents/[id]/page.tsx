'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getIncident,
  updateIncidentStatus,
  getReports,
  getIncidentEvidence,
  Incident,
  IncidentStatus,
  Report,
  IncidentEvidenceData
} from '../../../../lib/api';
import IncidentMap from '../../../../components/IncidentMap';
import { SeverityBadge, StatusBadge, TypeBadge, EvidenceBadge } from '../../../../components/Badges';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Activity,
  Shield,
  FileText,
  ExternalLink,
  Users,
  RefreshCw
} from '../../../../components/Icons';

function IncidentDetailsContent() {
  const params = useParams();
  const id = params?.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [sourceReport, setSourceReport] = useState<Report | null>(null);
  const [evidenceData, setEvidenceData] = useState<IncidentEvidenceData | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update states
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchIncidentDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [incData, allReports, evData] = await Promise.all([
        getIncident(id),
        getReports(),
        getIncidentEvidence(id).catch((err) => {
          console.warn('Could not load incident evidence:', err);
          return null;
        })
      ]);
      setIncident(incData);
      setEvidenceData(evData);
      const matching = allReports.find((r) => r.incidentId === id);
      if (matching) {
        setSourceReport(matching);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus: IncidentStatus) => {
    if (!id) return;
    try {
      setUpdating(true);
      setFeedback(null);
      const updated = await updateIncidentStatus(id, newStatus);
      setIncident(updated);
      setFeedback({
        message: `Incident status updated to ${newStatus} successfully!`,
        type: 'success'
      });
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Failed to update status',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium text-xs animate-pulse">
        Loading incident telemetrics...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="space-y-4">
        <Link href="/admin/incidents" className="text-xs font-semibold text-[#2563eb] hover:underline">
          &larr; Back to Incidents
        </Link>
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
          <h3 className="font-bold text-base">Error Loading Incident</h3>
          <p className="text-xs mt-1 text-rose-600">{error || 'Incident not found'}</p>
        </div>
      </div>
    );
  }

  const [lng, lat] = incident.location?.coordinates || [0, 0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button & ID */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/incidents"
          className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center gap-1.5"
        >
          <span>&larr;</span> Back to Incidents List
        </Link>
        <span className="text-xs font-mono text-slate-400">ID: {incident._id}</span>
      </div>

      {/* Success / Error Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Main Incident Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={incident.type} />
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            <EvidenceBadge level={evidenceData?.evidenceLevel ?? incident.evidence?.evidenceLevel ?? 'ISOLATED'} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">{incident.title}</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {incident.description || 'No detailed incident description provided.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleStatusUpdate('VERIFIED')}
            disabled={updating || incident.status === 'VERIFIED'}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verify
          </button>

          <button
            onClick={() => handleStatusUpdate('RESOLVED')}
            disabled={updating || incident.status === 'RESOLVED'}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
          >
            <Shield className="w-4 h-4 text-slate-300" />
            Resolve
          </button>

          <button
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={updating || incident.status === 'REJECTED'}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>

      {/* SECTION: EVIDENCE SOURCES & CORROBORATION */}
      {(() => {
        const effectiveReportCount = evidenceData?.reportCount ?? incident.evidence?.reportCount ?? (sourceReport ? 1 : 0);
        const effectiveScore = evidenceData?.corroborationScore ?? incident.evidence?.corroborationScore ?? 0;
        const effectiveLevel = evidenceData?.evidenceLevel ?? incident.evidence?.evidenceLevel ?? 'ISOLATED';

        const originalReport = evidenceData?.reports?.find(r => r.isOriginal) || (evidenceData?.reports?.[0]) || (sourceReport ? {
          reportId: sourceReport._id,
          _id: sourceReport._id,
          type: sourceReport.type,
          description: sourceReport.description,
          imageUrl: sourceReport.imageUrl,
          createdAt: sourceReport.createdAt,
          isOriginal: true
        } : null);

        const origId = originalReport ? (originalReport.reportId || originalReport._id || '') : '';
        const additionalReports = evidenceData?.reports?.filter(r => (r.reportId || r._id) !== origId) || [];

        return (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      EVIDENCE SOURCES
                    </h2>
                    <EvidenceBadge level={effectiveLevel} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Community hazard reports contributing spatial evidence toward this official incident.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (id) {
                    setLoadingEvidence(true);
                    getIncidentEvidence(id)
                      .then(setEvidenceData)
                      .catch(console.error)
                      .finally(() => setLoadingEvidence(false));
                  }
                }}
                disabled={loadingEvidence}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEvidence ? 'animate-spin' : ''}`} />
                <span>Refresh Evidence</span>
              </button>
            </div>

            {/* 3 Metric Cards: Supporting Report Count, Evidence Level, Corroboration Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Supporting Reports
                </span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {effectiveReportCount}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                  {effectiveReportCount > 1
                    ? `${effectiveReportCount - 1} corroborating report(s) fused`
                    : '1 primary community report'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Evidence Level
                </span>
                <div className="mt-2">
                  <EvidenceBadge level={effectiveLevel} />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1.5 font-medium">
                  {effectiveLevel === 'STRONGLY_CORROBORATED'
                    ? 'High-confidence multiple corroboration'
                    : effectiveLevel === 'CORROBORATED'
                    ? 'Corroborated by nearby community evidence'
                    : 'Isolated report awaiting corroboration'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Corroboration Score
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-mono font-black text-indigo-700">
                    {effectiveScore}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      effectiveScore >= 75
                        ? 'bg-indigo-600'
                        : effectiveScore >= 50
                        ? 'bg-blue-600'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${effectiveScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Original Report Box */}
            {originalReport && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-200 text-purple-800 text-[10px] font-black tracking-wider uppercase">
                      Original Source Report
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-900">
                      #{origId.slice(-6)}
                    </span>
                  </div>
                  <Link
                    href={`/admin/reports/${origId}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Inspect Report #{origId.slice(-6)} <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <p className="text-xs text-purple-950 font-medium">
                  &ldquo;{originalReport.description || 'No description provided.'}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-purple-800/80 pt-1">
                  <span>Category: <b>{originalReport.type}</b></span>
                  {originalReport.createdAt && (
                    <span>Reported: {new Date(originalReport.createdAt).toLocaleString()}</span>
                  )}
                </div>

                {originalReport.imageUrl && (
                  <div className="pt-2">
                    <img
                      src={originalReport.imageUrl}
                      alt="Original report evidence"
                      className="w-36 h-24 rounded-xl object-cover border border-purple-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Additional Corroborating Reports */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Additional Corroborating Reports ({additionalReports.length})
                </h3>
                <span className="text-[10px] text-slate-400">
                  Each piece of evidence independently links to the original submission
                </span>
              </div>

              {additionalReports.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No additional community reports have merged into this incident yet.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Report</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Distance</th>
                        <th className="py-2.5 px-3">Time Delta</th>
                        <th className="py-2.5 px-3">Submitted</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                      {additionalReports.map((rep) => {
                        const repId = rep.reportId || rep._id || '';
                        return (
                          <tr key={repId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              <Link
                                href={`/admin/reports/${repId}`}
                                className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <span>Report #{repId.slice(-6)}</span>
                                <ExternalLink className="w-3 h-3 text-blue-400" />
                              </Link>
                              {rep.description && (
                                <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                                  {rep.description}
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <TypeBadge type={rep.type} />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700">
                              {rep.distanceMeters !== undefined ? `${rep.distanceMeters}m` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {rep.timeDifferenceMinutes !== undefined
                                ? rep.timeDifferenceMinutes < 60
                                  ? `${rep.timeDifferenceMinutes} min`
                                  : `${Math.floor(rep.timeDifferenceMinutes / 60)}h ${rep.timeDifferenceMinutes % 60}m`
                                : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {rep.createdAt ? new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Link
                                href={`/admin/reports/${repId}`}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                              >
                                Inspect Report
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
      })()}

      {/* Grid: Properties + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Properties Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Telemetry Parameters
            </h3>

            <div>
              <span className="text-xs font-medium text-slate-500 block">AI / System Confidence</span>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563eb] h-full rounded-full transition-all"
                    style={{ width: `${incident.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {(incident.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 block">Geospatial Coordinates</span>
              <div className="text-xs font-mono text-slate-700 mt-1 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 block">Reported Timestamp</span>
              <div className="text-xs text-slate-700 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(incident.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 block">Last State Transition</span>
              <div className="text-xs text-slate-700 mt-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(incident.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dedicated Map View */}
        <div className="lg:col-span-2">
          <IncidentMap
            singleIncident={incident}
            centerCoordinates={[lng, lat]}
            zoom={14}
            heightClass="h-[380px]"
          />
        </div>
      </div>
    </div>
  );
}

export default function IncidentDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-medium text-xs animate-pulse">Loading incident telemetrics...</div>}>
      <IncidentDetailsContent />
    </Suspense>
  );
}
