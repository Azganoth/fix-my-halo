export interface WorkerData {
  id: string;
  bytes: Uint8Array;
  padding: number;
}

export type WorkerMessage =
  | { type: "READY" }
  | { type: "JOB_DONE"; id: string; resultBytes: Uint8Array }
  | { type: "JOB_ERROR"; id: string; error: string };
