export interface ChatInputProps {
  onSend: (text: string) => void;
  onCancel: () => void;
  commandHistory?: string[];
  disabled?: boolean;
}
