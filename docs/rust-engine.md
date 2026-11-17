# Rust engine

The `crates/` workspace holds the shared core.

| Crate | Role |
|---|---|
| `crates/core` (package `engine`) | Pure logic: syntax extraction, index schema and writer, indexer. No platform code. |
| `crates/uniffi` (package `engine-bindings`) | Thin Android bindings generated with uniffi. Translates types only. |
| `crates/bindgen` | The `uniffi-bindgen` binary used by the build. |

## Setup

```bash
brew install rustup
rustup default stable
cargo install cargo-ndk
```

`rust-toolchain.toml` pins the compiler and the Android targets; rustup installs them on first use.

## Build

Gradle runs `scripts/build-engine.sh` before every Android build. It writes the shared libraries and the generated Kotlin bindings to `packages/repository-fs/android/build/engine`.

## Checks

```bash
cargo fmt --all --check
cargo clippy --all-targets -- -D warnings
cargo test
```

## Architecture

- Rust owns parsing, the SQLite index (schema, writer, reconciliation, queries) and the locale sort keys (ICU4X collator).
- Kotlin only does what needs Android APIs: directory scanning and file reading through SAF or direct access (`RepositoryFsModule`, `RepositoryIndexer`), and marshalling for Expo (`EngineBridge`).
- The index database is rebuilt when `SCHEMA_VERSION` or the device locale changes. Bump the version whenever the stored format changes, including the sort key bytes.
- The syntax extractor is checked in `crates/core/tests/corpus_parity.rs` against the shared corpus in `src/features/syntax/__fixtures__`.
- Link names are normalized (NFC, trimmed, lowercase, title after the last `/`) when a note is indexed, so backlink candidates are one indexed SQL lookup. Markdown-style `wikilink://` links live in `markdown_links`. Mention candidates use the trigram full-text index and ask the caller to scan when a term is shorter than three characters.
- The index only narrows the candidates. JS verifies them with the same resolution rules as before and always checks notes the index has not covered yet (`index-coverage.js`).
