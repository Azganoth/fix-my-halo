import { SUPPORTED_FILE_TYPES } from "@/lib/constants";
import { useWorkerStore } from "@/stores/useWorkerStore";
import JSZip from "jszip";
import { useCallback, useEffect, useRef, useState } from "react";
import { download } from "../utils";

export type FileStatus = "pending" | "processing" | "done" | "error";

export interface FileItem {
  id: string;
  file: File;
  status: FileStatus;
}

interface UseBatchProcessorProps {
  padding: number;
}

export function useBatchProcessor({ padding }: UseBatchProcessorProps) {
  const { processImage } = useWorkerStore();
  const [fileQueue, setFileQueue] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Store processed data in a Ref instead of State to avoid expensive re-renders
  // when handling large binary blobs. UI only needs to know status (done/error).
  const processedBlobs = useRef<Map<string, Uint8Array>>(new Map());

  // Automatically picks up the next 'pending' file when the worker is idle.
  // This ensures sequential processing to avoid saturating the worker queue.
  useEffect(() => {
    if (isProcessing) return;

    const pendingItem = fileQueue.find((f) => f.status === "pending");
    if (!pendingItem) return;

    const processItem = async () => {
      setIsProcessing(true);

      setFileQueue((prev) =>
        prev.map((item) =>
          item.id === pendingItem.id ? { ...item, status: "processing" } : item,
        ),
      );

      try {
        const arrayBuffer = await pendingItem.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const resultBytes = await processImage(pendingItem.id, bytes, padding);

        processedBlobs.current.set(pendingItem.id, resultBytes);

        setFileQueue((prev) =>
          prev.map((item) =>
            item.id === pendingItem.id ? { ...item, status: "done" } : item,
          ),
        );
      } catch (e) {
        console.error(`Failed to process ${pendingItem.file.name}`, e);
        setFileQueue((prev) =>
          prev.map((item) =>
            item.id === pendingItem.id ? { ...item, status: "error" } : item,
          ),
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processItem();
  }, [padding, processImage, fileQueue, isProcessing]);

  // If the user changes padding, invalidate all completed files so they are
  // re-queued for processing with the new settings.
  useEffect(() => {
    setFileQueue((prev) => {
      const needsReprocess = prev.some(
        (f) => f.status === "done" || f.status === "error",
      );
      if (!needsReprocess) return prev;

      return prev.map((item) =>
        item.status === "done" || item.status === "error"
          ? { ...item, status: "pending" }
          : item,
      );
    });
  }, [padding]);

  /* Actions */

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    setFileQueue((prev) => {
      const newItems: FileItem[] = Array.from(files)
        .filter((f) => SUPPORTED_FILE_TYPES.includes(f.type))
        .filter(
          (f) =>
            !prev.some(
              (item) => item.file.name === f.name && item.file.size === f.size,
            ),
        )
        .map((f) => ({
          id: crypto.randomUUID(),
          file: f,
          status: "pending",
        }));

      return [...prev, ...newItems];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
    processedBlobs.current.delete(id);
  }, []);

  const downloadFile = useCallback(
    (id: string) => {
      const item = fileQueue.find((f) => f.id === id);
      if (!item) return;

      const data = processedBlobs.current.get(id);
      if (!data) return;

      const arrayBuffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(arrayBuffer).set(data);

      download(new Blob([arrayBuffer]), item.file.name);
    },
    [fileQueue],
  );
  const clearQueue = useCallback(() => {
    setFileQueue([]);
    processedBlobs.current.clear();
  }, []);

  const downloadZip = useCallback(async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      fileQueue.forEach((item) => {
        if (item.status === "done") {
          const data = processedBlobs.current.get(item.id);
          if (data) {
            zip.file(item.file.name, data);
          }
        }
      });

      download(await zip.generateAsync({ type: "blob" }), "fixed_textures.zip");
    } catch (e) {
      console.error("Zip generation failed", e);
    } finally {
      setIsZipping(false);
    }
  }, [fileQueue]);

  return {
    fileQueue,
    isProcessing,
    isZipping,
    addFiles,
    removeFile,
    downloadFile,
    clearQueue,
    downloadZip,
  };
}
