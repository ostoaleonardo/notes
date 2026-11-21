use engine::engine::Engine;
use engine::model::{SaveOutcome, SaveRequest, Value};
use engine::source::{FsSink, FsSource, LocationScheme, NoteSink};
use std::fs;
use tempfile::TempDir;

const URI_PREFIX: &str = "content://tree/document/root%2F";

struct Repository {
	directory: TempDir,
	engine: Engine,
	sink: FsSink,
}

impl Repository {
	fn new() -> Self {
		let directory = TempDir::new().unwrap();
		let notes = directory.path().join("notes");
		fs::create_dir(&notes).unwrap();

		Self {
			engine: Engine::new(directory.path().join("index.db"), "en").unwrap(),
			sink: FsSink::new(&notes, LocationScheme::android(URI_PREFIX)),
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
	let repository = Repository::new();

	let stamp = saved(repository.save("a.md", "#tag a", None));

	assert_eq!(
		fs::read_to_string(repository.notes().join("a.md")).unwrap(),
		"#tag a"
	);
	assert_eq!(stamp.location, format!("{URI_PREFIX}a.md"));
	assert_eq!(stamp.size, 6);
	assert_eq!(repository.indexed(), ["a.md"]);
}

#[test]
fn updates_a_note_that_was_not_changed_outside() {
	let repository = Repository::new();
	let first = saved(repository.save("a.md", "one", None));

	let second = saved(repository.save("a.md", "two words", Some(first.modified)));

	assert_eq!(
		fs::read_to_string(repository.notes().join("a.md")).unwrap(),
		"two words"
	);
	assert_eq!(second.size, 9);
}

#[test]
fn reports_a_conflict_when_the_file_changed_outside() {
	let repository = Repository::new();
	let first = saved(repository.save("a.md", "one", None));
	fs::write(repository.notes().join("a.md"), "edited elsewhere").unwrap();
	let touched = filetime_after(&repository, "a.md", first.modified);

	let outcome = repository.save("a.md", "mine", Some(first.modified));

	assert_eq!(
		outcome,
		SaveOutcome::Conflict {
			disk_modified: touched
		}
	);
	assert_eq!(
		fs::read_to_string(repository.notes().join("a.md")).unwrap(),
		"edited elsewhere"
	);
}

fn filetime_after(repository: &Repository, filename: &str, previous: i64) -> i64 {
	let mut stamp = repository.sink.stat(filename).unwrap().unwrap();

	while stamp.modified == previous {
		std::thread::sleep(std::time::Duration::from_millis(5));
		fs::write(repository.notes().join(filename), "edited elsewhere").unwrap();
		stamp = repository.sink.stat(filename).unwrap().unwrap();
	}

	stamp.modified
}

#[test]
fn reports_a_missing_file_when_updating_a_deleted_note() {
	let repository = Repository::new();

	assert_eq!(
		repository.save("gone.md", "text", Some(1)),
		SaveOutcome::Missing
	);
	assert!(repository.indexed().is_empty());
}

#[test]
fn refuses_to_create_over_an_existing_file() {
	let repository = Repository::new();
	saved(repository.save("a.md", "one", None));

	assert!(matches!(
		repository.save("a.md", "other", None),
		SaveOutcome::Conflict { .. }
	));
	assert_eq!(
		fs::read_to_string(repository.notes().join("a.md")).unwrap(),
		"one"
	);
}

#[test]
fn leaves_no_temporary_file_behind() {
	let repository = Repository::new();
	saved(repository.save("a.md", "one", None));

	let names: Vec<_> = fs::read_dir(repository.notes())
		.unwrap()
		.map(|entry| entry.unwrap().file_name().into_string().unwrap())
		.collect();

	assert_eq!(names, ["a.md"]);
}

#[test]
fn renames_a_note_in_the_file_and_in_the_index() {
	let repository = Repository::new();
	saved(repository.save("old.md", "body", None));

	let outcome = repository
		.engine
		.rename_note("repo", &repository.sink, "old.md", "new.md", "body")
		.unwrap();

	assert!(matches!(outcome, SaveOutcome::Saved(_)));
	assert!(!repository.notes().join("old.md").exists());
	assert!(repository.notes().join("new.md").exists());
	assert_eq!(repository.indexed(), ["new.md"]);
}

#[test]
fn refuses_to_rename_onto_an_existing_note() {
	let repository = Repository::new();
	saved(repository.save("a.md", "a", None));
	saved(repository.save("b.md", "b", None));

	let outcome = repository
		.engine
		.rename_note("repo", &repository.sink, "a.md", "b.md", "a")
		.unwrap();

	assert!(matches!(outcome, SaveOutcome::Conflict { .. }));
	assert_eq!(repository.indexed(), ["a.md", "b.md"]);
}

#[test]
fn deletes_a_note_from_the_file_and_the_index() {
	let repository = Repository::new();
	saved(repository.save("a.md", "a", None));

	repository
		.engine
		.delete_note("repo", &repository.sink, "a.md")
		.unwrap();
	repository
		.engine
		.delete_note("repo", &repository.sink, "a.md")
		.unwrap();

	assert!(!repository.notes().join("a.md").exists());
	assert!(repository.indexed().is_empty());
}

#[test]
fn keeps_the_index_consistent_with_a_later_scan() {
	let repository = Repository::new();
	saved(repository.save("a.md", "a", None));
	saved(repository.save("b.md", "b", None));

	let source = FsSource::new(repository.notes(), LocationScheme::android(URI_PREFIX));
	let stats = repository.engine.sync("repo", &source, &|_, _| {}).unwrap();

	assert_eq!((stats.added, stats.updated, stats.unchanged), (0, 0, 2));
}

struct FailingSink {
	inner: FsSink,
	failing: &'static str,
}

impl NoteSink for FailingSink {
	fn stat(&self, filename: &str) -> engine::error::Result<Option<engine::model::FileStamp>> {
		self.inner.stat(filename)
	}

	fn write(&self, filename: &str, text: &str) -> engine::error::Result<engine::model::FileStamp> {
		if filename == self.failing {
			return Err(std::io::Error::other("disk full").into());
		}

		self.inner.write(filename, text)
	}

	fn delete(&self, filename: &str) -> engine::error::Result<()> {
		self.inner.delete(filename)
	}
}

fn request(filename: &str, text: &str, expected: Option<i64>) -> SaveRequest {
	SaveRequest {
		filename: filename.to_string(),
		text: text.to_string(),
		expected_modified: expected,
	}
}

#[test]
fn saves_several_notes_with_one_call() {
	let repository = Repository::new();

	let outcomes = repository
		.engine
		.save_notes(
			"repo",
			&repository.sink,
			&[request("a.md", "a", None), request("b.md", "b", None)],
		)
		.unwrap();

	assert!(outcomes.iter().all(|o| matches!(o, SaveOutcome::Saved(_))));
	assert_eq!(repository.indexed(), ["a.md", "b.md"]);
}

#[test]
fn reports_a_conflict_without_blocking_the_other_notes_of_the_batch() {
	let repository = Repository::new();
	saved(repository.save("a.md", "a", None));

	let outcomes = repository
		.engine
		.save_notes(
			"repo",
			&repository.sink,
			&[request("a.md", "mine", Some(1)), request("b.md", "b", None)],
		)
		.unwrap();

	assert!(matches!(outcomes[0], SaveOutcome::Conflict { .. }));
	assert!(matches!(outcomes[1], SaveOutcome::Saved(_)));
	assert_eq!(
		fs::read_to_string(repository.notes().join("a.md")).unwrap(),
		"a"
	);
	assert_eq!(repository.indexed(), ["a.md", "b.md"]);
}

#[test]
fn reports_a_failed_write_and_still_indexes_the_rest() {
	let repository = Repository::new();
	let sink = FailingSink {
		inner: FsSink::new(repository.notes(), LocationScheme::android(URI_PREFIX)),
		failing: "bad.md",
	};

	let outcomes = repository
		.engine
		.save_notes(
			"repo",
			&sink,
			&[request("bad.md", "x", None), request("ok.md", "y", None)],
		)
		.unwrap();

	assert!(matches!(&outcomes[0], SaveOutcome::Failed(message) if message.contains("disk full")));
	assert!(matches!(outcomes[1], SaveOutcome::Saved(_)));
	assert_eq!(repository.indexed(), ["ok.md"]);
}
