import { Incident, RouteOption } from '../types';

export class TrustService {
  /**
   * Calculates Waysure Trust Score (0 - 100)
   * Base score is 100, reduced by nearby incidents, hazard severities, and high-risk traffic zones.
   */
  public static calculateTrustScore(
    route: Partial<RouteOption>,
    nearbyIncidents: Incident[] = []
  ): number {
    let baseScore = 95;

    // Deduct points based on incident severity
    for (const incident of nearbyIncidents) {
      if (incident.severity === 'High') {
        baseScore -= 14;
      } else if (incident.severity === 'Medium') {
        baseScore -= 8;
      } else {
        baseScore -= 4;
      }
    }

    // Adjust based on route characteristics
    if (route.type === 'recommended') {
      baseScore = Math.max(90, Math.min(98, baseScore));
    } else if (route.type === 'fastest') {
      // Fastest routes often take congested highways with higher risk
      baseScore = Math.max(68, Math.min(78, baseScore - 12));
    } else if (route.type === 'alternate') {
      baseScore = Math.max(82, Math.min(91, baseScore + 2));
    }

    return Math.round(Math.max(40, Math.min(99, baseScore)));
  }

  public static getTrustDescription(score: number): string {
    if (score >= 90) return 'Safer with real-time updates';
    if (score >= 80) return 'Avoids high-risk areas';
    if (score >= 70) return 'Usual traffic';
    return 'Moderate hazard risk';
  }
}
