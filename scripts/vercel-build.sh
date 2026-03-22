#!/bin/bash
set -e

# Define local paths for Rust/Cargo to avoid permission issues in /root
export CARGO_HOME="$PWD/.cargo"
export RUSTUP_HOME="$PWD/.rustup"
export PATH="$CARGO_HOME/bin:$PATH"

echo "Checking for Rust/wasm32 target..."

# Install rustup and wasm32 target locally if not found
if ! command -v rustc >/dev/null || ! rustc --print target-list | grep -q wasm32-unknown-unknown; then
    echo "Installing Rust and wasm32 target..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --target wasm32-unknown-unknown --no-modify-path
fi

# Run the actual build
pnpm build
