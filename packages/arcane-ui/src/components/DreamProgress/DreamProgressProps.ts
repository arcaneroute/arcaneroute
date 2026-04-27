export interface DreamProgressState {
  phase: 'analyzing' | 'compressing' | 'writing' | 'complete';
  progress?: number;
  entryCountBefore?: number;
  entryCountAfter?: number;
  reductionPercent?: number;
}

export interface DreamProgressProps {
  progress: DreamProgressState;
}
