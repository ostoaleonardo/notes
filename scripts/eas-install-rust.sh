#!/usr/bin/env bash
set -euo pipefail

cargo_ndk_version=4.1.2
root=$(cd "$(dirname "$0")/.." && pwd)

export PATH="$HOME/.cargo/bin:$PATH"

if ! command -v rustup >/dev/null; then
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
		| sh -s -- -y --profile minimal --default-toolchain none --no-modify-path
fi

cd "$root"
rustup show active-toolchain >/dev/null 2>&1 || rustup toolchain install

if ! cargo ndk --version 2>/dev/null | grep -q "$cargo_ndk_version"; then
	cargo install cargo-ndk --version "$cargo_ndk_version" --locked
fi
