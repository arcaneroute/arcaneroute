import { createCliRenderer } from "@opentui/core";
import { EventEmitter } from "events";
import type { AppEventMap } from "../events/AppEvents";

export interface ArcaneRenderer {
  renderer: Awaited<ReturnType<typeof createCliRenderer>>;
  events: EventEmitter;
}

export async function createArcaneRenderer(): Promise<ArcaneRenderer> {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });

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
