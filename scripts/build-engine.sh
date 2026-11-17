#!/usr/bin/env bash
set -euo pipefail

output=${1:?usage: build-engine.sh <output-dir> [abi,abi...]}
abis=${2:-arm64-v8a}
root=$(cd "$(dirname "$0")/.." && pwd)

export PATH="$HOME/.cargo/bin:/opt/homebrew/opt/rustup/bin:$PATH"

for tool in cargo cargo-ndk; do
  command -v "$tool" >/dev/null || { echo "missing $tool (see docs/rust-engine.md)" >&2; exit 1; }
done

cd "$root"

targets=()
for abi in ${abis//,/ }; do targets+=(-t "$abi"); done

rm -rf "$output"
mkdir -p "$output/kotlin"

cargo ndk "${targets[@]}" -o "$output/jniLibs" build --release -p engine-bindings

cargo build -p engine-bindings
host_library=$(find target/debug -maxdepth 1 -name 'libengine_bindings.*' \( -name '*.dylib' -o -name '*.so' \) | head -1)

cargo run -q -p engine-bindgen -- generate \
  --library "$host_library" --language kotlin --no-format --out-dir "$output/kotlin"
