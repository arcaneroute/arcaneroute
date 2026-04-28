import { useAppEvents } from "../events/useAppEvents";

const STATUS_CONFIG = {
  idle: { fg: "#808080", label: "IDLE", icon: "○" },
  running: { fg: "#FFFF00", label: "RUNNING", icon: "◐" },
  streaming: { fg: "#00FFFF", label: "STREAMING", icon: "◔" },
  verifying: { fg: "#FFFF00", label: "VERIFYING", icon: "◑" },
  writing: { fg: "#0080FF", label: "WRITING", icon: "◕" },
  complete: { fg: "#00FF00", label: "COMPLETE", icon: "●" },
  error: { fg: "#FF0000", label: "ERROR", icon: "✖" },
} as const;

interface HeaderProps {
  version?: string;
  provider?: string;
}

export function Header({ version = "1.0.0", provider = "openai" }: HeaderProps) {
  const { state } = useAppEvents();
  const status = state().appStatus;
  const config = STATUS_CONFIG[status];

  return (
    <box
      borderStyle="single"
      borderColor="#808080"
      padding={1}
      justifyContent="space-between"
    >
      <text fg="#FF00FF" attributes={1}>ARCANE</text>
      <text fg="#808080">v{version}</text>
      <text fg="#808080">|</text>
      <text fg="#00FFFF">{provider.toUpperCase()}</text>
      <text fg="#808080">|</text>
      <text fg={config.fg} attributes={1}>{config.icon} {config.label}</text>
    </box>
  );
}

export { Header as Banner };