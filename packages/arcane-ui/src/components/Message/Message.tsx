import { For } from "solid-js";
import type { ChatMessage, FileAction } from "../../types";

interface MessageProps {
  message: ChatMessage;
}

export function Message({ message }: MessageProps) {
  const roleColor = message.role === "user" ? "#00FF00" : "#00FFFF";
  const roleLabel = message.role === "user" ? "USER" : "AI";
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dimColor = "#808080";

  return (
    <box flexDirection="column" marginY={1} paddingLeft={2}>
      <box gap={2} alignItems="center">
        <text fg={roleColor} attributes={1}>{roleLabel}</text>
        <text fg={dimColor}>{time}</text>
      </box>
      <box marginTop={1}>
        <text fg="#FFFFFF">{message.text}</text>
      </box>
      {message.fileActions && message.fileActions.length > 0 && (
        <box flexDirection="column" marginTop={1} padding={1} borderStyle="rounded" borderColor={dimColor}>
          <text fg={dimColor} attributes={1}>File Actions:</text>
          <For each={message.fileActions}>
            {(action) => <FileActionBlock action={action} />}
          </For>
        </box>
      )}
    </box>
  );
}

function FileActionBlock({ action }: { action: FileAction }) {
  const typeConfig = {
    CREATE: { fg: "#00FF00", icon: "+", label: "CREATE" },
    MODIFY: { fg: "#FFFF00", icon: "~", label: "MODIFY" },
    DELETE: { fg: "#FF0000", icon: "-", label: "DELETE" },
  }[action.type];

  return (
    <box alignItems="center" gap={1}>
      <text fg={typeConfig.fg} attributes={1}>{typeConfig.icon}</text>
      <text fg={typeConfig.fg} attributes={1}>{typeConfig.label}</text>
      <text fg="#808080">|</text>
      <text fg="#FFFFFF">{action.path}</text>
    </box>
  );
}