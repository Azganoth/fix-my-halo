import chalk from "chalk";
import chokidar from "chokidar";
import { runCommand, spawnShell } from "./utils.js";

const CORE_DIR = "core";

// Rust Watcher
let isBuilding = false;
let needsRebuild = false;

const buildWasm = async () => {
  console.log("buildWasm");
  if (isBuilding) {
    needsRebuild = true;
    return;
  }

  isBuilding = true;
  needsRebuild = false;

  console.log(chalk.blue("[WASM] Change detected. Rebuilding..."));
  const start = Date.now();

  try {
    await runCommand("pnpm run build:wasm");

    console.log(chalk.blue(`[WASM] Build success in ${Date.now() - start}ms`));
  } catch {
    console.error(chalk.red("[WASM] Build failed"));
  } finally {
    isBuilding = false;

    if (needsRebuild) {
      console.log(
        chalk.yellow("[WASM] Queued changes detected. Restarting build..."),
      );
      buildWasm();
    }
  }
};

const watcher = chokidar.watch(CORE_DIR, {
  ignoreInitial: true,
  ignorePermissionErrors: true,
});

watcher
  .on("ready", () => {
    console.log(chalk.green("[WASM] Watching for changes..."));
  })
  .on("all", (event, filePath) => {
    if (!filePath.endsWith(".rs")) return;

    if (event === "add" || event === "change" || event === "unlink") {
      buildWasm();
    }
  });

await buildWasm();

const viteProcess = spawnShell("vite --clearScreen false");

// Clean Exit
process.on("SIGINT", () => {
  viteProcess.kill();
  watcher.close();
  process.exit(0);
});
