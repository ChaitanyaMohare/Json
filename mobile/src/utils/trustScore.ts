import { colors } from '../theme/colors';

export type TrustTier = 'high' | 'caution' | 'danger';

export interface TrustConfig {
  label: string;
  tier: TrustTier;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function getTrustScoreConfig(score: number): TrustConfig {
  if (score >= 85) {
    return {
      label: 'Highly Trusted',
      tier: 'high',
      color: colors.safetyGreen,
      bgColor: colors.safetyGreenSoft,
      borderColor: '#A7F3D0',
    };
  }
  if (score >= 60) {
    return {
      label: 'Caution',
      tier: 'caution',
      color: colors.cautionAmber,
      bgColor: colors.cautionAmberSoft,
      borderColor: '#FDE68A',
    };
  }
  return {
    label: 'High Risk',
    tier: 'danger',
    color: colors.incidentRed,
    bgColor: colors.incidentRedSoft,
    borderColor: '#FECACA',
  };
}
