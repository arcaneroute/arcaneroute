export type MemoryStatusType = 'normal' | 'warning' | 'critical';

export interface MemoryStatus {
  entryCount: number;
  sizeKb: number;
  status: MemoryStatusType;
}
