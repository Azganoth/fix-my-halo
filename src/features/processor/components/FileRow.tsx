import { Button } from "@/components/ui/Button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";
import type { FileItem } from "@/features/processor/hooks/useBatchProcessor";
import { useFilePreview } from "@/features/processor/hooks/useFilePreview";
import {
  CheckCircle2Icon,
  DownloadIcon,
  Loader2Icon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface FileRowProps {
  item: FileItem;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export function FileRow({ item, onRemove, onDownload }: FileRowProps) {
  const preview = useFilePreview(item.file);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.2 }}
      className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border bg-card p-3"
    >
      {/* Thumbnail */}
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted/50">
        {preview ? (
          <HoverCard>
            <HoverCardTrigger>
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={preview}
                alt=""
                className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              />
            </HoverCardTrigger>
            <HoverCardContent className="w-auto max-w-64 md:max-w-96">
              <img
                src={preview}
                alt=""
                className="h-full w-full object-cover"
              />
            </HoverCardContent>
          </HoverCard>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-medium text-foreground">
          {item.file.name}
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <AnimatePresence mode="wait">
            {item.status === "processing" && (
              <motion.span
                key="processing"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-primary"
              >
                <Loader2Icon className="size-3 animate-spin" />
                Processing...
              </motion.span>
            )}
            {item.status === "done" && (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-green-500"
              >
                <CheckCircle2Icon className="size-3" />
                Done
              </motion.span>
            )}
            {item.status === "error" && (
              <motion.span
                key="error"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-destructive"
              >
                <XCircleIcon className="size-3" />
                Error
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {item.status !== "processing" && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive focus:opacity-100"
            onClick={() => onRemove(item.id)}
          >
            <TrashIcon className="size-5" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
        {item.status === "done" && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onDownload(item.id)}
          >
            <DownloadIcon className="size-5" />
            <span className="sr-only">Download</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
