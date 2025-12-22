import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { DEFAULT_PADDING } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FolderInputIcon, FolderOpenIcon } from "lucide-react";
import { useMemo, useState } from "react";

export function CliCommandBuilder() {
  const [inputPath, setInputPath] = useState("textures");
  const [isRecursive, setIsRecursive] = useState(false);
  const [isInPlace, setIsInPlace] = useState(false);
  const [padding, setPadding] = useState(DEFAULT_PADDING);
  const [useCustomOutput, setUseCustomOutput] = useState(false);
  const [outputDir, setOutputDir] = useState("fixed/");

  const command = useMemo(() => {
    const parts = ["./fixmyhalo"];

    const safeInput = inputPath.includes(" ") ? `"${inputPath}"` : inputPath;
    parts.push(safeInput || "[path]");

    if (isRecursive) parts.push("--recursive");
    if (isInPlace) parts.push("--in-place");

    if (padding !== DEFAULT_PADDING) {
      parts.push(`--padding ${padding}`);
    }

    // Output dir (mutually exclusive with in-place)
    if (useCustomOutput && !isInPlace) {
      const safeOutput = outputDir.includes(" ") ? `"${outputDir}"` : outputDir;
      parts.push(`--output ${safeOutput || "[dir]"}`);
    }

    return parts.join(" ");
  }, [inputPath, isRecursive, isInPlace, padding, useCustomOutput, outputDir]);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Live Preview Header */}
      <div className="border-b bg-muted/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Command Builder</h3>
          <span className="text-xs text-muted-foreground">Live Preview</span>
        </div>
        <CodeSnippet code={command} language="powershell" />
      </div>

      {/* Controls */}
      <div className="grid gap-8 p-6 md:grid-cols-2">
        {/* Core Params */}
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-muted-foreground">Input Source</Label>
            <div className="relative">
              <FolderOpenIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                className="pl-9"
                placeholder="Path to file or folder..."
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: You can also use glob patterns like{" "}
              <span className="font-mono text-foreground">**/*.png</span>
            </p>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="recursive">Recursive Search</Label>
                <span className="text-xs font-normal text-muted-foreground">
                  Process subfolders deep inside
                </span>
              </div>
              <Switch
                id="recursive"
                checked={isRecursive}
                onCheckedChange={setIsRecursive}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="in-place">Overwrite Originals</Label>
                <span className="text-xs font-normal text-muted-foreground">
                  Don&apos;t create a copy (Destructive)
                </span>
              </div>
              <Switch
                id="in-place"
                checked={isInPlace}
                onCheckedChange={(checked) => {
                  setIsInPlace(checked);
                  if (checked) setUseCustomOutput(false);
                }}
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Dilation Padding</Label>
              <span className="font-mono text-xs font-bold">{padding}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={64}
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </div>

          <div
            className={cn(
              "space-y-3 transition-opacity",
              isInPlace && "pointer-events-none opacity-50",
            )}
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-output" className="text-muted-foreground">
                Custom Output Directory
              </Label>
              <Switch
                id="custom-output"
                checked={useCustomOutput}
                disabled={isInPlace}
                onCheckedChange={setUseCustomOutput}
              />
            </div>
            <div className="relative">
              <FolderInputIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={outputDir}
                disabled={!useCustomOutput || isInPlace}
                onChange={(e) => setOutputDir(e.target.value)}
                placeholder="Output path"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
