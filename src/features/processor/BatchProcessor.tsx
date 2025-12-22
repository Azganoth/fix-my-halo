import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Slider } from "@/components/ui/Slider";
import { FileRow } from "@/features/processor/components/FileRow";
import { SUPPORTED_FILE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  DownloadIcon,
  ImagePlusIcon,
  Loader2Icon,
  TrashIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useBatchProcessor } from "./hooks/useBatchProcessor";

export function BatchProcessor() {
  const defaultPadding = useSettingsStore((state) => state.defaultPadding);

  // Separate visual state (paddingValue) from logic state (padding).
  // This allows smooth sliding without triggering heavy reprocessing on every pixel move.
  const [paddingValue, setPaddingValue] = useState([defaultPadding]);
  const [padding, setPadding] = useState(defaultPadding);

  const setDefaultPadding = useSettingsStore(
    (state) => state.setDefaultPadding,
  );

  useEffect(() => {
    setDefaultPadding(padding);
  }, [setDefaultPadding, padding]);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    fileQueue,
    isZipping,
    addFiles,
    removeFile,
    downloadFile,
    clearQueue,
    downloadZip,
  } = useBatchProcessor({ padding });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const pendingCount = fileQueue.filter(
    (f) => f.status === "pending" || f.status === "processing",
  ).length;
  const doneCount = fileQueue.filter((f) => f.status === "done").length;
  const hasItems = fileQueue.length > 0;

  return (
    <div className="flex h-full flex-col gap-6">
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors",
          isDragging && "border-primary",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden Input for Click Upload */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={SUPPORTED_FILE_TYPES.join(",")}
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Empty State */}
        {!hasItems && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-6 p-8 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <motion.div
              animate={{
                scale: isDragging ? 1.1 : 1,
                rotate: isDragging ? 5 : 0,
              }}
              className="flex items-center justify-center rounded-full bg-muted p-6"
            >
              <ImagePlusIcon className="h-10 w-10 text-muted-foreground" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Drop textures here</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Support for PNG, JPG, TGA, BMP, TIFF and DDS. Drag & drop
                multiple files or click to browse.
              </p>
            </div>
            <Button variant="outline">Select Files</Button>
          </motion.div>
        )}

        {/* Active List State */}
        {hasItems && (
          <div className="flex flex-col">
            {/* List Header / Toolbar */}
            <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3 backdrop-blur">
              <div className="text-sm font-medium text-muted-foreground">
                {fileQueue.length} files
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearQueue}
                disabled={pendingCount > 0}
                className="space-x-1 px-2 py-1 hover:text-destructive"
              >
                <TrashIcon className="size-5" />
                <span>Clear Files</span>
              </Button>
            </div>

            {/* Scrollable List */}
            <ScrollArea className="m-2 flex max-h-120 flex-col">
              <div className="space-y-2 p-4">
                <AnimatePresence initial={false} mode="popLayout">
                  {fileQueue.map((item) => (
                    <FileRow
                      key={item.id}
                      item={item}
                      onRemove={removeFile}
                      onDownload={downloadFile}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Drag Overlay (When dragging over list) */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="text-2xl font-bold text-primary"
                  >
                    Drop to add files
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="sticky bottom-4 z-10 mx-auto w-full max-w-2xl rounded-xl border bg-background/80 p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/60"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Slider Control */}
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label
                className="text-sm font-medium tracking-wide"
                htmlFor="dilation-padding"
              >
                Dilation Padding
              </Label>
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold tracking-wide text-foreground">
                {paddingValue[0]}px
              </span>
            </div>
            <Slider
              id="dilation-padding"
              min={1}
              max={64}
              step={1}
              value={paddingValue}
              onValueChange={setPaddingValue}
              onValueCommit={([p]) => setPadding(p)}
              disabled={pendingCount > 0}
            />
          </div>

          {/* Primary Action */}
          <Button
            size="lg"
            className="w-full min-w-60 space-x-1 shadow-md sm:w-auto"
            onClick={downloadZip}
            disabled={doneCount === 0 || pendingCount > 0 || isZipping}
          >
            {isZipping ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              <DownloadIcon className="size-5" />
            )}
            <span>
              {doneCount > 0 ? `Download ${doneCount} Files` : "Download ZIP"}
            </span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
