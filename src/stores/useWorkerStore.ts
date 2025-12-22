import type {
  WorkerData,
  WorkerMessage,
} from "@/features/processor/workers/types";
import { create } from "zustand";

interface WorkerStore {
  isReady: boolean;
  worker: Worker | null;
  init: () => void;
  processImage: (
    id: string,
    bytes: Uint8Array,
    padding: number,
  ) => Promise<Uint8Array>;
}

const pendingJobs = new Map<
  string,
  { resolve: (data: Uint8Array) => void; reject: (err: string) => void }
>();

export const useWorkerStore = create<WorkerStore>((set, get) => ({
  isReady: false,
  worker: null,

  init: () => {
    if (get().worker) return;

    const worker = new Worker(
      new URL(
        "@/features/processor/workers/processorWorker.ts",
        import.meta.url,
      ),
      { type: "module" },
    );

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;

      if (msg.type === "READY") {
        set({ isReady: true });
      } else if (msg.type === "JOB_DONE") {
        const job = pendingJobs.get(msg.id);
        if (job) {
          job.resolve(msg.resultBytes);
          pendingJobs.delete(msg.id);
        }
      } else if (msg.type === "JOB_ERROR") {
        const job = pendingJobs.get(msg.id);
        if (job) {
          job.reject(msg.error);
          pendingJobs.delete(msg.id);
        }
      }
    };

    set({ worker });
  },

  processImage: (id, bytes, padding) => {
    return new Promise((resolve, reject) => {
      const { worker, isReady } = get();

      if (!worker || !isReady) {
        reject("Worker not ready");
        return;
      }

      pendingJobs.set(id, { resolve, reject });

      const job: WorkerData = { id, bytes, padding };
      worker.postMessage(job, [bytes.buffer]);
    });
  },
}));
