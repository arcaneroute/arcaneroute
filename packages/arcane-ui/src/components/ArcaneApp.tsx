import { onMount, onCleanup, createSignal } from "solid-js";
import { useRenderer, onResize } from "@opentui/solid";
import { Header } from "./Banner"; // Note: still imports from Banner.tsx
import { ChatArea } from "./ChatArea";
import { ChatInput } from "./ChatInput/ChatInput";
import { ShortcutBar } from "./ShortcutBar";
import { useAppEvents } from "../events/useAppEvents";

interface ArcaneAppProps {
  onSend?: (text: string) => void;
  onCancel?: () => void;
  commandHistory?: string[];
}

export function ArcaneApp({ onSend, onCancel, commandHistory = [] }: ArcaneAppProps) {
  const renderer = useRenderer();
  const [dims, setDims] = createSignal({ width: renderer.width, height: renderer.height });
  const { on } = useAppEvents();

  onMount(() => {
    const unsubSend = on("user:send", ({ text }: { text: string }) => onSend?.(text));
    const unsubCancel = on("user:cancel", () => onCancel?.());

    onCleanup(() => {
      unsubSend();
      unsubCancel();
    });
  });

  onResize((width, height) => {
    setDims({ width, height });
  });

  return (
    <box
      width={dims().width}
      height={dims().height}
      flexDirection="column"
      padding={1}
    >
      {/* Row 1: Header */}
      <Header />

      {/* Row 2: Chat Area (flexGrow to fill space) */}
      <ChatArea />

      {/* Row 3: Chat Input */}
      <ChatInput commandHistory={commandHistory} />

      {/* Row 4: Shortcut Bar */}
      <ShortcutBar />
    </box>
  );
}