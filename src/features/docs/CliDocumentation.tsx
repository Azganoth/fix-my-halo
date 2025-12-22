import { Button } from "@/components/ui/Button";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { DownloadIcon, TerminalIcon } from "lucide-react";

export function CliDocumentation() {
  return (
    <section id="cli-docs" className="w-full scroll-mt-24 space-y-8">
      <div className="space-y-2 text-center md:text-left">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <TerminalIcon className="size-6 text-primary" />
          <h2 className="text-2xl font-bold">CLI Reference</h2>
        </div>
        <p className="text-muted-foreground">
          Automate your asset pipeline with the native command-line tool.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Installation */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <DownloadIcon className="size-4" />
            Installation
          </h3>
          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Download the latest standalone executable for Windows (x64) from
              the releases page. No dependencies required.
            </p>
            <Button className="w-full" asChild>
              <a
                href="https://github.com/Azganoth/fix-my-halo/releases"
                target="_blank"
                rel="noreferrer"
              >
                Go to GitHub Releases
              </a>
            </Button>
          </div>
        </div>

        {/* Usage */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Usage Examples</h3>
          <div className="grid gap-4">
            <div className="space-y-3">
              <h4 className="font-mono text-xs text-muted-foreground uppercase">
                Single File
              </h4>
              <CodeSnippet code="fix-my-halo.exe input.png" />
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs text-muted-foreground uppercase">
                With Custom Padding
              </h4>
              <CodeSnippet code="fix-my-halo.exe input.png --padding 16" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
