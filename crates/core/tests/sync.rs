use engine::engine::Engine;
use engine::error::{Error, Result};
use engine::model::{SourceFile, Value};
use engine::source::{FsSource, LocationScheme, NoteSource};
use std::collections::BTreeMap;
use std::fs;
use std::io;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU32, Ordering};
use tempfile::TempDir;

const URI_PREFIX: &str = "content://tree/document/root%2F";

#[derive(Default)]
struct MemorySource {
	notes: Mutex<BTreeMap<String, (i64, Option<String>)>>,
	fail_reads: bool,
}

impl MemorySource {
	fn with(notes: &[(&str, i64, &str)]) -> Self {
		let source = Self::default();

		for (filename, modified, text) in notes {
			source.put(filename, *modified, Some(text));
		}

		source
	}

	fn put(&self, filename: &str, modified: i64, text: Option<&str>) {
		self.notes
			.lock()
			.unwrap()
			.insert(filename.to_string(), (modified, text.map(String::from)));
	}

	fn drop_note(&self, filename: &str) {
		self.notes.lock().unwrap().remove(filename);
	}
}

impl NoteSource for MemorySource {
	fn scan(&self) -> Result<Vec<SourceFile>> {
		Ok(self
			.notes
			.lock()
			.unwrap()
			.iter()
			.map(|(filename, (modified, text))| SourceFile {
				location: format!("{URI_PREFIX}{filename}"),
				filename: filename.clone(),
				modified: *modified,
				size: text.as_ref().map_or(0, |text| text.len() as i64),
			})
			.collect())
	}

	fn read(&self, files: &[&SourceFile]) -> Result<Vec<Option<String>>> {
		if self.fail_reads {
			return Err(Error::Io(io::Error::other("storage went away")));
		}

		let notes = self.notes.lock().unwrap();

		Ok(files
			.iter()
			.map(|file| notes[&file.filename].1.clone())
			.collect())
	}
}

fn engine(directory: &TempDir) -> Engine {
	Engine::new(directory.path().join("index.db"), "en").unwrap()
}

fn sync(engine: &Engine, source: &dyn NoteSource) -> engine::model::SyncStats {
	engine.sync("repo", source, &|_, _| {}).unwrap()
}

fn titles(engine: &Engine) -> Vec<String> {
	engine
		.query("SELECT title FROM notes ORDER BY sort_key", &[])
		.unwrap()
		.rows
		.into_iter()
		.map(|row| match &row[0] {
			Value::Text(title) => title.clone(),
			other => panic!("unexpected {other:?}"),
		})
		.collect()
}

#[test]
fn indexes_every_note_from_the_source() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory);
	let source = MemorySource::with(&[("b.md", 1, "# b"), ("a.md", 1, "# a")]);

	let stats = sync(&engine, &source);

	assert_eq!((stats.total, stats.added, stats.unchanged), (2, 2, 0));
	assert_eq!(titles(&engine), ["a", "b"]);
}

#[test]
fn skips_notes_that_did_not_change() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory);
	let source = MemorySource::with(&[("a.md", 1, "# a")]);

	sync(&engine, &source);
	let stats = sync(&engine, &source);

	assert_eq!((stats.added, stats.updated, stats.unchanged), (0, 0, 1));
	assert_eq!(stats.read_ms + stats.parse_ms + stats.write_ms, 0);
}

#[test]
fn reindexes_modified_notes_and_removes_deleted_ones() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory);
	let source = MemorySource::with(&[("a.md", 1, "a"), ("b.md", 1, "b")]);

	sync(&engine, &source);
	source.put("a.md", 2, Some("#tag a"));
	source.drop_note("b.md");

	let stats = sync(&engine, &source);

	assert_eq!((stats.updated, stats.removed, stats.unchanged), (1, 1, 0));
	assert_eq!(titles(&engine), ["a"]);
}

#[test]
fn counts_unreadable_notes_without_failing() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory);
	let source = MemorySource::with(&[("a.md", 1, "a")]);
	source.put("locked.md", 1, None);

	let stats = sync(&engine, &source);

	assert_eq!((stats.added, stats.unreadable), (2, 1));
	assert_eq!(titles(&engine), ["a"]);
}

#[test]
fn propagates_a_read_failure() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory);
	let source = MemorySource {
		fail_reads: true,
		..MemorySource::with(&[("a.md", 1, "a")])
	};

	let error = engine.sync("repo", &source, &|_, _| {}).unwrap_err();

	assert!(matches!(error, Error::Io(_)));
}

#[test]
fn reports_progress_across_batches() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory);
	let source = MemorySource::default();

	for number in 0..1200 {
		source.put(&format!("note-{number:04}.md"), 1, Some("text"));
	}

	let last = AtomicU32::new(0);
	let calls = AtomicU32::new(0);

	let stats = engine
		.sync("repo", &source, &|done, total| {
			assert_eq!(total, 1200);
			assert!(done >= last.swap(done, Ordering::SeqCst));
			calls.fetch_add(1, Ordering::SeqCst);
		})
		.unwrap();

	assert_eq!(stats.added, 1200);
	assert_eq!(last.load(Ordering::SeqCst), 1200);
	assert_eq!(calls.load(Ordering::SeqCst), 4);
}

#[test]
fn lists_only_visible_notes_of_a_directory() {
	let directory = TempDir::new().unwrap();
	fs::write(directory.path().join("Stress 1.md"), "# one").unwrap();
	fs::write(directory.path().join("Upper.MD"), "# upper").unwrap();
	fs::write(directory.path().join(".hidden.md"), "# hidden").unwrap();
	fs::write(directory.path().join("image.png"), "png").unwrap();
	fs::create_dir(directory.path().join("folder.md")).unwrap();

	let mut files = FsSource::new(directory.path(), LocationScheme::android(URI_PREFIX))
		.scan()
		.unwrap();
	files.sort_by(|left, right| left.filename.cmp(&right.filename));

	let names: Vec<_> = files.iter().map(|file| file.filename.as_str()).collect();

	assert_eq!(names, ["Stress 1.md", "Upper.MD"]);
	assert_eq!(files[0].location, format!("{URI_PREFIX}Stress%201.md"));
	assert_eq!(files[0].size, 5);
	assert!(files[0].modified > 0);
}

#[test]
fn encodes_file_names_like_the_platform_uri_builder() {
	let directory = TempDir::new().unwrap();
	fs::write(directory.path().join("Año (1) #2.md"), "x").unwrap();

	let files = FsSource::new(directory.path(), LocationScheme::android(URI_PREFIX))
		.scan()
		.unwrap();

	assert_eq!(
		files[0].location,
		format!("{URI_PREFIX}A%C3%B1o%20(1)%20%232.md")
	);
}

#[test]
fn reads_files_replacing_invalid_utf8_and_missing_ones() {
	let directory = TempDir::new().unwrap();
	fs::write(directory.path().join("a.md"), b"caf\xff").unwrap();
	let source = FsSource::new(directory.path(), LocationScheme::android(URI_PREFIX));
	let present = SourceFile {
		location: String::new(),
		filename: "a.md".to_string(),
		modified: 0,
		size: 0,
	};
	let missing = SourceFile {
		filename: "gone.md".to_string(),
		..present.clone()
	};

	let texts = source.read(&[&present, &missing]).unwrap();

	assert_eq!(texts, [Some("caf\u{fffd}".to_string()), None]);
}

#[test]
fn indexes_a_directory_end_to_end() {
	let directory = TempDir::new().unwrap();
	let repository = directory.path().join("repository");
	fs::create_dir(&repository).unwrap();
	fs::write(repository.join("a.md"), "# a [[b]]").unwrap();
	fs::write(repository.join("b.md"), "#tag b").unwrap();
	let engine = Engine::new(directory.path().join("index.db"), "en").unwrap();

	let stats = sync(
		&engine,
		&FsSource::new(&repository, LocationScheme::android(URI_PREFIX)),
	);

	assert_eq!((stats.added, stats.unreadable), (2, 0));
	assert_eq!(titles(&engine), ["a", "b"]);
}
