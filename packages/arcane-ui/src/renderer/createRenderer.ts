import { createCliRenderer } from "@opentui/core";
import { EventEmitter } from "events";
import type { AppEventMap } from "../events/AppEvents";

export interface ArcaneRenderer {
  renderer: Awaited<ReturnType<typeof createCliRenderer>>;
  events: EventEmitter;
}

export interface ArcaneRendererOptions {
  screenMode?: "alternate-screen" | "main-screen" | "split-footer";
  targetFps?: number;
  consoleMode?: "console-overlay" | "disabled";
  clearOnShutdown?: boolean;
}

export async function createArcaneRenderer(options: ArcaneRendererOptions = {}): Promise<ArcaneRenderer> {
  const {
    screenMode = "alternate-screen",
    targetFps = 30,
    consoleMode = "disabled", // Disable console overlay to avoid issues
    clearOnShutdown = true,
  } = options;

  let renderer;
  try {
    renderer = await createCliRenderer({
      exitOnCtrlC: true,
      screenMode,
      targetFps,
      consoleMode,
      clearOnShutdown,
      useMouse: false, // Disable mouse to avoid TTY issues
    });
  } catch (error) {
    console.error("Failed to create CLI renderer:", error);
    throw error;
  }

  const events = new EventEmitter();

  // Forward keypress events from the renderer's keyInput
  renderer.keyInput.on("keypress", (key) => {
    (events as EventEmitter).emit("keypress", {
      name: key.name,
      sequence: key.sequence,
      ctrl: key.ctrl,
      shift: key.shift,
      meta: key.meta,
    });
  });

  return { renderer, events };
}
