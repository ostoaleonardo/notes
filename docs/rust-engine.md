# Rust engine

The `crates/` workspace holds the shared core. It is the single place that parses notes, owns the SQLite index, writes files safely and keeps version history. Everything platform specific (Android file access, Expo marshalling, UI) lives outside it.

| Crate | Role |
|---|---|
| `crates/core` (package `engine`) | Pure logic. No platform code. Everything described below. |
| `crates/uniffi` (package `engine-bindings`) | Thin adapter generated with uniffi. Translates types and errors only. |
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

`crates/core/tests/contract.rs` runs a fixed repository through sync, listing, queries, saves, links, versions and parsing, and compares the result with `crates/core/tests/fixtures/contract.json`. When a change to the output is intended, regenerate the snapshot and review the diff:

```bash
CONTRACT_UPDATE=1 cargo test -p engine --test contract
```

Other fixtures: `yaml-emit.json` (js-yaml parity for the frontmatter emitter), `links.json`, `versions.json`, and the shared syntax corpus in `src/features/syntax/__fixtures__`. The generators (`generate-*.js`) run through a temporary jest test.

Rust code rules: no literals in logic. SQL and schema live in `index/sql.rs`, regexes in `syntax/patterns.rs`, and every other marker in the `constants.rs` of its module.

## Architecture

```
JS (React Native)             decides what to do, renders, orchestrates user actions
  │  Expo module `repository-fs`
Kotlin (packages/repository-fs)   only what needs Android APIs
  │  uniffi (generated Kotlin bindings)
crates/uniffi                 type and error translation
  │
crates/core (engine)          parsing · index · saves · links · versions · repository operations
```

### Who owns what

- **Rust (`crates/core`)**: parsing of markdown and frontmatter, the SQLite index (schema, writer, reconciliation, queries, listing), locale sort keys, indexing passes (`sync`), atomic note saves with conflict detection, frontmatter compose and decompose, wiki link resolution and rewriting, version history, and path-based repository operations (rename, move, trash, remove).
- **Kotlin**: SAF listing and reading, resolving the direct file path when the app has all-files access, implementing the foreign traits for SAF (`ProviderNoteSource`, `ProviderNoteSink`, `ProviderRepository`), computing Android document URIs, and marshalling for Expo (`RepositoryFsModule`, `RepositoryIndexer`, `EngineBridge`).
- **JS**: UI, state, deciding which action to run, search (parser, filters, cursor), link verification, external-edit merge, templates, daily notes, attachments, export, and the in-memory note model.

### Platform seams

The core never talks to Android. It depends on four small traits, so a desktop build only needs the `std::fs` implementations:

| Trait | Purpose | `std::fs` impl | Android |
|---|---|---|---|
| `NoteSource` | `scan` a folder and `read` changed notes | `FsSource` | `ProviderNoteSource` (SAF), or `FsSource` with all-files access |
| `NoteSink` | `stat`, `write`, `delete` one note | `FsSink` | `ProviderNoteSink` (SAF), or `FsSink` with all-files access |
| `RepositoryFiles` | read, write, delete and list small text files by repository-relative path (version store, config) | `FsRepository` | `ProviderRepository` (SAF), or `FsRepository` |
| `RepositoryOps: RepositoryFiles` | `exists`, `create_dir`, `rename_dir`, `move_file`, `remove_dir` | `FsRepository` | `ProviderRepository` (SAF), or `FsRepository` |

Note identity is an opaque **location** string. `LocationScheme` decides how it is built: `AndroidDocument { prefix }` percent-encodes the filename after the document URI prefix (what the provider returns), `FilePath` is the path of the file. The core never parses a location.

Vocabulary: a *repository* is the root folder the user picks; every directory in its tree, root included, is a *folder* (`folder_id`). Notes only move between folders of the same repository.

### Data flow

- **Indexing** (`Engine::sync`): scan the folder, reconcile against the indexed `(filename, modified, size)` rows, then read changed notes in batches of 500 on a reader thread while the previous batch is parsed in parallel (rayon) and written in one transaction. The channel depth is 1, so reading overlaps with writing without unbounded memory. A `progress(done, total)` callback reports advancement.
- **Saving** (`save_note`, `save_notes`, `rename_note`, `delete_note`): the sink writes (temporary hidden file, rename, size verification, up to 3 attempts) and the index row is updated in the same call, so the next sync sees the note as unchanged.
- **Compose and decompose** split and join the file text. `decompose` returns body, tags, properties, raw frontmatter, or the raw text flagged invalid when the YAML does not parse. `compose` reuses the original raw frontmatter byte for byte while tags and properties are unchanged and only re-emits YAML when they changed.
- **Links**: names are normalized when a note is indexed so backlink candidates are one indexed lookup. The index only narrows candidates; JS (or `find_backlinks`) verifies them with the full resolution rules and always checks notes the index has not covered yet.

## Database

One SQLite file, opened through a small connection pool (up to 4 idle connections). Settings: `journal_mode = WAL`, `synchronous = NORMAL`, `foreign_keys = ON`. Writes use `BEGIN IMMEDIATE`; a locked database is reported as the retryable `Busy` error.

The database is a **disposable index**: the source of truth is always the files. It is dropped and rebuilt when `PRAGMA user_version` differs from `SCHEMA_VERSION` (currently 1) or the stored `collation_locale` differs from the device locale. Bump the version when the stored format changes, including the sort key bytes. Until the first production release the version stays at 1 and a reinstall rebuilds the index.

### Tables

| Table | Columns | Notes |
|---|---|---|
| `notes` | `id`, `folder_id`, `filename`, `location`, `title`, `sort_key`, `modified`, `size`, `invalid_frontmatter`, `frontmatter` | One row per note. `UNIQUE(folder_id, filename)`. `title` is the filename without `.md`. `sort_key` is the ICU collation key as upper-case hex. `modified` and `size` drive reconciliation. `frontmatter` keeps the raw YAML block. |
| `tags` | `note_id`, `position`, `name`, `inline` | Frontmatter tags (`tags` or `tag` keys) and inline `#tags`, outside code. `inline` tells which. |
| `links` | `note_id`, `position`, `text`, `name`, `anchor_name` | Wiki links outside code. `text` is the link target as written, `name` the normalized title after the last `/`, `anchor_name` the normalized target when the link has a `#anchor`. |
| `markdown_links` | `note_id`, `position`, `target` | Markdown-style `[label](wikilink://…)` targets. |
| `properties` | `note_id`, `position`, `key`, `value` | Frontmatter properties except the tag keys, `value` as JSON text (strings, numbers, booleans, lists and nested maps keep their type). |
| `meta` | `key`, `value` | Currently `collation_locale`. |
| `note_fts` | `title`, `content` | FTS5, contentless (`content=''`, `contentless_delete=1`), trigram tokenizer with `remove_diacritics 1`. `rowid` is `notes.id`. Bodies are **not** stored. |

Child tables reference `notes(id)` with `ON DELETE CASCADE`. Indexes: `notes(sort_key, id)`, `notes(modified, sort_key, id)`, `tags(note_id)`, `tags(name COLLATE NOCASE)`, `links(note_id)`, `links(text COLLATE NOCASE)`, `links(name)`, `links(anchor_name)`, `markdown_links(note_id)`, `markdown_links(target)`, `properties(note_id)`.

Because bodies are not stored, the index cannot return note text: whoever needs the body reads the file.

Normalization used for names and mentions: NFC, trimmed, lower-case, ASCII fast path.

## Core API

Public surface of `crates/core`, by module. `folder_id` is the id of a folder in the app's tree.

### `engine` — `Engine`

The entry point; owns the connection pool and the sort keys.

| Function | What it does |
|---|---|
| `Engine::new(database_path, locale_tag)` | Opens the pool and builds the collator for the locale. Fails with `Collation` if the locale has no data. |
| `plan(folder_id, scanned)` | Compares a scan with the indexed rows of the folder and returns a `ReconcilePlan`: which files are added, updated, removed, unchanged. |
| `write(folder_id, inputs)` | Parses the notes in parallel and writes them (and their tags, links, properties and full-text row) in one transaction. Returns `BatchStats`. |
| `remove(folder_id, filenames)` | Deletes index rows for files that no longer exist. |
| `indexed_notes()` | Every indexed `(folder_id, filename, modified)`, as parallel arrays. Used to know which notes the index covers. |
| `query(sql, params)` | Runs a read statement and returns columns and rows. Used by JS for search prefilters. |
| `list_notes(folder_ids)` | Streams the metadata of the notes of the given folders as one JSON array: `folderId`, `filename`, `fileUri` (the location), `title`, `createdAt` and `updatedAt` (both the modified time), `tags`, `inlineTags`, `properties`, `linkTexts`, `invalidFrontmatter` and `rawFrontmatter`. Written straight to a string, without intermediate maps, for speed. |
| `backlink_candidates(names, markdown_target)` | Notes whose indexed links point at any of the normalized names, or at the markdown target. Candidates only; the caller verifies. |
| `mention_candidates(terms)` | Notes that may mention any term, via the trigram index. Returns `None` when a term has fewer than 3 characters, telling the caller to scan instead. |
| `delete_folder(folder_id)` | Removes every index row of a folder. |
| `prune(keep)` | Removes the rows of every folder not in `keep`. |

### `sync` — indexing pass

| Function | What it does |
|---|---|
| `Engine::sync(folder_id, source, progress)` | Scan, reconcile, remove vanished notes, then read, parse and write the changed ones in the pipeline described above. Returns `SyncStats` (total, added, updated, removed, unchanged, unreadable, and timings in ms). Notes that cannot be read count as `unreadable` and stay out of the index. |

### `save` — writes

| Function | What it does |
|---|---|
| `save_note(folder_id, sink, filename, text, expected_modified)` | Writes one note. `expected_modified` is the modified time the caller last saw: `None` means "create, must not exist" and a mismatch means someone else changed the file. Returns `Saved(stamp)`, `Conflict { disk_modified }`, `Missing` or `Failed`. Updates the index row. |
| `save_notes(folder_id, sink, requests)` | The same for a batch, indexing the saved ones in one transaction. Each request gets its own outcome. |
| `rename_note(folder_id, sink, from, to, text)` | Writes the new file, deletes the old one and swaps the index rows. Returns `Conflict` if `to` already exists. |
| `delete_note(folder_id, sink, filename)` | Deletes the file and its index row. A missing file is not an error. |

### `ops` — compound repository operations

Each takes a `Repository { ops, versions }` and runs as one call that keeps files, index rows and version history consistent.

| Function | What it does |
|---|---|
| `rename_folder(repository, path, new_name, affected_folder_ids)` | Renames a directory, drops the index rows of the folder and its descendants (their locations changed) and renames the versions under the old prefix. Restores the directory name if a later step fails. Returns the new path. |
| `remove_folder(repository, path, folder_ids, drop_versions)` | Drops the rows, removes the directory with its contents and optionally its versions. |
| `trash_note(repository, folder_id, folder_path, filename, trash_path)` | Moves the note into the trash directory under a free name (`name (2).md`, …), keeping its modified time, and drops its versions and index row. Returns the final name. |
| `move_note(repository, filename, from_id, from_path, to_id, to_path, to_sink)` | Moves the file (never overwriting, and refusing a name that collides in case or normalization), renames its versions (undoing the move if that fails) and refreshes both index folders. Returns `Moved(stamp)`, `TargetExists` or `SourceMissing`. |

Not covered: deleting a **repository root**. The root is the folder the user granted, so its relative path is empty and on SAF its tree root cannot be removed like a subdirectory. That case stays in JS (`deleteDirectory`).

### `names` — portable file names

| Function | What it does |
|---|---|
| `sanitize_filename(title, extension)` | Builds a file name stem from a title: invalid characters (`/ \ : * ? " < > |` and control characters) become spaces, the text is normalized to NFC, surrounding whitespace, BOMs and trailing dots and spaces are removed, names reserved on Windows (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`) get an `_` after the device part (`con.backup` becomes `con_.backup`), and the result is cut to 255 bytes minus the extension and 8 bytes kept for a ` (n)` suffix, on a character boundary. An empty result becomes `Untitled`. |
| `name_key(name)`, `names_collide(a, b)` | NFC plus lower-case. Names that differ only in case or normalization collide, so a repository stays valid on macOS and Windows. |
| `unique_name(existing, stem, extension, current)` | The first free `stem.ext`, `stem (2).ext`, `stem (3).ext`…, comparing with `name_key`. `current` is the note being renamed: it may keep or re-case its own name. |
| `has_link_breaking_chars(title)` | True when a title contains `#`, `^`, `[` or `]`, which break wiki links. |

Existing files are never renamed. The rules apply to new names and to comparisons only.

### `repository` — path-based files

| Item | What it does |
|---|---|
| `RepositoryFiles` | `read_text`, `write_text`, `delete_file`, `list_files` by repository-relative path. |
| `RepositoryOps` | `list_dir` (names and whether each is a directory, sorted; names that are not valid UTF-8 are skipped), `exists`, `create_dir` (recursive), `rename_dir` (fails with `AlreadyExists` instead of overwriting), `move_file` (`Moved`, `TargetExists`, `SourceMissing`), `remove_dir` (recursive, a missing directory is fine). |
| `FsRepository::new(root)` | `std::fs` implementation of both. Path segments are joined under the root; empty segments are ignored. |
| `validate_name(name)` | Rejects empty names, `.`, `..` and names containing `/`, `\` or NUL with `InvalidName`. Used before every rename. |

### `source` — scanning and writing one folder

| Item | What it does |
|---|---|
| `NoteSource` | `scan()` returns the notes of a folder as `SourceFile { location, filename, modified, size }`; `read(files)` returns their text (`None` when unreadable). |
| `FsSource::new(root, scheme)` | `std::fs` scan (parallel stat) and read. Ignores hidden files (`.` prefix) and anything not ending in `.md` (case-insensitive). Invalid UTF-8 is replaced, not rejected. |
| `NoteSink` | `stat(filename)`, `write(filename, text)`, `delete(filename)`. |
| `FsSink::new(root, scheme)` | Writes a hidden temporary file and renames it over the target, then verifies the size and retries up to 3 times. |
| `LocationScheme` | `AndroidDocument { prefix }` or `FilePath`. `LocationScheme::android(prefix)` is the shorthand. |
| `percent::{encode, decode}` | Percent encoding compatible with Android `Uri.encode`. Also used for the file names of the version store. |

### `syntax` — parsing

| Function | What it does |
|---|---|
| `parse_note(text)` | Splits frontmatter and body and extracts tags (frontmatter and inline), wiki links, markdown links, properties and the text to index. Inline code and fenced code are ignored for tags and links. Invalid YAML is flagged, never fatal. |
| `inline_tags(text)`, `wiki_links(text)` | The inline tags and the wiki link texts of a note. |
| `normalize(text)` | The link-name normalization (NFC, trim, lower-case). |
| `compose(fields, body)` | Builds the file text. Reuses the original frontmatter while tags and properties are unchanged, otherwise emits YAML (output matches js-yaml for the fixture; long strings are not folded). Returns the body untouched when there is nothing to write. |
| `decompose(content)` | Splits file text into body, tags, properties, raw frontmatter, or invalid raw frontmatter. |

### `links` — wiki links

| Function | What it does |
|---|---|
| `wiki_targets(body)` | The targets of the `[[…]]` links in a body: the alias after `|` is dropped, the `#anchor` stays. Hand-written scanner (validated against the regex on random input). |
| `NoteIndex::new(notes)` | Index of `LinkNote { path, title, aliases }` by normalized title and alias. |
| `NoteIndex::find(link_text, folders)` | Resolves a link to a note: by title, then by alias; when several notes share the name, the path in the link (`folder/title`) picks the one in that folder. |
| `NoteIndex::locate(link_text, folders)` | `find`, falling back to the part before `#`. |
| `NoteIndex::resolve(link_text, folders, self_path)` | `locate` plus the anchor; a link that starts with `#` resolves to the current note. |
| `find_backlinks(target_path, index, folders, candidates)` | Of the candidate bodies, the paths whose links resolve to the target, including markdown links. |
| `rename_links(content, target_path, new_title, index, folders, resolve_folders)` | Rewrites every link to the target for a new title, qualifying with the folder when the new title would be ambiguous and keeping aliases and anchors. |

### `versions` — history

Each note has one JSON file in `.notes/`, named with the percent-encoded key `folder/path/filename.md`. It stores the latest full text (`head`) and a list of entries; every older entry keeps a line delta against the next one, so history costs the size of the changes.

| Function | What it does |
|---|---|
| `build_line_delta(from, to)` | Line-based diff (LCS) as `Hunk { at, remove, insert }`. Falls back to one hunk when the diff would exceed 4 000 000 cells. |
| `apply_line_delta(text, delta)` | Applies a delta. `apply(from, build(from, to)) == to`. |
| `commit_version(raw, new_version)` | Pure function: adds a version unless the head and title did not change, converts the legacy array format, and keeps at most `max_versions`. |
| `RepositoryVersions::new(repository)` | Version store over a `RepositoryFiles`, serialized by a lock. |
| `read`, `write`, `delete`, `commit` | By key. A corrupt file is moved aside with a `.corrupt` suffix and treated as missing. |
| `rename(old, new)` | Moves one note's history (empty stores are not moved). |
| `rename_under(old_prefix, new_prefix)`, `delete_under(prefix)` | The same for every key of a folder. |
| `migrate_legacy(folder, folder_path)` | Moves the old per-folder version files into the repository-level `.notes/` store. |

### Others

| Item | What it does |
|---|---|
| `collation::SortKeys::new(locale)` / `key(text)` | ICU4X collation key as upper-case hex. Needs the locale's data (about 1.3 MB for the full set). |
| `reconcile::plan(existing, scanned)` | The pure diff behind `Engine::plan`. |
| `error::Error` | `Busy` (retryable), `Database`, `Collation`, `Io`, `AlreadyExists`, `InvalidName`. |

## Adapter and Android

`crates/uniffi` exports `Engine` and the free functions below, plus the foreign traits Kotlin implements (`NoteSource`, `NoteSink`, `RepositoryFiles`, `ProgressListener`) and the objects `FsNoteSink`, `FsRepositoryHandle` (direct access) and `VersionsHandle`. Errors map one to one to `EngineError`. The trait `RepositoryFiles` there carries the repository operations too, so one Kotlin class serves versions and folder operations.

Free functions: `compose_note`, `decompose_note`, `find_backlink_paths`, `rename_links_in_bodies`, `sanitize_filename`, `unique_filename`. Engine methods exported: `sync`, `sync_directory` (direct access, builds a `FsSource`), `save_note`, `save_notes`, `rename_note`, `delete_note`, `rename_folder`, `remove_folder`, `trash_note`, `move_note`, `indexed_notes`, `query`, `list_notes`, `backlink_candidates`, `mention_candidates`, `delete_folder`, `prune`.

The Expo module `repository-fs` exposes to JS: `indexRepository`, `saveNote`, `saveNotes`, `renameNote`, `deleteNote`, `renameFolder`, `removeFolder`, `trashNote`, `moveNote`, `composeNote`, `decomposeNote`, `sanitizeFilename`, `uniqueFilename`, `listIndexedNotes`, `queryIndex`, `listNoteMetadata`, `findBacklinkCandidates`, `findMentionCandidates`, `findBacklinkPaths`, `renameLinksInBodies`, `pruneRepositoryIndex`, `deleteFolderIndex`, the `versions*` functions, and SAF helpers (`listDirectory`, `listDirectorySync`, `readTextFiles`, `findChild`, `listAttachments`, direct access permissions).

The index-changing operations (`indexRepository`, `pruneRepositoryIndex`, `deleteFolderIndex`, `renameFolder`, `removeFolder`, `trashNote`, `moveNote`) run under one lock in Kotlin so they do not interleave. The shared engine and the version stores are created once per process.

## Testing

- Rust: `cargo test` runs the unit, parity, property (`proptest`) and contract tests described above.
- Kotlin: `./gradlew :repository-fs:testDebugUnitTest -x lint -PreactNativeArchitectures=arm64-v8a` runs Robolectric tests against a fake in-memory documents provider (SAF) and temp directories (direct access).
- JS: `npm test`.
