const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export type IncidentType = 'ACCIDENT' | 'ROAD_BLOCK' | 'ROAD_DAMAGE' | 'FLOOD' | 'OTHER';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type IncidentStatus = 'NEW' | 'ACTIVE' | 'VERIFIED' | 'RESOLVED' | 'REJECTED';

export type EvidenceLevel = 'ISOLATED' | 'CORROBORATED' | 'STRONGLY_CORROBORATED';

export interface IncidentEvidence {
  reportIds: string[];
  reportCount: number;
  corroborationScore: number;
  evidenceLevel: EvidenceLevel;
}

export interface Incident {
  _id: string;
  type: IncidentType;
  title: string;
  description?: string;
  location: GeoPoint;
  severity: IncidentSeverity;
  confidence: number;
  status: IncidentStatus;
  evidence?: IncidentEvidence;
  createdAt: string;
  updatedAt: string;
}

export interface AiAnalysis {
  category: IncidentType;
  severity: IncidentSeverity;
  confidence: number;
  suspicious: boolean;
  suspicionScore: number;
  summary: string;
  reasoning: string;
  analyzedAt: string;
}

export interface ReportCorroboration {
  matchedReportIds: string[];
  corroborationCount: number;
  corroborationScore: number;
  evidenceLevel: EvidenceLevel;
  lastCheckedAt?: string;
}

export interface Report {
  _id: string;
  userId?: string | null;
  type: IncidentType;
  description: string;
  location: GeoPoint;
  imageUrl?: string | null;
  incidentId?: string | null;
  createdAt: string;
  aiAnalysis?: AiAnalysis;
  corroboration?: ReportCorroboration;
}

export interface IncidentFilter {
  type?: string;
  severity?: string;
  status?: string;
}

export async function getIncidents(filter?: IncidentFilter): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (filter?.type && filter.type !== 'ALL') params.append('type', filter.type);
  if (filter?.severity && filter.severity !== 'ALL') params.append('severity', filter.severity);
  if (filter?.status && filter.status !== 'ALL') params.append('status', filter.status);

  const url = `${API_URL}/api/incidents${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch incidents: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data || [];
}

export async function getIncident(id: string): Promise<Incident> {
  const res = await fetch(`${API_URL}/api/incidents/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch incident details: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function getReports(): Promise<Report[]> {
  const res = await fetch(`${API_URL}/api/reports`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch reports: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data || [];
}

export async function getReport(id: string): Promise<Report> {
  const res = await fetch(`${API_URL}/api/reports/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch report details: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident> {
  const res = await fetch(`${API_URL}/api/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update status: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function analyzeReport(data: {
  reportId?: string;
  description?: string;
  type?: string;
  imageUrl?: string;
}): Promise<{ analysis: AiAnalysis; report?: Report }> {
  const res = await fetch(`${API_URL}/api/ai/analyze-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `AI Analysis failed: ${res.statusText}`);
  }
  const json = await res.json();
  return {
    analysis: json.data,
    report: json.report
  };
}

export interface PromoteReportResponse {
  incident: Incident;
  report: Report;
  action?: 'CREATED_NEW_INCIDENT' | 'ATTACHED_TO_EXISTING_INCIDENT';
  incidentId?: string;
  evidenceLevel?: EvidenceLevel;
}

export async function promoteReport(reportId: string): Promise<PromoteReportResponse> {
  const res = await fetch(`${API_URL}/api/reports/${reportId}/promote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to promote report: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export interface ReportCorroborationMatch {
  reportId: string;
  type: IncidentType;
  description: string;
  location?: GeoPoint;
  imageUrl?: string | null;
  incidentId?: string | null;
  createdAt: string;
  distanceMeters: number;
  timeDifferenceMinutes: number;
  score: number;
}

export interface ReportCorroborationData {
  reportId: string;
  matchedReports: ReportCorroborationMatch[];
  corroborationCount: number;
  corroborationScore: number;
  evidenceLevel: EvidenceLevel;
}

export async function getReportCorroboration(reportId: string): Promise<ReportCorroborationData> {
  const res = await fetch(`${API_URL}/api/reports/${reportId}/corroboration`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch report corroboration: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export interface IncidentEvidenceReportItem {
  reportId: string;
  _id?: string;
  type: IncidentType;
  description: string;
  location?: GeoPoint;
  imageUrl?: string | null;
  createdAt: string;
  distanceMeters?: number;
  timeDifferenceMinutes?: number;
  score?: number;
  aiAnalysis?: AiAnalysis;
  isOriginal?: boolean;
}

export interface IncidentEvidenceData {
  incidentId: string;
  reportCount: number;
  corroborationScore: number;
  evidenceLevel: EvidenceLevel;
  reports: IncidentEvidenceReportItem[];
}

export async function getIncidentEvidence(incidentId: string): Promise<IncidentEvidenceData> {
  const res = await fetch(`${API_URL}/api/incidents/${incidentId}/evidence`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch incident evidence: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  areaName: string;
  incidentCount: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  activeCount: number;
  verifiedCount: number;
  resolvedCount: number;
  corroboratedCount?: number;
  totalSupportingReports?: number;
  riskScore: number;
  riskLevel: RiskLevel;
  topHazards: IncidentType[];
  sampleTitles?: string[];
}

export interface AnalyticsOverview {
  timeWindowDays: number | null;
  totalIncidents: number;
  activeIncidents: number;
  verifiedIncidents: number;
  resolvedIncidents: number;
  rejectedIncidents: number;
  highSeverityIncidents: number;
  mediumSeverityIncidents: number;
  lowSeverityIncidents: number;
  totalReports: number;
  pendingReports: number;
  suspiciousReports: number;
  corroboratedIncidents?: number;
  stronglyCorroboratedIncidents?: number;
  isolatedIncidents?: number;
  byType: Record<IncidentType, number>;
  bySeverity: Record<IncidentSeverity, number>;
  byStatus: Record<IncidentStatus, number>;
  byEvidence?: Record<EvidenceLevel, number>;
}

export async function getAnalyticsOverview(days?: number): Promise<AnalyticsOverview> {
  const params = new URLSearchParams();
  if (days !== undefined && days > 0) params.append('days', days.toString());

  const url = `${API_URL}/api/analytics/overview${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch analytics overview: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function getHotspots(
  days?: number,
  severity?: string,
  status?: string
): Promise<Hotspot[]> {
  const params = new URLSearchParams();
  if (days !== undefined && days > 0) params.append('days', days.toString());
  if (severity && severity !== 'ALL') params.append('severity', severity);
  if (status && status !== 'ALL') params.append('status', status);

  const url = `${API_URL}/api/analytics/hotspots${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch hotspots: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

// ============ NOTIFICATIONS ============

export type NotificationType = 'NEW_REPORT' | 'INCIDENT_PROMOTED' | 'STATUS_CHANGE' | 'HIGH_SEVERITY_ALERT';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ReporterInfo {
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface ReportDetails {
  type: IncidentType;
  description: string;
  location: string;
  severity: IncidentSeverity;
  imageUrl?: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  reportId?: string | null;
  incidentId?: string | null;
  reporterInfo?: ReporterInfo;
  reportDetails?: ReportDetails;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getNotifications(unreadOnly?: boolean, limit?: number): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const params = new URLSearchParams();
  if (unreadOnly) params.append('unreadOnly', 'true');
  if (limit) params.append('limit', limit.toString());

  const url = `${API_URL}/api/notifications${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.statusText}`);
  }
  const json = await res.json();
  return {
    notifications: json.data || [],
    unreadCount: json.unreadCount || 0
  };
}

export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`${API_URL}/api/notifications/unread-count`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch unread count: ${res.statusText}`);
  }
  const json = await res.json();
  return json.count || 0;
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: 'PATCH'
  });
  if (!res.ok) {
    throw new Error(`Failed to mark as read: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function markAllNotificationsAsRead(): Promise<{ modifiedCount: number }> {
  const res = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PATCH'
  });
  if (!res.ok) {
    throw new Error(`Failed to mark all as read: ${res.statusText}`);
  }
  const json = await res.json();
  return { modifiedCount: json.modifiedCount || 0 };
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/notifications/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error(`Failed to delete notification: ${res.statusText}`);
  }
}


