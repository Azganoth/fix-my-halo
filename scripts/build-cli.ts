import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import { fsExists, runCommand } from "./utils.js";

const CORE_DIR = "core";
const DIST_DIR = "dist-cli";
const BINARY_NAME = "fix-my-halo";
const OUTPUT_NAME = "fixmyhalo.exe";

const CARGO_TOML = path.join(CORE_DIR, "Cargo.toml");
const SOURCE_BIN = path.join(
  CORE_DIR,
  "target",
  "release",
  `${BINARY_NAME}.exe`,
);
const DEST_BIN = path.join(DIST_DIR, OUTPUT_NAME);

console.log(chalk.cyan("Starting CLI app build..."));

try {
  await fs.mkdir(DIST_DIR, { recursive: true });

  console.log(chalk.yellow("\n--- Compiling Release Binary ---"));

  await runCommand(
    `cargo build --manifest-path ${CARGO_TOML} --release --features cli --target x86_64-pc-windows-msvc`,
  );

  if (await fsExists(SOURCE_BIN)) {
    await fs.copyFile(SOURCE_BIN, DEST_BIN);
    console.log(chalk.green(`\n✔ Success! CLI available at:`));
    console.log(chalk.bold(DEST_BIN));
  } else {
    throw new Error(`Artifact not found at ${SOURCE_BIN}`);
  }
} catch (error) {
  console.error(chalk.red("\n✖ Build Failed:"));
  console.error(chalk.gray(error instanceof Error ? error.message : error));
  process.exit(1);
}
