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
        <text fg={dimColor}>
          Provider: <text fg="#00FFFF">{provider.toUpperCase()}</text>
          {" | "}Model: <text fg="#00FFFF">{model}</text>
        </text>
      </box>

      <box>
        <text fg={dimColor}>
          Effort: <text fg={effortColor}>{effort.toUpperCase()}</text>
          {" | "}SWD: <text fg={swdActive ? "#00FF00" : "#FF0000"}>{swdActive ? "ACTIVE" : "INACTIVE"}</text>
        </text>
      </box>

      <box marginTop={1} paddingTop={1} borderStyle="single" borderColor={dimColor}>
        <text fg={dimColor} attributes={2}>
          {status === "idle" && "Ready to assist. Type your message below."}
          {status === "running" && "Processing your request..."}
          {status === "streaming" && "Receiving response from AI..."}
          {status === "verifying" && "Verifying file operations via SWD..."}
          {status === "writing" && "Writing files to disk..."}
          {status === "complete" && "Operation completed successfully."}
          {status === "error" && "An error occurred. Check the output below."}
        </text>
      </box>
    </box>
  );
}