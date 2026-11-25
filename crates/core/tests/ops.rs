use engine::engine::Engine;
use engine::error::{Error, Result};
use engine::model::Value;
use engine::ops::{FolderRef, MoveOutcome, MoveRequest, Repository};
use engine::repository::{FsRepository, RepositoryFiles};
use engine::source::{FsSink, FsSource, LocationScheme};
use engine::versions::{NewVersion, RepositoryVersions};
use std::fs;
use std::io;
use std::sync::Arc;
use std::time::{Duration, UNIX_EPOCH};
use tempfile::TempDir;

const PREFIX: &str = "content://tree/document/root%2F";
const LOCALE: &str = "en";
const MAX_VERSIONS: usize = 200;
const TRASH: &str = ".trash";
const MODIFIED_SECONDS: u64 = 1_700_000_000;
const NON_EMPTY_STORE: &str = r#"{"entries":[{"id":"1"}]}"#;

struct Fixture {
	directory: TempDir,
	engine: Engine,
	ops: FsRepository,
	versions: RepositoryVersions,
}

struct BrokenVersions;

impl RepositoryFiles for BrokenVersions {
	fn read_text(&self, _path: &str) -> Result<Option<String>> {
		Ok(Some(NON_EMPTY_STORE.to_string()))
	}

	fn write_text(&self, _path: &str, _text: &str) -> Result<()> {
		Err(Error::Io(io::Error::other("write refused")))
	}

	fn delete_file(&self, _path: &str) -> Result<()> {
		Ok(())
	}

	fn list_files(&self, _directory: &str) -> Result<Vec<String>> {
		Err(Error::Io(io::Error::other("list refused")))
	}
}

impl Fixture {
	fn new() -> Self {
		let directory = TempDir::new().unwrap();

		for folder in ["Folder", "Folder/Sub", "Other", ".notes"] {
			fs::create_dir_all(directory.path().join(folder)).unwrap();
		}

		let root = directory.path().to_path_buf();

		Self {
			engine: Engine::new(root.join("index.db"), LOCALE).unwrap(),
			ops: FsRepository::new(&root),
			versions: RepositoryVersions::new(Arc::new(FsRepository::new(&root))),
			directory,
		}
	}

	fn repository(&self) -> Repository<'_> {
		Repository {
			ops: &self.ops,
			versions: &self.versions,
		}
	}

	fn write(&self, path: &str, text: &str) {
		fs::write(self.directory.path().join(path), text).unwrap();

		let file = fs::File::options()
			.write(true)
			.open(self.directory.path().join(path))
			.unwrap();

		file.set_modified(UNIX_EPOCH + Duration::from_secs(MODIFIED_SECONDS))
			.unwrap();
	}

	fn sync(&self, folder_id: &str, path: &str) {
		let source = FsSource::new(
			self.directory.path().join(path),
			LocationScheme::android(PREFIX),
		);

		self.engine.sync(folder_id, &source, &|_, _| {}).unwrap();
	}

	fn sink(&self, path: &str) -> FsSink {
		FsSink::new(
			self.directory.path().join(path),
			LocationScheme::android(PREFIX),
		)
	}

	fn commit_version(&self, key: &str) {
		self.versions
			.commit(
				key,
				&NewVersion {
					id: "v1",
					title: "Title",
					created_at: 1_000,
					content: "text\n",
					max_versions: MAX_VERSIONS,
					max_age_ms: 0,
				},
			)
			.unwrap();
	}

	fn has_versions(&self, key: &str) -> bool {
		self.versions.read(key).unwrap().is_some()
	}

	fn indexed(&self) -> Vec<String> {
		self.engine
			.query(
				"SELECT folder_id || '/' || filename FROM notes ORDER BY 1",
				&[],
			)
			.unwrap()
			.rows
			.into_iter()
			.map(|row| match &row[0] {
				Value::Text(text) => text.clone(),
				other => panic!("unexpected {other:?}"),
			})
			.collect()
	}

	fn exists(&self, path: &str) -> bool {
		self.directory.path().join(path).exists()
	}

	fn read(&self, path: &str) -> String {
		fs::read_to_string(self.directory.path().join(path)).unwrap()
	}

	fn modified(&self, path: &str) -> std::time::SystemTime {
		fs::metadata(self.directory.path().join(path))
			.unwrap()
			.modified()
			.unwrap()
	}
}

fn ids(ids: &[&str]) -> Vec<String> {
	ids.iter().map(ToString::to_string).collect()
}

fn populated() -> Fixture {
	let fixture = Fixture::new();

	fixture.write("Folder/a.md", "# A\n");
	fixture.write("Folder/Sub/b.md", "# B\n");
	fixture.write("Other/c.md", "# C\n");
	fixture.sync("f", "Folder");
	fixture.sync("s", "Folder/Sub");
	fixture.sync("o", "Other");
	fixture.commit_version("Folder/a.md");
	fixture.commit_version("Folder/Sub/b.md");

	fixture
}

#[test]
fn renaming_a_folder_moves_it_clears_its_index_rows_and_renames_its_versions() {
	let fixture = populated();

	let new_path = fixture
		.engine
		.rename_folder(
			&fixture.repository(),
			"Folder",
			"Renamed",
			&ids(&["f", "s"]),
		)
		.unwrap();

	assert_eq!(new_path, "Renamed");
	assert!(fixture.exists("Renamed/a.md"));
	assert!(fixture.exists("Renamed/Sub/b.md"));
	assert!(!fixture.exists("Folder"));
	assert_eq!(fixture.indexed(), ["o/c.md"]);
	assert!(fixture.has_versions("Renamed/a.md"));
	assert!(fixture.has_versions("Renamed/Sub/b.md"));
	assert!(!fixture.has_versions("Folder/a.md"));
	assert!(!fixture.has_versions("Folder/Sub/b.md"));
}

#[test]
fn renaming_a_nested_folder_keeps_the_parent_in_the_new_path() {
	let fixture = populated();

	let new_path = fixture
		.engine
		.rename_folder(&fixture.repository(), "Folder/Sub", "Inner", &ids(&["s"]))
		.unwrap();

	assert_eq!(new_path, "Folder/Inner");
	assert!(fixture.has_versions("Folder/Inner/b.md"));
	assert!(fixture.has_versions("Folder/a.md"));
	assert_eq!(fixture.indexed(), ["f/a.md", "o/c.md"]);
}

#[test]
fn renaming_onto_an_existing_folder_changes_nothing() {
	let fixture = populated();

	let result =
		fixture
			.engine
			.rename_folder(&fixture.repository(), "Folder", "Other", &ids(&["f", "s"]));

	assert!(matches!(result, Err(Error::AlreadyExists(_))));
	assert!(fixture.exists("Folder/a.md"));
	assert_eq!(fixture.indexed(), ["f/a.md", "o/c.md", "s/b.md"]);
	assert!(fixture.has_versions("Folder/a.md"));
}

#[test]
fn renaming_with_a_path_like_name_is_rejected_before_touching_anything() {
	let fixture = populated();

	let result = fixture
		.engine
		.rename_folder(&fixture.repository(), "Folder", "a/b", &ids(&["f"]));

	assert!(matches!(result, Err(Error::InvalidName(_))));
	assert!(fixture.exists("Folder/a.md"));
	assert_eq!(fixture.indexed().len(), 3);
}

#[test]
fn a_failing_versions_store_rolls_the_folder_rename_back() {
	let fixture = populated();
	let broken = RepositoryVersions::new(Arc::new(BrokenVersions));
	let ops = FsRepository::new(fixture.directory.path());
	let repository = Repository {
		ops: &ops,
		versions: &broken,
	};

	let result = fixture
		.engine
		.rename_folder(&repository, "Folder", "Renamed", &ids(&["f", "s"]));

	assert!(result.is_err());
	assert!(fixture.exists("Folder/a.md"));
	assert!(!fixture.exists("Renamed"));
}

#[test]
fn removing_a_folder_clears_rows_directory_and_versions() {
	let fixture = populated();

	fixture
		.engine
		.remove_folder(&fixture.repository(), "Folder", &ids(&["f", "s"]), true)
		.unwrap();

	assert!(!fixture.exists("Folder"));
	assert_eq!(fixture.indexed(), ["o/c.md"]);
	assert!(!fixture.has_versions("Folder/a.md"));
	assert!(!fixture.has_versions("Folder/Sub/b.md"));
}

#[test]
fn removing_a_folder_can_keep_its_versions() {
	let fixture = populated();

	fixture
		.engine
		.remove_folder(&fixture.repository(), "Folder/Sub", &ids(&["s"]), false)
		.unwrap();

	assert!(!fixture.exists("Folder/Sub"));
	assert!(fixture.has_versions("Folder/Sub/b.md"));
}

#[test]
fn trashing_a_note_moves_it_keeping_its_time_and_versions_and_drops_its_index_row() {
	let fixture = populated();
	let before = fixture.modified("Folder/a.md");

	let name = fixture
		.engine
		.trash_note(&fixture.repository(), "f", "Folder", "a.md", TRASH)
		.unwrap();

	assert_eq!(name, "a.md");
	assert!(!fixture.exists("Folder/a.md"));
	assert_eq!(fixture.read(".trash/a.md"), "# A\n");
	assert_eq!(fixture.modified(".trash/a.md"), before);
	assert_eq!(fixture.indexed(), ["o/c.md", "s/b.md"]);
	assert!(fixture.has_versions("Folder/a.md"));
}

#[test]
fn trashing_a_second_note_with_the_same_name_picks_a_free_name() {
	let fixture = populated();

	fixture.write("Other/a.md", "# other\n");
	fixture
		.engine
		.trash_note(&fixture.repository(), "f", "Folder", "a.md", TRASH)
		.unwrap();

	let name = fixture
		.engine
		.trash_note(&fixture.repository(), "o", "Other", "a.md", TRASH)
		.unwrap();

	assert_eq!(name, "a (2).md");
	assert_eq!(fixture.read(".trash/a.md"), "# A\n");
	assert_eq!(fixture.read(".trash/a (2).md"), "# other\n");
}

#[test]
fn trashing_a_missing_note_fails_without_side_effects() {
	let fixture = populated();

	let result = fixture
		.engine
		.trash_note(&fixture.repository(), "f", "Folder", "ghost.md", TRASH);

	assert!(matches!(result, Err(Error::Io(_))));
	assert_eq!(fixture.indexed().len(), 3);
	assert!(fixture.has_versions("Folder/a.md"));
}

#[test]
fn moving_a_note_updates_files_versions_and_both_index_folders() {
	let fixture = populated();
	let before = fixture.modified("Folder/a.md");

	let outcome = fixture
		.engine
		.move_note(
			&fixture.repository(),
			&MoveRequest {
				filename: "a.md",
				from: FolderRef {
					id: "f",
					path: "Folder",
				},
				to: FolderRef {
					id: "o",
					path: "Other",
				},
			},
			&fixture.sink("Other"),
		)
		.unwrap();

	let MoveOutcome::Moved(stamp) = outcome else {
		panic!("the note must move");
	};

	assert_eq!(stamp.location, format!("{PREFIX}a.md"));
	assert!(!fixture.exists("Folder/a.md"));
	assert_eq!(fixture.read("Other/a.md"), "# A\n");
	assert_eq!(fixture.modified("Other/a.md"), before);
	assert_eq!(fixture.indexed(), ["o/a.md", "o/c.md", "s/b.md"]);
	assert!(fixture.has_versions("Other/a.md"));
	assert!(!fixture.has_versions("Folder/a.md"));
}

#[test]
fn moving_onto_an_existing_note_changes_nothing() {
	let fixture = populated();

	fixture.write("Other/a.md", "# theirs\n");

	let outcome = fixture
		.engine
		.move_note(
			&fixture.repository(),
			&MoveRequest {
				filename: "a.md",
				from: FolderRef {
					id: "f",
					path: "Folder",
				},
				to: FolderRef {
					id: "o",
					path: "Other",
				},
			},
			&fixture.sink("Other"),
		)
		.unwrap();

	assert_eq!(outcome, MoveOutcome::TargetExists);
	assert_eq!(fixture.read("Folder/a.md"), "# A\n");
	assert_eq!(fixture.read("Other/a.md"), "# theirs\n");
	assert!(fixture.has_versions("Folder/a.md"));
}

#[test]
fn moving_a_missing_note_reports_it() {
	let fixture = populated();

	let outcome = fixture
		.engine
		.move_note(
			&fixture.repository(),
			&MoveRequest {
				filename: "ghost.md",
				from: FolderRef {
					id: "f",
					path: "Folder",
				},
				to: FolderRef {
					id: "o",
					path: "Other",
				},
			},
			&fixture.sink("Other"),
		)
		.unwrap();

	assert_eq!(outcome, MoveOutcome::SourceMissing);
}

#[test]
fn a_failing_versions_store_puts_the_moved_note_back() {
	let fixture = populated();
	let broken = RepositoryVersions::new(Arc::new(BrokenVersions));
	let ops = FsRepository::new(fixture.directory.path());
	let repository = Repository {
		ops: &ops,
		versions: &broken,
	};

	let result = fixture.engine.move_note(
		&repository,
		&MoveRequest {
			filename: "a.md",
			from: FolderRef {
				id: "f",
				path: "Folder",
			},
			to: FolderRef {
				id: "o",
				path: "Other",
			},
		},
		&fixture.sink("Other"),
	);

	assert!(result.is_err());
	assert!(fixture.exists("Folder/a.md"));
	assert!(!fixture.exists("Other/a.md"));
	assert_eq!(fixture.indexed(), ["f/a.md", "o/c.md", "s/b.md"]);
}

#[test]
fn renaming_to_a_name_that_differs_only_in_case_from_a_sibling_is_refused() {
	let fixture = populated();

	let result =
		fixture
			.engine
			.rename_folder(&fixture.repository(), "Folder", "other", &ids(&["f", "s"]));

	assert!(matches!(result, Err(Error::AlreadyExists(_))));
	assert!(fixture.exists("Folder/a.md"));
	assert_eq!(fixture.indexed(), ["f/a.md", "o/c.md", "s/b.md"]);
}

#[test]
fn renaming_to_a_different_case_of_the_same_folder_is_allowed() {
	let fixture = populated();

	let new_path = fixture
		.engine
		.rename_folder(&fixture.repository(), "Folder", "FOLDER", &ids(&["f", "s"]))
		.unwrap();

	assert_eq!(new_path, "FOLDER");
	assert!(fixture.exists("FOLDER/a.md"));
}

#[test]
fn moving_onto_a_note_that_differs_only_in_case_is_refused() {
	let fixture = populated();

	fixture.write("Other/A.MD", "# theirs\n");

	let outcome = fixture
		.engine
		.move_note(
			&fixture.repository(),
			&MoveRequest {
				filename: "a.md",
				from: FolderRef {
					id: "f",
					path: "Folder",
				},
				to: FolderRef {
					id: "o",
					path: "Other",
				},
			},
			&fixture.sink("Other"),
		)
		.unwrap();

	assert_eq!(outcome, MoveOutcome::TargetExists);
	assert_eq!(fixture.read("Folder/a.md"), "# A\n");
}

#[test]
fn trashing_picks_a_free_name_even_when_the_trash_has_the_same_name_in_another_case() {
	let fixture = populated();

	fixture.write("Other/A.md", "# upper\n");
	fixture
		.engine
		.trash_note(&fixture.repository(), "o", "Other", "A.md", TRASH)
		.unwrap();

	let name = fixture
		.engine
		.trash_note(&fixture.repository(), "f", "Folder", "a.md", TRASH)
		.unwrap();

	assert_eq!(name, "a (2).md");
}
