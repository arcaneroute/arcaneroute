import { useKeyboard } from "@opentui/solid";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { useAppEvents } from "../../events/useAppEvents";

const BOLD = 1;

interface ChatInputProps {
  disabled?: boolean;
  commandHistory?: string[];
}

export function ChatInput({ disabled = false, commandHistory = [] }: ChatInputProps) {
  const [input, setInput] = createSignal("");
  const [historyIndex, setHistoryIndex] = createSignal(-1);
  const [cursorVisible, setCursorVisible] = createSignal(true);
  const { emit } = useAppEvents();

  onMount(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    onCleanup(() => clearInterval(interval));
  });

  useKeyboard((key) => {
    if (disabled) return;

    if (key.name === "return" && !key.shift) {
      const text = input();
      console.log("[ChatInput] Enter pressed, input:", JSON.stringify(text));
      if (text.trim()) {
        console.log("[ChatInput] Emitting user:send");
        emit("user:send", { text });
        setInput("");
        setHistoryIndex(-1);
      }
    } else if (key.name === "return" && key.shift) {
      setInput(prev => prev + "\n");
    } else if (key.name === "upArrow") {
      setHistoryIndex(prev => {
        const newIndex = Math.min(prev + 1, commandHistory.length - 1);
        if (newIndex >= 0 && commandHistory[commandHistory.length - 1 - newIndex]) {
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        return newIndex;
      });
    } else if (key.name === "downArrow") {
      setHistoryIndex(prev => {
        const newIndex = prev - 1;
        if (newIndex < 0) {
          setInput("");
          return -1;
        }
        if (commandHistory[commandHistory.length - 1 - newIndex]) {
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        return newIndex;
      });
    } else if (key.ctrl && key.name === "c") {
      emit("user:cancel", undefined);
    } else if (key.name === "escape") {
      setInput("");
      setHistoryIndex(-1);
    } else if (key.name === "backspace" || key.name === "delete") {
      setInput(prev => prev.slice(0, -1));
    } else if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
      setInput(prev => prev + key.sequence);
    }
  });

  const borderColor = disabled ? "#808080" : "#00FFFF";

  return (
    <box
      flexDirection="row"
      alignItems="center"
      gap={1}
      borderStyle="single"
      borderColor={borderColor}
      padding={1}
      marginTop={1}
    >
      <text fg="#00FFFF" attributes={BOLD}>&gt;</text>
      <text fg="#FFFFFF">{input()}</text>
      <Show when={cursorVisible()}>
        <text fg="#00FFFF" attributes={BOLD}>▌</text>
      </Show>
    </box>
  );
}