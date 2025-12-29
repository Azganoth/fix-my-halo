import "@/App.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CliDocumentation } from "@/features/docs/CliDocumentation";
import { ProcessExplanation } from "@/features/docs/ProcessExplanation";
import { BatchProcessor } from "@/features/processor/BatchProcessor";
import { useThemeStore } from "@/stores/useThemeStore";
import { useWorkerStore } from "@/stores/useWorkerStore";
// @ts-expect-error fontsource font
import "@fontsource-variable/inter";
// @ts-expect-error fontsource font
import "@fontsource-variable/jetbrains-mono";
import { Loader2Icon } from "lucide-react";
import { motion, type MotionProps, type Variants } from "motion/react";
import { useEffect } from "react";

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const revealAnimation: MotionProps = {
  variants: fadeUpVariants,
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-100px" },
};

export function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const isDark =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : theme === "dark";

    window.document.documentElement.classList.toggle("dark", isDark);
  }, [theme]);

  const { isReady, init } = useWorkerStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!isReady) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center">
        <Loader2Icon className="size-16 animate-spin text-primary" />
        <p className="mt-8 animate-pulse text-2xl font-bold text-primary">
          Loading Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <Header />

      <main className="container m-auto flex flex-1 flex-col items-center gap-20 px-6 py-12 md:py-16">
        <section
          id="app"
          className="flex min-h-[calc(100dvh-8.5rem)] w-full max-w-3xl flex-col items-center gap-12"
        >
          <motion.div {...revealAnimation} className="text-center">
            <h1 className="text-4xl font-extrabold lg:text-6xl">
              Fix My <span className="text-primary">Halo</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Automatically eliminate white artifacts from your textures using
              pixel dilation. Runs 100% locally in your browser.
            </p>
          </motion.div>

          <motion.div {...revealAnimation} className="my-auto w-full">
            <BatchProcessor />
          </motion.div>
        </section>

        <motion.div {...revealAnimation}>
          <ProcessExplanation />
        </motion.div>

        <motion.div {...revealAnimation} className="w-full max-w-3xl">
          <CliDocumentation />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
