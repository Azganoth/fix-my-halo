import { Button } from "@/components/ui/Button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const iconVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export function CodeSnippet({ code, language = "bash" }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border bg-muted">
      <div className="flex items-center justify-between border-b bg-muted px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={handleCopy}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15 }}
              >
                <CheckIcon className="size-4 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15 }}
              >
                <CopyIcon className="size-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 py-3">
        <code className="font-mono text-sm text-foreground">{code}</code>
      </pre>
    </div>
  );
}
