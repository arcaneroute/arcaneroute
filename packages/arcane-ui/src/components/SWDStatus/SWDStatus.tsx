import { useAppEvents } from "../../events/useAppEvents";

export function SWDStatus() {
  const { state } = useAppEvents();
  const swd = () => state().swd;
  const dimColor = "#808080";

  const statusColor = () => swd().status === "ready" ? "#00FF00" : swd().status === "busy" ? "#FFFF00" : dimColor;

  return (
    <box flexDirection="column" borderStyle="rounded" borderColor={dimColor} padding={1}>
      <text fg="#FFFFFF" attributes={1}>SWD</text>
      <box marginTop={1}>
        <text fg={dimColor}>Status: </text>
        <text fg={statusColor()}>{swd().status.toUpperCase()}</text>
      </box>
    </box>
  );
}