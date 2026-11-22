use engine::engine::Engine;
use engine::error::{Error, Result};
use engine::model::{NoteInput, SourceFile};
use engine::search::{Node, SearchRequest, Sort};
use engine::source::NoteSource;
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use tempfile::TempDir;

const ROOT_FOLDER: &str = "root";
const STEP_SIZE: usize = 7;

struct MapSource {
	texts: HashMap<String, String>,
}

impl NoteSource for MapSource {
	fn scan(&self) -> Result<Vec<SourceFile>> {
		Ok(Vec::new())
	}

	fn read(&self, files: &[&SourceFile]) -> Result<Vec<Option<String>>> {
		Ok(files
			.iter()
			.map(|file| self.texts.get(&file.location).cloned())
			.collect())
	}
}

fn fixture() -> Value {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/search.json");

	serde_json::from_str(&fs::read_to_string(path).expect("search.json")).expect("valid json")
}

fn text(value: &Value) -> String {
	value.as_str().expect("string").to_string()
}

fn folder_id_of(folder: &str) -> String {
	if folder.is_empty() {
		ROOT_FOLDER.to_string()
	} else {
		folder.to_string()
	}
}

#[test]
fn finds_the_same_notes_as_the_reference_evaluator_through_the_index() {
	let fixture = fixture();
	let notes = fixture["notes"].as_array().expect("notes");
	let directory = TempDir::new().unwrap();
	let engine = Engine::new(directory.path().join("index.db"), "en").unwrap();

	let mut by_folder: HashMap<String, Vec<NoteInput>> = HashMap::new();
	let mut texts = HashMap::new();
	let mut path_of: HashMap<(String, String), String> = HashMap::new();
	let mut folder_paths = HashMap::new();

	for note in notes {
		let folder = note["folder"].as_str().unwrap_or_default().to_string();
		let folder_id = folder_id_of(&folder);
		let filename = text(&note["filename"]);
		let file = text(&note["file"]);
		let location = format!("file:///{folder_id}/{filename}");

		texts.insert(location.clone(), file.clone());
		path_of.insert((folder_id.clone(), filename.clone()), text(&note["path"]));
		folder_paths.insert(folder_id.clone(), folder);
		by_folder.entry(folder_id).or_default().push(NoteInput {
			filename,
			location,
			modified: 1,
			size: file.len() as i64,
			text: file,
		});
	}

	let folder_ids: Vec<String> = by_folder.keys().cloned().collect();

	for (folder_id, inputs) in by_folder {
		engine.write(&folder_id, inputs).unwrap();
	}

	let pinned_paths: HashSet<String> = fixture["pinned"]
		.as_array()
		.expect("pinned")
		.iter()
		.map(text)
		.collect();
	let pinned: HashSet<String> = path_of
		.iter()
		.filter(|(_, path)| pinned_paths.contains(*path))
		.map(|((folder_id, filename), _)| format!("{folder_id}::{filename}"))
		.collect();
	let source: Arc<dyn NoteSource> = Arc::new(MapSource { texts });
	let mut checked = 0;

	for case in fixture["cases"].as_array().expect("cases") {
		let query = text(&case["query"]);
		let node: Node = serde_json::from_value(case["ast"].clone()).expect("ast");
		let request = SearchRequest {
			query: node,
			sort: Sort::NameAsc,
			folder_ids: folder_ids.clone(),
			folder_paths: folder_paths.clone(),
			pinned: pinned.clone(),
			match_case: case["matchCase"].as_bool().expect("matchCase"),
		};

		let session = match engine.search(request, source.clone()) {
			Ok(session) => session,
			Err(Error::InvalidQuery(_)) => continue,
			Err(error) => panic!("{query}: {error}"),
		};

		let mut found: Vec<String> = Vec::new();

		loop {
			let step = session.step(STEP_SIZE).unwrap();

			found.extend(
				step.matches
					.iter()
					.map(|note| path_of[&(note.folder_id.clone(), note.filename.clone())].clone()),
			);

			if step.done {
				break;
			}
		}

		let mut expected: Vec<String> = case["expected"]
			.as_array()
			.expect("expected")
			.iter()
			.map(text)
			.collect();

		found.sort();
		expected.sort();

		assert_eq!(found, expected, "query {query}");
		checked += 1;
	}

	assert!(checked > 600, "only {checked} cases checked");
}

#[test]
fn stops_when_cancelled_and_reports_unsupported_regexes() {
	let directory = TempDir::new().unwrap();
	let engine = Engine::new(directory.path().join("index.db"), "en").unwrap();
	let source: Arc<dyn NoteSource> = Arc::new(MapSource {
		texts: HashMap::new(),
	});
	let request = |query: Node| SearchRequest {
		query,
		sort: Sort::NameAsc,
		folder_ids: vec![ROOT_FOLDER.to_string()],
		folder_paths: HashMap::new(),
		pinned: HashSet::new(),
		match_case: false,
	};

	let unsupported = Node::Regex {
		pattern: "(?<!x)y".to_string(),
	};
	assert!(matches!(
		engine.search(request(unsupported), source.clone()),
		Err(Error::InvalidQuery(_))
	));

	engine
		.write(
			ROOT_FOLDER,
			vec![NoteInput {
				filename: "a.md".to_string(),
				location: "file:///a.md".to_string(),
				modified: 1,
				size: 1,
				text: "a".to_string(),
			}],
		)
		.unwrap();

	let session = engine
		.search(
			request(Node::And {
				children: Vec::new(),
			}),
			source,
		)
		.unwrap();

	session.cancel();

	let step = session.step(10).unwrap();

	assert!(step.done);
	assert!(step.matches.is_empty());
}

struct CountingSource {
	text: String,
	reads: AtomicUsize,
}

impl NoteSource for CountingSource {
	fn scan(&self) -> Result<Vec<SourceFile>> {
		Ok(Vec::new())
	}

	fn read(&self, files: &[&SourceFile]) -> Result<Vec<Option<String>>> {
		self.reads.fetch_add(files.len(), Ordering::Relaxed);

		Ok(files.iter().map(|_| Some(self.text.clone())).collect())
	}
}

fn note_at(modified: i64) -> NoteInput {
	NoteInput {
		filename: "a.md".to_string(),
		location: "file:///a.md".to_string(),
		modified,
		size: 5,
		text: "hello".to_string(),
	}
}

#[test]
fn reuses_cached_bodies_until_the_file_changes() {
	let directory = TempDir::new().unwrap();
	let engine = Engine::new(directory.path().join("index.db"), "en").unwrap();
	let source = Arc::new(CountingSource {
		text: "hello".to_string(),
		reads: AtomicUsize::new(0),
	});
	let search = |source: &Arc<CountingSource>| {
		let request = SearchRequest {
			query: Node::Text {
				value: "hello".to_string(),
				phrase: false,
			},
			sort: Sort::NameAsc,
			folder_ids: vec![ROOT_FOLDER.to_string()],
			folder_paths: HashMap::new(),
			pinned: HashSet::new(),
			match_case: false,
		};
		let session = engine.search(request, source.clone()).unwrap();

		session.step(10).unwrap().matches.len()
	};

	engine.write(ROOT_FOLDER, vec![note_at(1)]).unwrap();

	assert_eq!(search(&source), 1);
	assert_eq!(search(&source), 1);
	assert_eq!(source.reads.load(Ordering::Relaxed), 1);

	engine.write(ROOT_FOLDER, vec![note_at(2)]).unwrap();

	assert_eq!(search(&source), 1);
	assert_eq!(source.reads.load(Ordering::Relaxed), 2);
}

#[test]
fn warming_fills_the_cache_before_the_first_search() {
	let directory = TempDir::new().unwrap();
	let engine = Engine::new(directory.path().join("index.db"), "en").unwrap();
	let source = Arc::new(CountingSource {
		text: "hello".to_string(),
		reads: AtomicUsize::new(0),
	});

	engine.write(ROOT_FOLDER, vec![note_at(1)]).unwrap();

	let warmup = engine
		.warm(&[ROOT_FOLDER.to_string()], source.clone())
		.unwrap();

	assert!(warmup.step(10).unwrap());
	assert_eq!(source.reads.load(Ordering::Relaxed), 1);

	let request = SearchRequest {
		query: Node::Text {
			value: "hello".to_string(),
			phrase: false,
		},
		sort: Sort::NameAsc,
		folder_ids: vec![ROOT_FOLDER.to_string()],
		folder_paths: HashMap::new(),
		pinned: HashSet::new(),
		match_case: false,
	};
	let session = engine.search(request, source.clone()).unwrap();

	assert_eq!(session.step(10).unwrap().matches.len(), 1);
	assert_eq!(source.reads.load(Ordering::Relaxed), 1);
}
