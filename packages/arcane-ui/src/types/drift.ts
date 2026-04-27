export type DriftEntryType = 'verified' | 'drifted' | 'missing' | 'untracked';

export interface DriftEntry {
  type: DriftEntryType;
  path: string;
}

export interface DriftReport {
  verified: string[];
  drifted: string[];
  missing: string[];
  untracked: string[];
}
