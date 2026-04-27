export interface ProgressBarProps {
  value: number; // 0-100
  width?: number;
  showLabel?: boolean;
  color?: 'green' | 'amber' | 'red' | 'cyan' | 'white';
}
