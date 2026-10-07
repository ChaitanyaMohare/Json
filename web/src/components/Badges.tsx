import React from 'react';
import { IncidentSeverity, IncidentStatus, IncidentType } from '../lib/api';

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const styles: Record<IncidentSeverity, string> = {
    HIGH: 'bg-rose-50 text-rose-600 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  };

  const label = severity === 'HIGH' ? 'High' : severity === 'MEDIUM' ? 'Medium' : 'Low';

  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${styles[severity] || styles.MEDIUM}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const styles: Record<IncidentStatus, string> = {
    VERIFIED: 'bg-blue-50 text-blue-600 border-blue-200',
    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    NEW: 'bg-amber-50 text-amber-600 border-amber-200',
    RESOLVED: 'bg-slate-100 text-slate-600 border-slate-200',
    REJECTED: 'bg-rose-50 text-rose-600 border-rose-200'
  };

  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status] || styles.NEW}`}>
      {status}
    </span>
  );
}

export function TypeBadge({ type }: { type: IncidentType | string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200">
      {type}
    </span>
  );
}

export function RiskBadge({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string }) {
  const styles: Record<string, { bg: string; dot: string; text: string }> = {
    CRITICAL: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500 animate-ping',
      text: 'Critical Risk'
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
      text: 'High Risk'
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      text: 'Moderate'
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      text: 'Low Risk'
    }
  };

  const current = styles[level] || styles.LOW;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.text}
    </span>
  );
}

export function EvidenceBadge({ level }: { level: 'ISOLATED' | 'CORROBORATED' | 'STRONGLY_CORROBORATED' | string }) {
  if (level === 'STRONGLY_CORROBORATED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
        Strong Evidence
      </span>
    );
  }
  if (level === 'CORROBORATED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Corroborated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Isolated
    </span>
  );
}

