'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getReport,
  analyzeReport,
  promoteReport,
  getReportCorroboration,
  Report,
  IncidentType,
  IncidentSeverity,
  ReportCorroborationData
} from '../../../../lib/api';
import { TypeBadge, SeverityBadge, EvidenceBadge } from '../../../../components/Badges';
import {
  FileText,
  Clock,
  MapPin,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Shield,
  Users
} from '../../../../components/Icons';

function ReportDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [corroboration, setCorroboration] = useState<ReportCorroborationData | null>(null);
  const [loadingCorroboration, setLoadingCorroboration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Promote state
  const [promoting, setPromoting] = useState(false);
  const [promoteFeedback, setPromoteFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchReportData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getReport(id);
      setReport(data);

      try {
        const corrData = await getReportCorroboration(id);
        setCorroboration(corrData);
      } catch (cErr) {
        console.warn('Could not load corroboration for report:', cErr);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const handleAnalyzeWithAi = async () => {
    if (!report) return;
    try {
      setAnalyzing(true);
      setAiFeedback(null);
      const result = await analyzeReport({
        reportId: report._id,
        description: report.description,
        type: report.type,
        imageUrl: report.imageUrl || undefined
      });

      // Update state with newly analyzed report data
      if (result.report) {
        setReport(result.report);
      } else {
        setReport({ ...report, aiAnalysis: result.analysis });
      }

      setAiFeedback({
        message: 'AI Incident Analysis completed successfully!',
        type: 'success'
      });
    } catch (err: any) {
      setAiFeedback({
        message: err.message || 'Failed to analyze report with AI',
        type: 'error'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePromoteToIncident = async () => {
    if (!report) return;
    try {
      setPromoting(true);
      setPromoteFeedback(null);
      const result = await promoteReport(report._id);
      if (result.report) {
        setReport(result.report);
      }

      // Re-fetch corroboration data
      try {
        const corrData = await getReportCorroboration(report._id);
        setCorroboration(corrData);
      } catch (cErr) {
        console.warn('Could not re-fetch corroboration:', cErr);
      }

      if (result.action === 'ATTACHED_TO_EXISTING_INCIDENT') {
        const incId = result.incidentId || result.incident?._id || '';
        setPromoteFeedback({
          message: `Corroborated evidence merged! Attached report to existing active incident (${incId ? `#${incId.slice(-6)}` : ''}) with evidence level ${result.evidenceLevel || 'CORROBORATED'} — Duplicate incident prevented.`,
          type: 'success'
        });
      } else {
        setPromoteFeedback({
          message: 'Report successfully promoted to a new Official Incident with status ACTIVE!',
          type: 'success'
        });
      }
    } catch (err: any) {
      setPromoteFeedback({
        message: err.message || 'Promotion failed',
        type: 'error'
      });
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium text-xs animate-pulse">
        Loading report telemetrics...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link href="/admin/reports" className="text-xs font-semibold text-[#2563eb] hover:underline">
          &larr; Back to Reports List
        </Link>
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
          <h3 className="font-bold text-base">Error Loading Report</h3>
          <p className="text-xs mt-1 text-rose-600">{error || 'Report not found'}</p>
        </div>
      </div>
    );
  }

  const [lng, lat] = report.location?.coordinates || [0, 0];
  const ai = report.aiAnalysis;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/reports"
          className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center gap-1.5"
        >
          <span>&larr;</span> Back to Reports List
        </Link>
        <span className="text-xs font-mono text-slate-400">REPORT ID: {report._id}</span>
      </div>

      {/* Global Feedback Notifications */}
      {promoteFeedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm ${
            promoteFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {promoteFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{promoteFeedback.message}</span>
          </div>
          <button onClick={() => setPromoteFeedback(null)} className="text-xs opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: REPORT BASE INFORMATION */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <TypeBadge type={report.type} />
                <span className="text-xs font-semibold text-slate-500">Crowdsourced Rider Submission</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-1">
                {report.description ? report.description.slice(0, 70) : 'Hazard Report Inspection'}
              </h1>
            </div>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {new Date(report.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Description & Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Rider Description
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {report.description || 'No written description submitted.'}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Geospatial Coordinates
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-blue-600 font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Latitude: {lat.toFixed(6)}, Longitude: {lng.toFixed(6)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Photo Evidence Attachment
            </h3>
            {report.imageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-sm shadow-sm">
                <img
                  src={report.imageUrl}
                  alt="Rider hazard evidence"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="p-2 text-[10px] font-mono text-slate-400 truncate bg-white border-t border-slate-100">
                  {report.imageUrl}
                </div>
              </div>
            ) : (
              <div className="h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-xs text-slate-400">
                <span>No photographic attachment</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: AI INCIDENT ANALYSIS (Gemini Powered) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              ✨
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                AI INCIDENT ANALYSIS
              </h2>
              <p className="text-xs text-slate-500">
                Google Gemini intelligence evaluating credibility, severity, and hazard profile.
              </p>
            </div>
          </div>

          <button
            onClick={handleAnalyzeWithAi}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Evaluating with Gemini...' : ai ? 'Re-Analyze with AI' : 'Analyze with AI'}</span>
          </button>
        </div>

        {/* AI Notification Message */}
        {aiFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              aiFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {aiFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{aiFeedback.message}</span>
          </div>
        )}

        {ai ? (
          <div className="space-y-4">
            {/* 4 Metric Badges: Category, Severity, Confidence, Suspicion */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Category */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI Category
                </span>
                <div className="mt-1">
                  <TypeBadge type={ai.category} />
                </div>
              </div>

              {/* Severity */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Predicted Severity
                </span>
                <div className="mt-1">
                  <SeverityBadge severity={ai.severity} />
                </div>
              </div>

              {/* Confidence */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Confidence
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${ai.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {(ai.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Suspicion Score */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Spam / Suspicion
                </span>
                <div className="mt-1">
                  {ai.suspicious ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      ⚠️ Suspicious ({(ai.suspicionScore * 100).toFixed(0)}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      ✓ Credible ({(ai.suspicionScore * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm">
              <span className="text-xs font-bold text-blue-900 block mb-1">
                Tactical Summary
              </span>
              <p className="font-semibold text-slate-900">{ai.summary}</p>
            </div>

            {/* AI Reasoning */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
              <span className="text-xs font-bold text-slate-600 block mb-1">
                Evidence Evaluation Reasoning
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{ai.reasoning}</p>
              {ai.analyzedAt && (
                <span className="text-[10px] text-slate-400 font-mono block mt-2">
                  Analyzed at: {new Date(ai.analyzedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <span className="text-2xl block">🤖</span>
            <p className="text-xs font-semibold text-slate-600">
              This rider report has not been analyzed by RouteGuard AI yet.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Click &quot;Analyze with AI&quot; above to let Gemini evaluate severity, confidence, and spam flags.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2.5: EVIDENCE & CORROBORATION */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  EVIDENCE & CORROBORATION
                </h2>
                {corroboration && <EvidenceBadge level={corroboration.evidenceLevel} />}
              </div>
              <p className="text-xs text-slate-500">
                Deterministic geospatial (500m) and temporal (24h) fusion with nearby community reports.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (report) {
                setLoadingCorroboration(true);
                getReportCorroboration(report._id)
                  .then(setCorroboration)
                  .catch(console.error)
                  .finally(() => setLoadingCorroboration(false));
              }
            }}
            disabled={loadingCorroboration}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCorroboration ? 'animate-spin' : ''}`} />
            <span>Recalculate Corroboration</span>
          </button>
        </div>

        {corroboration ? (
          <div className="space-y-5">
            {/* 3 Metric Cards: Evidence Level, Supporting Reports, Corroboration Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Evidence Level */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Evidence Level
                </span>
                <div className="mt-2">
                  <EvidenceBadge level={corroboration.evidenceLevel} />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1.5 font-medium">
                  {corroboration.evidenceLevel === 'STRONGLY_CORROBORATED'
                    ? '3+ matching reports or score ≥ 75'
                    : corroboration.evidenceLevel === 'CORROBORATED'
                    ? '2 matching reports or score ≥ 50'
                    : 'Single isolated report'}
                </span>
              </div>

              {/* Card 2: Supporting Reports */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Supporting Reports
                </span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {corroboration.corroborationCount + 1}{' '}
                  <span className="text-xs font-semibold text-slate-500">
                    ({corroboration.corroborationCount} nearby match{corroboration.corroborationCount === 1 ? '' : 'es'})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                  Includes current report + nearby evidence
                </span>
              </div>

              {/* Card 3: Corroboration Score */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Corroboration Score
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-mono font-black text-indigo-700">
                    {corroboration.corroborationScore}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      corroboration.corroborationScore >= 75
                        ? 'bg-indigo-600'
                        : corroboration.corroborationScore >= 50
                        ? 'bg-blue-600'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${corroboration.corroborationScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Supporting Reports Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Corroborating Community Reports ({corroboration.matchedReports.length})
                </h3>
                <span className="text-[10px] text-slate-400">
                  Deterministic haversine distance & category compatibility
                </span>
              </div>

              {corroboration.matchedReports.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-600">
                    No nearby matching reports found within 500 meters and 24 hours.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    This report is currently treated as an isolated incident until other community members corroborate it.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Report</th>
                        <th className="py-2.5 px-3">Distance</th>
                        <th className="py-2.5 px-3">Time Difference</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                      {corroboration.matchedReports.map((item) => (
                        <tr key={item.reportId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <Link
                              href={`/admin/reports/${item.reportId}`}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>Report #{item.reportId.slice(-6)}</span>
                              <ExternalLink className="w-3 h-3 text-blue-400" />
                            </Link>
                            {item.description && (
                              <p className="text-[11px] text-slate-500 font-sans truncate max-w-xs mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                            {item.distanceMeters}m
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {item.timeDifferenceMinutes < 60
                              ? `${item.timeDifferenceMinutes} min`
                              : `${Math.floor(item.timeDifferenceMinutes / 60)}h ${item.timeDifferenceMinutes % 60}m`}
                          </td>
                          <td className="py-2.5 px-3">
                            <TypeBadge type={item.type} />
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                item.score >= 75
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : item.score >= 50
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.score} pts
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={`/admin/reports/${item.reportId}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            {loadingCorroboration ? 'Calculating corroboration with nearby reports...' : 'Corroboration data not available.'}
          </div>
        )}
      </div>

      {/* SECTION 3: ADMIN DECISION (Promote to Incident / Status Control) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-black text-slate-900">ADMIN DECISION</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {report.incidentId ? 'Promoted & Active' : 'Awaiting Review'}
          </span>
        </div>

        {report.incidentId ? (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>OFFICIAL ROAD INCIDENT (Status: ACTIVE)</span>
              </div>
              <p className="text-xs text-emerald-700">
                This community report has been promoted to an official incident and is live on the operations console.
              </p>
            </div>

            <Link
              href={`/admin/incidents/${report.incidentId}`}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto transition-colors"
            >
              <span>View Official Incident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Review the rider report and AI evaluation above. As the Operations Controller, you can promote this to an <b>ACTIVE</b> road incident or reject it.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handlePromoteToIncident}
                disabled={promoting}
                className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <span>🚀 {promoting ? 'Promoting...' : 'Promote to Incident'}</span>
              </button>

              <button
                onClick={() => {
                  alert('Report rejected by Admin. Marked as non-critical.');
                  router.push('/admin/reports');
                }}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs transition-colors"
              >
                ✕ Reject Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-medium text-xs animate-pulse">Loading report telemetrics...</div>}>
      <ReportDetailsContent />
    </Suspense>
  );
}
