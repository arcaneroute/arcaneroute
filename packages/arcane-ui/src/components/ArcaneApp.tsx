import { onMount, onCleanup, createSignal } from "solid-js";
import { useRenderer, onResize } from "@opentui/solid";
import { Banner } from "./Banner";
import { ChatPanel } from "./ChatPanel/ChatPanel";
import { Sidebar } from "./Sidebar/Sidebar";
import { StatusBar } from "./StatusBar/StatusBar";
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
      <Banner />
      <box flexDirection="row" flexGrow={1} marginTop={1}>
        <ChatPanel onSend={onSend} onCancel={onCancel} commandHistory={commandHistory} />
        <Sidebar />
      </box>
      <StatusBar />
    </box>
  );
}