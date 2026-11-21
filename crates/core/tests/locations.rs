use engine::engine::Engine;
use engine::model::{SaveOutcome, Value};
use engine::source::{FsSink, FsSource, LocationScheme, NoteSink, NoteSource};
use serde_json::Value as Json;
use std::fs;
use tempfile::TempDir;

const PREFIX: &str = "content://tree/document/root%2F";
const FOLDER: &str = "repo";
const LOCALE: &str = "en";

struct Repository {
	directory: TempDir,
	engine: Engine,
}

impl Repository {
	fn new(names: &[&str]) -> Self {
		let directory = TempDir::new().unwrap();

		fs::create_dir(directory.path().join("notes")).unwrap();

		for name in names {
			fs::write(directory.path().join("notes").join(name), "# Title\n").unwrap();
		}

		Self {
			engine: Engine::new(directory.path().join("index.db"), LOCALE).unwrap(),
			directory,
		}
	}

	fn notes(&self) -> std::path::PathBuf {
		self.directory.path().join("notes")
	}

	fn sync(&self, scheme: LocationScheme) {
		let source = FsSource::new(self.notes(), scheme);

		self.engine.sync(FOLDER, &source, &|_, _| {}).unwrap();
	}

	fn indexed_locations(&self) -> Vec<String> {
		self.engine
			.query("SELECT location FROM notes ORDER BY filename", &[])
			.unwrap()
			.rows
			.into_iter()
			.map(|row| match &row[0] {
				Value::Text(text) => text.clone(),
				other => panic!("unexpected {other:?}"),
			})
			.collect()
	}
}

#[test]
fn android_locations_percent_encode_the_filename_after_the_prefix() {
	let repository = Repository::new(&[
		"plain.md",
		"with space.md",
		"hash#tag.md",
		"100%.md",
		"é日本.md",
	]);
	let mut files = FsSource::new(repository.notes(), LocationScheme::android(PREFIX))
		.scan()
		.unwrap();

	files.sort_by(|a, b| a.filename.cmp(&b.filename));

	let locations: Vec<&str> = files.iter().map(|file| file.location.as_str()).collect();

	assert_eq!(
		locations,
		[
			"content://tree/document/root%2F100%25.md",
			"content://tree/document/root%2Fhash%23tag.md",
			"content://tree/document/root%2Fplain.md",
			"content://tree/document/root%2Fwith%20space.md",
			"content://tree/document/root%2F%C3%A9%E6%97%A5%E6%9C%AC.md",
		]
	);
}

#[test]
fn file_path_locations_are_the_paths_of_the_files() {
	let repository = Repository::new(&["plain.md", "with space.md", "é日本.md"]);
	let mut files = FsSource::new(repository.notes(), LocationScheme::FilePath)
		.scan()
		.unwrap();

	files.sort_by(|a, b| a.filename.cmp(&b.filename));

	for file in &files {
		assert_eq!(
			file.location,
			repository.notes().join(&file.filename).to_string_lossy()
		);
	}

	assert_eq!(files.len(), 3);
}

#[test]
fn the_index_stores_whichever_location_the_scheme_produces() {
	let android = Repository::new(&["a b.md"]);
	let path = Repository::new(&["a b.md"]);

	android.sync(LocationScheme::android(PREFIX));
	path.sync(LocationScheme::FilePath);

	assert_eq!(
		android.indexed_locations(),
		["content://tree/document/root%2Fa%20b.md"]
	);
	assert_eq!(
		path.indexed_locations(),
		[path.notes().join("a b.md").to_string_lossy().into_owned()]
	);
}

#[test]
fn the_listing_exposes_the_location_under_the_file_uri_key() {
	let repository = Repository::new(&["note.md"]);

	repository.sync(LocationScheme::FilePath);

	let listing: Json =
		serde_json::from_str(&repository.engine.list_notes(&[FOLDER.to_string()]).unwrap())
			.unwrap();

	assert_eq!(
		listing[0]["fileUri"],
		Json::String(
			repository
				.notes()
				.join("note.md")
				.to_string_lossy()
				.into_owned()
		)
	);
}

#[test]
fn notes_have_the_same_metadata_under_both_schemes() {
	let android = Repository::new(&["note.md"]);
	let path = Repository::new(&["note.md"]);

	android.sync(LocationScheme::android(PREFIX));
	path.sync(LocationScheme::FilePath);

	let query = "SELECT filename, title, sort_key, size, invalid_frontmatter FROM notes";

	assert_eq!(
		android.engine.query(query, &[]).unwrap(),
		path.engine.query(query, &[]).unwrap()
	);
}

#[test]
fn saving_under_the_file_path_scheme_stamps_and_indexes_the_path() {
	let repository = Repository::new(&[]);
	let sink = FsSink::new(repository.notes(), LocationScheme::FilePath);
	let outcome = repository
		.engine
		.save_note(FOLDER, &sink, "new.md", "# New\n", None)
		.unwrap();
	let expected = repository
		.notes()
		.join("new.md")
		.to_string_lossy()
		.into_owned();

	match outcome {
		SaveOutcome::Saved(stamp) => assert_eq!(stamp.location, expected),
		other => panic!("unexpected {other:?}"),
	}

	assert_eq!(sink.stat("new.md").unwrap().unwrap().location, expected);
	assert_eq!(repository.indexed_locations(), [expected]);
}

#[test]
fn scanning_returns_the_files_sorted_by_name_whatever_the_directory_order() {
	let vault = Repository::new(&["zeta.md", "Alpha.md", "mid.md", "Beta.md"]);
	let files = FsSource::new(vault.notes(), LocationScheme::FilePath)
		.scan()
		.unwrap();
	let names: Vec<&str> = files.iter().map(|file| file.filename.as_str()).collect();

	assert_eq!(names, ["Alpha.md", "Beta.md", "mid.md", "zeta.md"]);
}
