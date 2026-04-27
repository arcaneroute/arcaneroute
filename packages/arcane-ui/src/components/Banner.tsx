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

interface BannerProps {
  version?: string;
  provider?: string;
  model?: string;
  effort?: "high" | "medium" | "low";
  swdActive?: boolean;
}

export function Banner({ version = "0.1.0", provider = "openai", model = "claude-sonnet-4", effort = "high", swdActive = false }: BannerProps) {
  const { state } = useAppEvents();
  const status = state().appStatus;
  const config = STATUS_CONFIG[status];
  const effortColor = effort === "high" ? "#00FFFF" : effort === "medium" ? "#FFFF00" : "#FFFFFF";
  const dimColor = "#808080";

  // Get status message - must be a string
  const statusMessage = () => {
    switch (status) {
      case "idle": return "Ready to assist. Type your message below.";
      case "running": return "Processing your request...";
      case "streaming": return "Receiving response from AI...";
      case "verifying": return "Verifying file operations via SWD...";
      case "writing": return "Writing files to disk...";
      case "complete": return "Operation completed successfully.";
      case "error": return "An error occurred. Check the output below.";
      default: return "";
    }
  };

  return (
    <box
      borderStyle="single"
      padding={1}
      marginBottom={1}
    >
      <box justifyContent="space-between">
        <box gap={2}>
          <text fg="#FF00FF" attributes={1}>ARCANE ROUTE</text>
          <text fg={dimColor}>v{version}</text>
        </box>
        <box
          borderStyle="rounded"
          borderColor={config.fg}
          paddingX={2}
        >
          <text fg={config.fg} attributes={1}>
            {config.icon} {config.label}
          </text>
        </box>
      </box>

      <box marginTop={1}>
        <text fg={dimColor}>Provider: </text>
        <text fg="#00FFFF">{provider.toUpperCase()}</text>
        <text fg={dimColor}> | Model: </text>
        <text fg="#00FFFF">{model}</text>
      </box>

      <box>
        <text fg={dimColor}>Effort: </text>
        <text fg={effortColor}>{effort.toUpperCase()}</text>
        <text fg={dimColor}> | SWD: </text>
        <text fg={swdActive ? "#00FF00" : "#FF0000"}>{swdActive ? "ACTIVE" : "INACTIVE"}</text>
      </box>

      <box marginTop={1} paddingTop={1} borderStyle="single" borderColor={dimColor}>
        <text fg={dimColor} attributes={2}>{statusMessage()}</text>
      </box>
    </box>
  );
}