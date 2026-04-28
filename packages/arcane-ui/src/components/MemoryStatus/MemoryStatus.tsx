import { useAppEvents } from "../../events/useAppEvents";

export function MemoryStatus() {
  const { state } = useAppEvents();
  const memory = () => state().memory;
  const dimColor = "#808080";

  const statusColor = () => memory().status === "normal" ? "#00FF00" : memory().status === "warning" ? "#FFFF00" : "#FF0000";

  return (
    <box flexDirection="column" borderStyle="rounded" borderColor={dimColor} padding={1}>
      <text fg="#FFFFFF" attributes={1}>Memory</text>
      <box marginTop={1}>
        <text fg={dimColor}>Entries: {memory().entryCount}</text>
      </box>
      <box>
        <text fg={dimColor}>Size: {memory().sizeKb.toFixed(1)} KB</text>
      </box>
      <box>
        <text fg={dimColor}>Status: </text>
        <text fg={statusColor()}>{memory().status.toUpperCase()}</text>
      </box>
    </box>
  );
}