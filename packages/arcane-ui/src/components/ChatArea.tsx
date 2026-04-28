import { For, Show } from "solid-js";
import { useAppEvents } from "../events/useAppEvents";
import type { ChatMessage } from "../types";

export function ChatArea() {
  const { state } = useAppEvents();
  const messages = () => state().messages;
  const streamingText = () => state().streamingText;
  const isStreaming = () => state().isStreaming;

  return (
    <scrollbox
      flexDirection="column"
      flexGrow={1}
      overflowY="auto"
    >
      <Show when={messages().length === 0 && !isStreaming()}>
        <box justifyContent="center" alignItems="center" flexGrow={1}>
          <text fg="#FF00FF" attributes={1}>✦</text>
          <text fg="#00FFFF" attributes={1}>Welcome to Arcane Route</text>
          <text fg="#808080">Type your message below to start</text>
        </box>
      </Show>

      <For each={messages()}>
        {(msg) => <ChatMessage message={msg} />}
      </For>

      <Show when={isStreaming()}>
        <box marginY={1}>
          <text fg="#FFFF00">◐ STREAMING...</text>
          <text fg="#FFFFFF">{streamingText()}</text>
        </box>
      </Show>
    </scrollbox>
  );
}

function ChatMessage({ message }: { message: ChatMessage }) {
  const roleColor = message.role === "user" ? "#00FF00" : "#00FFFF";

  return (
    <box flexDirection="column" marginY={1}>
      <box gap={2}>
        <text fg={roleColor} attributes={1}>
          {message.role === "user" ? "USER" : "AI"}
        </text>
        <text fg="#808080">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </text>
      </box>
      <text fg="#FFFFFF">{message.text}</text>
    </box>
  );
}