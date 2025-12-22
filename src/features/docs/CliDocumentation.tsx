import { Button } from "@/components/ui/Button";
import { DownloadIcon, TerminalIcon } from "lucide-react";
import { CliCommandBuilder } from "./components/CliCommandBuilder";

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

      <div className="flex flex-col gap-8">
        <CliCommandBuilder />

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
      </div>
    </section>
  );
}
