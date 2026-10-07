import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, IncidentType, VerificationStatus } from '../types';

const STORAGE_KEY_REPORTS = '@waysure_reports_v2';
const OLD_STORAGE_KEY_REPORTS = '@waysure_reports_v1';

// Clean initial reports - No hardcoded dummy database
const INITIAL_REPORTS: Report[] = [];

export class ReportService {
  public static async getReports(): Promise<Report[]> {
    try {
      // Clear legacy mock database if present
      await AsyncStorage.removeItem(OLD_STORAGE_KEY_REPORTS).catch(() => {});

      const data = await AsyncStorage.getItem(STORAGE_KEY_REPORTS);
      if (data) {
        return JSON.parse(data);
      }
      return INITIAL_REPORTS;
    } catch (e) {
      console.warn('Error fetching reports from storage:', e);
      return INITIAL_REPORTS;
    }
  }

  public static async saveReport(newReport: Report): Promise<Report[]> {
    try {
      const existing = await this.getReports();
      const updated = [newReport, ...existing];
      await AsyncStorage.setItem(
        STORAGE_KEY_REPORTS,
        JSON.stringify(updated)
      );
      return updated;
    } catch (e) {
      console.warn('Error saving report to storage:', e);
      return [newReport];
    }
  }

  public static async clearAllReports(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_REPORTS);
      await AsyncStorage.removeItem(OLD_STORAGE_KEY_REPORTS);
    } catch (e) {
      console.warn('Error clearing reports:', e);
    }
  }
}
