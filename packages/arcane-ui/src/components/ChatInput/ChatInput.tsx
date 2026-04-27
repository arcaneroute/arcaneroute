import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { useAppEvents } from "../../events/useAppEvents";

const BOLD = 1;
const ITALIC = 2;

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
    }, 500);
    onCleanup(() => clearInterval(interval));
  });

  useKeyboard((key) => {
    if (disabled) return;

    if (key.name === "return" && !key.shift) {
      if (input().trim()) {
        emit("user:send", { text: input() });
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
  const dimColor = "#808080";

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={borderColor}
      padding={1}
      marginTop={1}
    >
      <box alignItems="center" gap={1} marginBottom={1}>
        <text fg={dimColor}>[</text>
        <text fg={disabled ? dimColor : "#00FFFF"} attributes={BOLD}>CHAT INPUT</text>
        <text fg={dimColor}>|</text>
        <text fg={disabled ? dimColor : "#00FF00"}>●</text>
        <text fg={dimColor}>]</text>
      </box>

      <box alignItems="center" gap={1}>
        <text fg="#00FFFF" attributes={BOLD}>&gt;</text>
        <text fg="#FFFFFF">{input()}</text>
        <Show when={cursorVisible()}>
          <text fg="#00FFFF">_</text>
        </Show>
        <text fg={dimColor}>[Enter]</text>
      </box>

      {disabled ? (
        <box marginTop={1} alignItems="center" gap={1}>
          <text fg="#FFFF00">●</text>
          <text fg={dimColor} attributes={ITALIC}>Processing...</text>
        </box>
      ) : (
        <box marginTop={1} alignItems="center" gap={2}>
          <text fg={dimColor}>↑↓ history</text>
          <text fg={dimColor}>|</text>
          <text fg={dimColor}>Shift+Enter newline</text>
          <text fg={dimColor}>|</text>
          <text fg={dimColor}>Ctrl+C cancel</text>
        </box>
      )}
    </box>
  );
}