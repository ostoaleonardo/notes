use engine::engine::Engine;
use engine::model::{SaveOutcome, Value};
use engine::source::{FsSink, FsSource, NoteSink};
use std::fs;
use tempfile::TempDir;

const URI_PREFIX: &str = "content://tree/document/root%2F";

struct Vault {
	directory: TempDir,
	engine: Engine,
	sink: FsSink,
}

impl Vault {
	fn new() -> Self {
		let directory = TempDir::new().unwrap();
		let notes = directory.path().join("notes");
		fs::create_dir(&notes).unwrap();

		Self {
			engine: Engine::new(directory.path().join("index.db"), "en").unwrap(),
			sink: FsSink::new(&notes, URI_PREFIX),
			directory,
		}
	}

	fn notes(&self) -> std::path::PathBuf {
		self.directory.path().join("notes")
	}

	fn save(&self, filename: &str, text: &str, expected: Option<i64>) -> SaveOutcome {
		self.engine
			.save_note("repo", &self.sink, filename, text, expected)
			.unwrap()
	}

	fn indexed(&self) -> Vec<String> {
		self.engine
			.query("SELECT filename FROM notes ORDER BY filename", &[])
			.unwrap()
			.rows
			.into_iter()
			.map(|row| match &row[0] {
				Value::Text(name) => name.clone(),
				other => panic!("unexpected {other:?}"),
			})
			.collect()
	}
}

fn saved(outcome: SaveOutcome) -> engine::model::FileStamp {
	match outcome {
		SaveOutcome::Saved(stamp) => stamp,
		other => panic!("expected a saved note, got {other:?}"),
	}
}

#[test]
fn creates_the_file_and_indexes_the_note() {
	let vault = Vault::new();

	let stamp = saved(vault.save("a.md", "#tag a", None));

	assert_eq!(
		fs::read_to_string(vault.notes().join("a.md")).unwrap(),
		"#tag a"
	);
	assert_eq!(stamp.uri, format!("{URI_PREFIX}a.md"));
	assert_eq!(stamp.size, 6);
	assert_eq!(vault.indexed(), ["a.md"]);
}

#[test]
fn updates_a_note_that_was_not_changed_outside() {
	let vault = Vault::new();
	let first = saved(vault.save("a.md", "one", None));

	let second = saved(vault.save("a.md", "two words", Some(first.modified)));

	assert_eq!(
		fs::read_to_string(vault.notes().join("a.md")).unwrap(),
		"two words"
	);
	assert_eq!(second.size, 9);
}

#[test]
fn reports_a_conflict_when_the_file_changed_outside() {
	let vault = Vault::new();
	let first = saved(vault.save("a.md", "one", None));
	fs::write(vault.notes().join("a.md"), "edited elsewhere").unwrap();
	let touched = filetime_after(&vault, "a.md", first.modified);

	let outcome = vault.save("a.md", "mine", Some(first.modified));

	assert_eq!(
		outcome,
		SaveOutcome::Conflict {
			disk_modified: touched
		}
	);
	assert_eq!(
		fs::read_to_string(vault.notes().join("a.md")).unwrap(),
		"edited elsewhere"
	);
}

fn filetime_after(vault: &Vault, filename: &str, previous: i64) -> i64 {
	let mut stamp = vault.sink.stat(filename).unwrap().unwrap();

	while stamp.modified == previous {
		std::thread::sleep(std::time::Duration::from_millis(5));
		fs::write(vault.notes().join(filename), "edited elsewhere").unwrap();
		stamp = vault.sink.stat(filename).unwrap().unwrap();
	}

	stamp.modified
}

#[test]
fn reports_a_missing_file_when_updating_a_deleted_note() {
	let vault = Vault::new();

	assert_eq!(vault.save("gone.md", "text", Some(1)), SaveOutcome::Missing);
	assert!(vault.indexed().is_empty());
}

#[test]
fn refuses_to_create_over_an_existing_file() {
	let vault = Vault::new();
	saved(vault.save("a.md", "one", None));

	assert!(matches!(
		vault.save("a.md", "other", None),
		SaveOutcome::Conflict { .. }
	));
	assert_eq!(
		fs::read_to_string(vault.notes().join("a.md")).unwrap(),
		"one"
	);
}

#[test]
fn leaves_no_temporary_file_behind() {
	let vault = Vault::new();
	saved(vault.save("a.md", "one", None));

	let names: Vec<_> = fs::read_dir(vault.notes())
		.unwrap()
		.map(|entry| entry.unwrap().file_name().into_string().unwrap())
		.collect();

	assert_eq!(names, ["a.md"]);
}

#[test]
fn renames_a_note_in_the_file_and_in_the_index() {
	let vault = Vault::new();
	saved(vault.save("old.md", "body", None));

	let outcome = vault
		.engine
		.rename_note("repo", &vault.sink, "old.md", "new.md", "body")
		.unwrap();

	assert!(matches!(outcome, SaveOutcome::Saved(_)));
	assert!(!vault.notes().join("old.md").exists());
	assert!(vault.notes().join("new.md").exists());
	assert_eq!(vault.indexed(), ["new.md"]);
}

#[test]
fn refuses_to_rename_onto_an_existing_note() {
	let vault = Vault::new();
	saved(vault.save("a.md", "a", None));
	saved(vault.save("b.md", "b", None));

	let outcome = vault
		.engine
		.rename_note("repo", &vault.sink, "a.md", "b.md", "a")
		.unwrap();

	assert!(matches!(outcome, SaveOutcome::Conflict { .. }));
	assert_eq!(vault.indexed(), ["a.md", "b.md"]);
}

#[test]
fn deletes_a_note_from_the_file_and_the_index() {
	let vault = Vault::new();
	saved(vault.save("a.md", "a", None));

	vault
		.engine
		.delete_note("repo", &vault.sink, "a.md")
		.unwrap();
	vault
		.engine
		.delete_note("repo", &vault.sink, "a.md")
		.unwrap();

	assert!(!vault.notes().join("a.md").exists());
	assert!(vault.indexed().is_empty());
}

#[test]
fn keeps_the_index_consistent_with_a_later_scan() {
	let vault = Vault::new();
	saved(vault.save("a.md", "a", None));
	saved(vault.save("b.md", "b", None));

	let source = FsSource::new(vault.notes(), URI_PREFIX);
	let stats = vault.engine.sync("repo", &source, &|_, _| {}).unwrap();

	assert_eq!((stats.added, stats.updated, stats.unchanged), (0, 0, 2));
}
