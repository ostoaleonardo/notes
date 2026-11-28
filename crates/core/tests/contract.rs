use engine::engine::Engine;
use engine::links::{
	Candidate, FolderPathByNote, LinkNote, NoteIndex, find_backlinks, rename_links,
};
use engine::model::{QueryResult, SaveOutcome, SyncStats, Value};
use engine::repository::FsRepository;
use engine::source::{FsSink, FsSource, LocationScheme};
use engine::syntax::{
	NoteFields, compose, decompose, inline_tags, normalize, parse_note, wiki_links,
};
use engine::versions::{NewVersion, RepositoryVersions, build_line_delta};
use serde_json::{Map, Value as Json, json};
use std::fs::{self, File};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{Duration, UNIX_EPOCH};
use tempfile::TempDir;

const URI_PREFIX: &str = "content://tree/document/root%2F";
const SNAPSHOT: &str = "tests/fixtures/contract.json";
const UPDATE_VARIABLE: &str = "CONTRACT_UPDATE";
const ROOT_FOLDER: &str = "root";
const SUB_FOLDER: &str = "sub";
const LOCALE: &str = "en";
const BASE_SECONDS: u64 = 1_700_000_000;
const MAX_VERSIONS: usize = 200;

fn version<'a>(id: &'a str, content: &'a str, created_at: i64) -> NewVersion<'a> {
	NewVersion {
		id,
		title: "Alpha",
		created_at,
		content,
		max_versions: MAX_VERSIONS,
		max_age_ms: 0,
	}
}

const ALPHA: &str = "---\ntags:\n  - project\n  - area/work\naliases:\n  - A\nstatus: draft\npriority: 2\n---\n\nIntro with #inline and a [[Beta]] link,\na [[Beta|aliased]] one, a [[Gamma#Heading]] anchor,\nan embed ![[Beta]] and a [markdown](Beta.md) link.\n\n```\n#not-a-tag [[Not a link]]\n```\n";
const BETA: &str = "Back to [[Alpha]].\n";
const GAMMA: &str = "# Heading\n\nMentions alpha without linking it.\n";
const UNICODE: &str = "---\ntags: [é, 日本]\n---\n\nUnicode título [[Beta]]\n";
const INVALID: &str = "---\ntags: [unclosed\n---\n\nBroken frontmatter\n";
const SUB_ALPHA: &str = "Duplicate title in a sub folder with [[Beta]].\n";
const SUB_DELTA: &str = "Delta links to [[Alpha]] and [[sub/Alpha]].\n";

const ROOT_NOTES: [(&str, &str); 6] = [
	("Alpha.md", ALPHA),
	("Beta.md", BETA),
	("Gamma.md", GAMMA),
	("Ünïcode título.md", UNICODE),
	("Invalid fm.md", INVALID),
	("Empty.md", ""),
];

const SUB_NOTES: [(&str, &str); 2] = [("Alpha.md", SUB_ALPHA), ("Delta.md", SUB_DELTA)];

struct Repository {
	directory: TempDir,
	engine: Engine,
}

impl Repository {
	fn new() -> Self {
		let directory = TempDir::new().unwrap();

		for (folder, notes) in [("notes", &ROOT_NOTES[..]), ("sub", &SUB_NOTES[..])] {
			fs::create_dir(directory.path().join(folder)).unwrap();

			for (index, (name, text)) in notes.iter().enumerate() {
				let path = directory.path().join(folder).join(name);

				fs::write(&path, text).unwrap();
				set_time(&path, index as u64);
			}
		}

		Self {
			engine: Engine::new(directory.path().join("index.db"), LOCALE).unwrap(),
			directory,
		}
	}

	fn notes(&self) -> PathBuf {
		self.directory.path().join("notes")
	}

	fn sub(&self) -> PathBuf {
		self.directory.path().join("sub")
	}

	fn sync(&self, folder: &str, root: &Path) -> Json {
		let source = FsSource::new(root, LocationScheme::android(URI_PREFIX));

		stats(&self.engine.sync(folder, &source, &|_, _| {}).unwrap())
	}

	fn indexed(&self) -> Json {
		let indexed = self.engine.indexed_notes().unwrap();
		let mut entries: Vec<Json> = indexed
			.folder_ids
			.iter()
			.zip(&indexed.filenames)
			.map(|(folder, filename)| json!(format!("{folder}/{filename}")))
			.collect();

		entries.sort_by_key(Json::to_string);

		Json::Array(entries)
	}

	fn query(&self, statement: &str) -> Json {
		rows(&self.engine.query(statement, &[]).unwrap())
	}
}

fn set_time(path: &Path, offset: u64) {
	let time = UNIX_EPOCH + Duration::from_secs(BASE_SECONDS + offset);

	File::options()
		.write(true)
		.open(path)
		.unwrap()
		.set_modified(time)
		.unwrap();
}

fn stats(stats: &SyncStats) -> Json {
	json!({
		"total": stats.total,
		"added": stats.added,
		"updated": stats.updated,
		"removed": stats.removed,
		"unchanged": stats.unchanged,
		"unreadable": stats.unreadable,
	})
}

fn value(value: &Value) -> Json {
	match value {
		Value::Null => Json::Null,
		Value::Integer(number) => json!(number),
		Value::Real(number) => json!(number),
		Value::Text(text) => json!(text),
	}
}

fn rows(result: &QueryResult) -> Json {
	json!({
		"columns": result.columns,
		"rows": result
			.rows
			.iter()
			.map(|row| row.iter().map(value).collect::<Vec<_>>())
			.collect::<Vec<_>>(),
	})
}

fn outcome(outcome: &SaveOutcome) -> Json {
	match outcome {
		SaveOutcome::Saved(stamp) => json!({ "saved": { "size": stamp.size } }),
		SaveOutcome::Conflict { disk_modified } => {
			json!({ "conflict": { "disk_modified_known": *disk_modified > 0 } })
		}
		SaveOutcome::Missing => json!("missing"),
		SaveOutcome::Failed(message) => json!({ "failed": message }),
	}
}

fn references(refs: &[engine::model::NoteRef]) -> Json {
	let mut names: Vec<String> = refs
		.iter()
		.map(|note| format!("{}/{}", note.folder_id, note.filename))
		.collect();

	names.sort();

	json!(names)
}

fn decomposed(text: &str) -> Json {
	let parts = decompose(text);

	json!({
		"body": parts.body,
		"tags": parts.tags,
		"properties": parts.properties,
		"invalid_frontmatter": parts.invalid_frontmatter,
		"raw_frontmatter": parts.raw_frontmatter,
	})
}

fn parsing() -> Json {
	let samples = [
		("alpha", ALPHA),
		("unicode", UNICODE),
		("invalid", INVALID),
		("empty", ""),
	];
	let mut output = Map::new();

	for (name, text) in samples {
		output.insert(
			name.to_string(),
			json!({
				"parsed": format!("{:?}", parse_note(text)),
				"inline_tags": inline_tags(text),
				"wiki_links": wiki_links(text),
				"decomposed": decomposed(text),
			}),
		);
	}

	Json::Object(output)
}

fn composing() -> Json {
	let mut properties = Map::new();

	properties.insert("status".into(), json!("draft"));
	properties.insert("priority".into(), json!(2));

	let fields = NoteFields {
		tags: vec!["project".into(), "area/work".into()],
		properties,
		..NoteFields::default()
	};

	json!({
		"with_fields": compose(&fields, "Body\n"),
		"without_fields": compose(&NoteFields::default(), "Body\n"),
		"body_with_frontmatter_lookalike": compose(&NoteFields::default(), "---\nx: 1\n---\n\nBody\n"),
	})
}

fn linking() -> Json {
	let notes = vec![
		LinkNote {
			path: "root/Alpha.md".into(),
			title: "Alpha".into(),
			aliases: vec!["A".into()],
		},
		LinkNote {
			path: "root/Beta.md".into(),
			title: "Beta".into(),
			aliases: Vec::new(),
		},
		LinkNote {
			path: "sub/Alpha.md".into(),
			title: "Alpha".into(),
			aliases: Vec::new(),
		},
	];
	let mut folders = FolderPathByNote::new();

	folders.insert("root/Alpha.md".into(), String::new());
	folders.insert("root/Beta.md".into(), String::new());
	folders.insert("sub/Alpha.md".into(), "sub".into());

	let index = NoteIndex::new(&notes);
	let found = |text: &str| {
		index
			.find(text, &folders)
			.map(|position| notes[position].path.clone())
	};
	let candidates = [
		Candidate {
			path: "root/Beta.md",
			body: BETA,
		},
		Candidate {
			path: "sub/Delta.md",
			body: SUB_DELTA,
		},
		Candidate {
			path: "root/Gamma.md",
			body: GAMMA,
		},
	];

	json!({
		"find_alpha": found("Alpha"),
		"find_alias": found("A"),
		"find_qualified": found("sub/Alpha"),
		"find_missing": found("Nope"),
		"resolve_anchor": format!("{:?}", index.resolve("Gamma#Heading", &folders, None)),
		"backlinks_of_alpha": find_backlinks("root/Alpha.md", &index, &folders, &candidates),
		"rename_beta": rename_links(
			"See [[Alpha]] and [[Alpha|alias]] and [[sub/Alpha]]",
			"root/Alpha.md",
			"Omega",
			&index,
			&folders,
			&folders,
		),
		"normalize": [normalize("  Hello  "), normalize("ÁÉÍ"), normalize("日本")],
	})
}

fn deltas() -> Json {
	let pairs = [
		("", "one"),
		("a\nb\nc", "a\nc"),
		("a\nb\nc", "a\nx\nb\nc\ny"),
		("same", "same"),
		("a\r\nb", "a\r\nc"),
	];

	Json::Array(
		pairs
			.iter()
			.map(|(from, to)| json!(format!("{:?}", build_line_delta(from, to))))
			.collect(),
	)
}

fn versioning(repository: &Repository) -> Json {
	let root = repository.directory.path().join("repository");

	fs::create_dir(&root).unwrap();
	fs::create_dir(root.join(".notes")).unwrap();

	let versions = RepositoryVersions::new(Arc::new(FsRepository::new(&root)));
	let first = versions
		.commit("Alpha.md", &version("v1", "one\n", 1_000))
		.unwrap();
	let second = versions
		.commit("Alpha.md", &version("v2", "one\ntwo\n", 2_000))
		.unwrap();
	let repeated = versions
		.commit("Alpha.md", &version("v3", "one\ntwo\n", 3_000))
		.unwrap();
	let stored = versions.read("Alpha.md").unwrap();

	versions.rename("Alpha.md", "Renamed.md").unwrap();

	let renamed = (
		versions.read("Alpha.md").unwrap(),
		versions.read("Renamed.md").unwrap().is_some(),
	);

	versions.delete("Renamed.md").unwrap();

	json!({
		"commits": [first, second, repeated],
		"stored": stored.and_then(|text| serde_json::from_str::<Json>(&text).ok()),
		"after_rename": { "old": renamed.0, "new_exists": renamed.1 },
		"after_delete": versions.read("Renamed.md").unwrap(),
	})
}

fn scenario() -> Json {
	let repository = Repository::new();
	let sink = FsSink::new(repository.notes(), LocationScheme::android(URI_PREFIX));

	let first_sync = repository.sync(ROOT_FOLDER, &repository.notes());
	let sub_sync = repository.sync(SUB_FOLDER, &repository.sub());
	let second_sync = repository.sync(ROOT_FOLDER, &repository.notes());

	let listed = repository
		.engine
		.list_notes(&[ROOT_FOLDER.to_string(), SUB_FOLDER.to_string()])
		.unwrap();
	let listing: Json = serde_json::from_str(&listed).unwrap();

	let indexed_before_changes = repository.indexed();

	let tags = repository.query(
		"SELECT n.folder_id, n.filename, t.position, t.name, t.inline FROM tags t JOIN notes n ON n.id = t.note_id ORDER BY n.folder_id, n.filename, t.position",
	);
	let links = repository.query(
		"SELECT n.folder_id, n.filename, l.position, l.text, l.name, l.anchor_name FROM links l JOIN notes n ON n.id = l.note_id ORDER BY n.folder_id, n.filename, l.position",
	);
	let markdown = repository.query(
		"SELECT n.folder_id, n.filename, m.position, m.target FROM markdown_links m JOIN notes n ON n.id = m.note_id ORDER BY n.folder_id, n.filename, m.position",
	);
	let properties = repository.query(
		"SELECT n.folder_id, n.filename, p.position, p.key, p.value FROM properties p JOIN notes n ON n.id = p.note_id ORDER BY n.folder_id, n.filename, p.position",
	);
	let order = repository.query("SELECT folder_id, filename FROM notes ORDER BY sort_key, id");

	let backlink_candidates = references(
		&repository
			.engine
			.backlink_candidates(&["Alpha".to_string()], "Alpha.md")
			.unwrap(),
	);
	let mention_candidates = repository
		.engine
		.mention_candidates(&["alpha".to_string()])
		.unwrap()
		.map(|refs| references(&refs));

	let saved = repository
		.engine
		.save_note(ROOT_FOLDER, &sink, "Saved.md", "# Saved\n", None)
		.unwrap();
	let stamp = match &saved {
		SaveOutcome::Saved(stamp) => stamp.modified,
		_ => panic!("the first save must succeed"),
	};
	let stale = repository
		.engine
		.save_note(ROOT_FOLDER, &sink, "Saved.md", "stale\n", Some(stamp - 1))
		.unwrap();
	let fresh = repository
		.engine
		.save_note(
			ROOT_FOLDER,
			&sink,
			"Saved.md",
			"# Saved twice\n",
			Some(stamp),
		)
		.unwrap();
	let missing = repository
		.engine
		.save_note(ROOT_FOLDER, &sink, "Ghost.md", "ghost\n", Some(1))
		.unwrap();
	let renamed = repository
		.engine
		.rename_note(
			ROOT_FOLDER,
			&sink,
			"Saved.md",
			"Renamed.md",
			"# Renamed\n",
			None,
		)
		.unwrap();
	let rename_collision = repository
		.engine
		.rename_note(
			ROOT_FOLDER,
			&sink,
			"Renamed.md",
			"Alpha.md",
			"# Clash\n",
			None,
		)
		.unwrap();
	let after_rename = repository.indexed();

	repository
		.engine
		.delete_note(ROOT_FOLDER, &sink, "Renamed.md")
		.unwrap();
	let after_delete = repository.indexed();

	let beta = repository.notes().join("Beta.md");

	fs::write(&beta, "Back to [[Alpha]] and [[Gamma]].\n").unwrap();
	set_time(&beta, 500);
	fs::remove_file(repository.notes().join("Gamma.md")).unwrap();

	let external_sync = repository.sync(ROOT_FOLDER, &repository.notes());

	repository.engine.delete_folder(SUB_FOLDER).unwrap();
	let after_folder_delete = repository.indexed();

	json!({
		"sync": {
			"first": first_sync,
			"sub": sub_sync,
			"second": second_sync,
			"after_external_changes": external_sync,
		},
		"listing": listing,
		"indexed": indexed_before_changes,
		"tags": tags,
		"links": links,
		"markdown_links": markdown,
		"properties": properties,
		"order": order,
		"candidates": {
			"backlinks": backlink_candidates,
			"mentions": mention_candidates,
		},
		"saves": {
			"created": outcome(&saved),
			"stale": outcome(&stale),
			"fresh": outcome(&fresh),
			"missing": outcome(&missing),
			"renamed": outcome(&renamed),
			"rename_collision": outcome(&rename_collision),
			"after_rename": after_rename,
			"after_delete": after_delete,
		},
		"after_folder_delete": after_folder_delete,
		"parsing": parsing(),
		"composing": composing(),
		"linking": linking(),
		"deltas": deltas(),
		"versions": versioning(&repository),
	})
}

#[test]
fn engine_behaviour_matches_the_recorded_snapshot() {
	let actual = scenario();
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(SNAPSHOT);

	if std::env::var(UPDATE_VARIABLE).is_ok() {
		fs::write(&path, serde_json::to_string_pretty(&actual).unwrap() + "\n").unwrap();
		return;
	}

	let recorded: Json = serde_json::from_str(&fs::read_to_string(&path).unwrap()).unwrap();

	assert_eq!(
		actual, recorded,
		"engine output changed; rerun with {UPDATE_VARIABLE}=1 only when the change is intended"
	);
}

#[test]
fn the_scenario_is_deterministic() {
	assert_eq!(scenario(), scenario());
}
