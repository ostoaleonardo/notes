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

`crates/core/tests/contract.rs` runs a fixed vault through sync, listing, queries, saves, links, versions and parsing, and compares the result with `crates/core/tests/fixtures/contract.json`. When a change to the output is intended, regenerate the snapshot and review the diff:

```bash
CONTRACT_UPDATE=1 cargo test -p engine --test contract
```

## Architecture

- Rust owns parsing, the SQLite index (schema, writer, reconciliation, queries) and the locale sort keys (ICU4X collator).
- `Engine::sync` runs the whole indexing pass (scan, reconcile, batched reads overlapped with parse and write, progress) against a `NoteSource` (`crates/core/src/source`). `FsSource` reads a directory with `std::fs`; Android uses it when the app has all-files access (`syncDirectory`, Kotlin passes the document URI prefix so stored URIs match the provider ones). Without that access Kotlin implements `NoteSource` over SAF (`ProviderNoteSource`) and Rust calls back for `scan` and `read`. A desktop build only needs `FsSource` or its own `NoteSource`.
- Writes go through a `NoteSink` (`stat`, `write`, `delete`). `Engine::save_note` checks the expected modified time (conflict or missing instead of overwriting), writes with size verification and updates the index row in the same call, so the next sync sees the note as unchanged. `rename_note` and `delete_note` do the same for the file and the index. `FsSink` writes a hidden temp file and renames it; Android uses it with direct access and `ProviderNoteSink` (SAF) otherwise.
- `compose`/`decompose` build and split the file text (frontmatter block plus body) in Rust. The YAML emitter matches js-yaml output for the fixture in `crates/core/tests/fixtures/yaml-emit.json` (regenerate with `generate-yaml.js`); long strings are not folded.
- Kotlin only does what needs Android APIs: SAF listing and reading, resolving the direct path, and marshalling for Expo (`RepositoryFsModule`, `RepositoryIndexer`, `EngineBridge`).
- The index database is rebuilt when `SCHEMA_VERSION` or the device locale changes. Bump the version whenever the stored format changes, including the sort key bytes.
- The syntax extractor is checked in `crates/core/tests/corpus_parity.rs` against the shared corpus in `src/features/syntax/__fixtures__`.
- Link names are normalized (NFC, trimmed, lowercase, title after the last `/`) when a note is indexed, so backlink candidates are one indexed SQL lookup. Markdown-style `wikilink://` links live in `markdown_links`. Mention candidates use the trigram full-text index and ask the caller to scan when a term is shorter than three characters.
- The index only narrows the candidates. JS verifies them with the same resolution rules as before and always checks notes the index has not covered yet (`index-coverage.js`).
