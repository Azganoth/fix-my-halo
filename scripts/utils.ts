import { spawn, type SpawnOptions } from "node:child_process";
import fs from "node:fs/promises";

type SpawnShellOptions = Omit<SpawnOptions, "shell">;

export const spawnShell = (cmd: string, options?: SpawnShellOptions) =>
  spawn(cmd, { stdio: "inherit", shell: true, ...options });

export const runCommand = (cmd: string, options?: SpawnShellOptions) =>
  new Promise<void>((resolve, reject) => {
    const process = spawnShell(cmd, options);

    process.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Exit code ${code}`));
    });

    process.on("error", (err) => reject(err));
  });

export const fsExists = (path: string) =>
  new Promise<boolean>((resolve) =>
    fs.stat(path).then(
      () => resolve(true),
      () => resolve(false),
    ),
  );
