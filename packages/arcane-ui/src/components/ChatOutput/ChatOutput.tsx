import { For, Show } from "solid-js";
import { Message } from "../Message/Message";
import { useAppEvents } from "../../events/useAppEvents";

export function ChatOutput() {
  const { state } = useAppEvents();
  const messages = () => state().messages;
  const streamingText = () => state().streamingText;
  const isStreaming = () => state().isStreaming;
  const hasMessages = () => messages().length > 0;
  const dimColor = "#808080";

  return (
    <box
      flexDirection="column"
      borderStyle="rounded"
      borderColor={dimColor}
      padding={1}
      flexGrow={1}
    >
      <box alignItems="center" gap={1} marginBottom={1}>
        <text fg={dimColor}>[</text>
        <text fg="#FFFFFF" attributes={1}>CHAT OUTPUT</text>
        <text fg={dimColor}>|</text>
        <text fg={dimColor}>●</text>
        <text fg={dimColor}>]</text>
      </box>

      <Show when={!hasMessages() && !isStreaming()}>
        <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
          <text fg="#FF00FF" attributes={1}>✦</text>
          <text fg="#00FFFF" attributes={1}>Welcome to Arcane Route</text>
          <text fg={dimColor}>Type your message below to start</text>
          <text fg={dimColor}>Use /help for available commands</text>
        </box>
      </Show>

      <Show when={hasMessages()}>
        <box flexDirection="column">
          <For each={messages()}>
            {(msg) => <Message message={msg} />}
          </For>
        </box>
      </Show>

      <Show when={isStreaming()}>
        <box flexDirection="column">
          <text fg="#FFFF00">◐ STREAMING...</text>
          <text fg="#FFFFFF">{streamingText()}</text>
        </box>
      </Show>
    </box>
  );
}