use engine::engine::Engine;
use engine::error::{Error, Result as EngineResult};
use engine::model::{FileStamp, SaveOutcome, SaveRequest, Value};
use engine::repository::{FsRepository, RepositoryFiles};
use engine::source::{FsSink, FsSource, LocationScheme, NoteSink};
use engine::versions::{HistoryMove, RepositoryVersions};
use std::fs;
use std::sync::Arc;
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
		.rename_note("repo", &repository.sink, "old.md", "new.md", "body", None)
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
		.rename_note("repo", &repository.sink, "a.md", "b.md", "a", None)
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

const COARSE_MILLIS: i64 = 2_000;

struct CoarseClockSink {
	inner: FsSink,
}

impl CoarseClockSink {
	fn coarse(mut stamp: FileStamp) -> FileStamp {
		stamp.modified -= stamp.modified % COARSE_MILLIS;

		stamp
	}
}

impl NoteSink for CoarseClockSink {
	fn stat(&self, filename: &str) -> EngineResult<Option<FileStamp>> {
		Ok(self.inner.stat(filename)?.map(Self::coarse))
	}

	fn write(&self, filename: &str, text: &str) -> EngineResult<FileStamp> {
		Ok(Self::coarse(self.inner.write(filename, text)?))
	}

	fn delete(&self, filename: &str) -> EngineResult<()> {
		self.inner.delete(filename)
	}
}

#[test]
fn saving_with_the_returned_stamp_never_conflicts_on_a_coarse_clock() {
	let repository = Repository::new();
	let sink = CoarseClockSink {
		inner: FsSink::new(repository.notes(), LocationScheme::android(URI_PREFIX)),
	};

	let first = repository
		.engine
		.save_note("repo", &sink, "a.md", "one", None)
		.unwrap();
	let SaveOutcome::Saved(stamp) = first else {
		panic!("the first save must succeed");
	};

	for round in 0..5 {
		let outcome = repository
			.engine
			.save_note(
				"repo",
				&sink,
				"a.md",
				&format!("round {round}"),
				Some(stamp.modified),
			)
			.unwrap();

		assert!(matches!(outcome, SaveOutcome::Saved(_)), "round {round}");
	}
}

const HISTORY_MAX: usize = 200;

fn history_of(repository: &Repository) -> RepositoryVersions {
	std::fs::create_dir_all(repository.directory.path().join(".notes")).unwrap();

	RepositoryVersions::new(Arc::new(FsRepository::new(repository.directory.path())))
}

fn commit(versions: &RepositoryVersions, key: &str, content: &str) {
	versions
		.commit(key, "title", content, content, 1, HISTORY_MAX, 0)
		.unwrap();
}

fn rename_with_history(
	repository: &Repository,
	versions: &RepositoryVersions,
	from: &str,
	to: &str,
) -> engine::error::Result<SaveOutcome> {
	repository.engine.rename_note(
		"repo",
		&repository.sink,
		from,
		to,
		"body",
		Some(&HistoryMove {
			versions,
			from_key: from,
			to_key: to,
		}),
	)
}

#[test]
fn renaming_a_note_moves_its_history_to_the_new_name() {
	let repository = Repository::new();
	let versions = history_of(&repository);
	saved(repository.save("old.md", "body", None));
	commit(&versions, "old.md", "first");

	rename_with_history(&repository, &versions, "old.md", "new.md").unwrap();

	assert!(versions.read("old.md").unwrap().is_none());
	assert!(versions.read("new.md").unwrap().is_some());
}

#[test]
fn renaming_replaces_a_history_that_was_left_under_the_new_name() {
	let repository = Repository::new();
	let versions = history_of(&repository);
	saved(repository.save("old.md", "body", None));
	commit(&versions, "old.md", "moving");
	commit(&versions, "new.md", "stale");

	rename_with_history(&repository, &versions, "old.md", "new.md").unwrap();

	let stored = versions.read("new.md").unwrap().unwrap();

	assert!(stored.contains("moving"));
	assert!(!stored.contains("stale"));
}

#[test]
fn renaming_a_note_without_history_clears_a_stale_one_under_the_new_name() {
	let repository = Repository::new();
	let versions = history_of(&repository);
	saved(repository.save("old.md", "body", None));
	commit(&versions, "new.md", "stale");

	rename_with_history(&repository, &versions, "old.md", "new.md").unwrap();

	assert!(versions.read("new.md").unwrap().is_none());
}

#[test]
fn renaming_onto_an_existing_note_keeps_both_histories() {
	let repository = Repository::new();
	let versions = history_of(&repository);
	saved(repository.save("a.md", "a", None));
	saved(repository.save("b.md", "b", None));
	commit(&versions, "a.md", "from a");
	commit(&versions, "b.md", "from b");

	let outcome = rename_with_history(&repository, &versions, "a.md", "b.md").unwrap();

	assert!(matches!(outcome, SaveOutcome::Conflict { .. }));
	assert!(versions.read("a.md").unwrap().unwrap().contains("from a"));
	assert!(versions.read("b.md").unwrap().unwrap().contains("from b"));
}

struct RefusingHistory;

impl RepositoryFiles for RefusingHistory {
	fn read_text(&self, _path: &str) -> EngineResult<Option<String>> {
		Ok(Some(r#"{"entries":[{"id":"1"}]}"#.to_string()))
	}

	fn write_text(&self, _path: &str, _text: &str) -> EngineResult<()> {
		Err(Error::Io(std::io::Error::other("write refused")))
	}

	fn delete_file(&self, _path: &str) -> EngineResult<()> {
		Ok(())
	}

	fn list_files(&self, _directory: &str) -> EngineResult<Vec<String>> {
		Ok(Vec::new())
	}
}

#[test]
fn a_failed_history_move_leaves_the_original_note_untouched() {
	let repository = Repository::new();
	let refusing = RepositoryVersions::new(Arc::new(RefusingHistory));
	saved(repository.save("old.md", "body", None));

	let result = rename_with_history(&repository, &refusing, "old.md", "new.md");

	assert!(result.is_err());
	assert!(repository.notes().join("old.md").exists());
	assert!(!repository.notes().join("new.md").exists());
	assert_eq!(repository.indexed(), ["old.md"]);
}
