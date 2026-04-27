export type SWDStatusType = 'idle' | 'pre-snapshot' | 'verifying' | 'verified' | 'failed' | 'unmatched';

export interface SWDStatus {
  status: SWDStatusType;
  fileCount?: number;
  verifiedCount?: number;
  failedCount?: number;
  unmatchedCount?: number;
}
