import init, { fix_texture } from "#/pkg/fix_my_halo_core";
import type { WorkerData, WorkerMessage } from "./types";

init()
  .then(() => {
    postMessage({ type: "READY" } satisfies WorkerMessage);
  })
  .catch((err) => {
    console.error("Worker Wasm Init Failed:", err);
  });

self.onmessage = async (e: MessageEvent<WorkerData>) => {
  const { id, bytes, padding } = e.data;

  try {
    const result = fix_texture(bytes, padding);
    const resultBytes = result.data;
    const changed = result.changed;

    postMessage(
      { type: "JOB_DONE", id, resultBytes, changed } satisfies WorkerMessage,
      {
        transfer: [resultBytes.buffer],
      },
    );

    result.free();
  } catch (error) {
    postMessage({
      type: "JOB_ERROR",
      id,
      error: error instanceof Error ? error.message : String(error),
    } satisfies WorkerMessage);
  }
};
