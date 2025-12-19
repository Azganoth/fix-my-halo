import "@/App.css";
import init, { run_wasm_dilation } from "@/pkg/fix_my_halo";
// @ts-expect-error fontsource font
import "@fontsource-variable/inter";
import { useEffect, useState } from "react";

interface ProcessingResult {
  original_size: number;
  new_size: number;
  processed_pixels: number;
  time_taken_ms: number;
  message: string;
}

export function App() {
  const [isReady, setIsReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  useEffect(() => {
    init()
      .then(() => setIsReady(true))
      .catch((e) => console.error("Wasm failed to load:", e));
  }, []);

  const handleSimulateDrop = () => {
    if (!isReady || processing) return;
    setProcessing(true);
    setResult(null);

    setTimeout(() => {
      try {
        const rawResult = run_wasm_dilation(12);
        setResult(rawResult as ProcessingResult);
      } catch (e) {
        console.error("Processing failed", e);
      }
      setProcessing(false);
    }, 800);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            FixMyHalo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Texture Dilation Engine (Dummy Mode)
          </p>
        </header>

        {/* Drop Zone Simulation */}
        <div
          onClick={handleSimulateDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-10 transition-colors ${processing ? "border-primary bg-primary/10" : "hover:border-accent hover:bg-accent/20"} `}
        >
          {processing ? (
            <div className="font-bold text-primary">Processing...</div>
          ) : (
            <>
              <div className="text-4xl">😇</div>
              <p className="text-sm text-muted-foreground">
                Click to simulate processing
              </p>
            </>
          )}
        </div>

        {/* Console Output */}
        <div className="h-48 overflow-auto rounded-lg border border-border bg-card p-4 text-left font-mono text-xs shadow-inner">
          <div className="mb-2 border-b border-border pb-1 text-muted-foreground">
            System Log
          </div>

          <p className={isReady ? "text-green-500" : "text-red-500"}>
            {isReady ? "✓ Engine Loaded. Ready." : "⚠ Engine Loading..."}
          </p>

          {result && (
            <pre className="mt-2 whitespace-pre-wrap text-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
