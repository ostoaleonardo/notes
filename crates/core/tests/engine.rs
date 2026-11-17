use engine::engine::Engine;
use engine::model::{NoteInput, ScannedFile, Value};
use std::collections::HashSet;
use tempfile::TempDir;

fn input(filename: &str, text: &str) -> NoteInput {
	NoteInput {
		filename: filename.to_string(),
		uri: format!("file:///{filename}"),
		modified: 1,
		size: text.len() as i64,
		text: text.to_string(),
	}
}

fn scanned(filename: &str, modified: i64, size: i64) -> ScannedFile {
	ScannedFile {
		filename: filename.to_string(),
		modified,
		size,
	}
}

fn engine(directory: &TempDir, locale: &str) -> Engine {
	Engine::new(directory.path().join("index.db"), locale)
}

fn count(engine: &Engine, table: &str) -> i64 {
	let result = engine
		.query(&format!("SELECT COUNT(*) FROM {table}"), &[])
		.expect("count");

	match result.rows[0][0] {
		Value::Integer(count) => count,
		ref other => panic!("unexpected {other:?}"),
	}
}

fn titles_in_order(engine: &Engine) -> Vec<String> {
	engine
		.query("SELECT title FROM notes ORDER BY sort_key", &[])
		.expect("titles")
		.rows
		.into_iter()
		.map(|row| match &row[0] {
			Value::Text(title) => title.clone(),
			other => panic!("unexpected {other:?}"),
		})
		.collect()
}

#[test]
fn indexes_tags_links_properties_and_full_text() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	let stats = engine
		.write(
			"repo",
			vec![input(
				"A.md",
				"---\ntags: [x]\nstatus: open\n---\n#y [[B]] body text",
			)],
		)
		.unwrap();

	assert_eq!(stats.notes, 1);
	assert_eq!(count(&engine, "tags"), 2);
	assert_eq!(count(&engine, "links"), 1);
	assert_eq!(count(&engine, "properties"), 1);

	let found = engine
		.query(
			"SELECT rowid FROM note_fts WHERE note_fts MATCH ?1",
			&[Value::Text("body".into())],
		)
		.unwrap();

	assert_eq!(found.rows.len(), 1);
}

#[test]
fn replaces_a_note_when_it_is_written_again() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine.write("repo", vec![input("A.md", "#one")]).unwrap();
	engine
		.write("repo", vec![input("A.md", "#two #three")])
		.unwrap();

	assert_eq!(count(&engine, "notes"), 1);
	assert_eq!(count(&engine, "tags"), 2);
}

#[test]
fn plans_added_updated_unchanged_and_removed_files() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write(
			"repo",
			vec![
				input("Keep.md", "a"),
				input("Change.md", "b"),
				input("Gone.md", "c"),
			],
		)
		.unwrap();

	let plan = engine
		.plan(
			"repo",
			&[
				scanned("Keep.md", 1, 1),
				scanned("Change.md", 2, 1),
				scanned("New.md", 1, 1),
			],
		)
		.unwrap();

	assert_eq!(plan.changed, [1, 2]);
	assert_eq!(plan.added, 1);
	assert_eq!(plan.updated, 1);
	assert_eq!(plan.unchanged, 1);
	assert_eq!(plan.removed, ["Gone.md"]);
}

#[test]
fn removes_files_by_name() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write("repo", vec![input("A.md", "#t"), input("B.md", "x")])
		.unwrap();
	engine.remove("repo", &["A.md".to_string()]).unwrap();

	assert_eq!(count(&engine, "notes"), 1);
	assert_eq!(count(&engine, "tags"), 0);
}

#[test]
fn deletes_a_repository_with_all_its_rows() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write("one", vec![input("A.md", "#t [[x]]")])
		.unwrap();
	engine.write("two", vec![input("A.md", "#t")]).unwrap();
	engine.delete_repository("one").unwrap();

	assert_eq!(count(&engine, "notes"), 1);
	assert_eq!(count(&engine, "links"), 0);
	assert_eq!(count(&engine, "note_fts_docsize"), 1);
}

#[test]
fn prunes_repositories_that_are_not_kept() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine.write("keep", vec![input("A.md", "x")]).unwrap();
	engine.write("drop", vec![input("B.md", "y")]).unwrap();
	engine.prune(&HashSet::from(["keep".to_string()])).unwrap();

	let notes = engine.indexed_notes().unwrap();

	assert_eq!(notes.repository_ids, ["keep"]);
	assert_eq!(notes.filenames, ["A.md"]);
}

#[test]
fn orders_notes_by_the_locale_collation() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "es");

	engine
		.write(
			"repo",
			vec![
				input("oso.md", ""),
				input("ñu.md", ""),
				input("nube.md", ""),
			],
		)
		.unwrap();

	assert_eq!(titles_in_order(&engine), ["nube", "ñu", "oso"]);
}

#[test]
fn rebuilds_the_index_when_the_locale_changes() {
	let directory = TempDir::new().unwrap();

	engine(&directory, "en")
		.write("repo", vec![input("A.md", "x")])
		.unwrap();

	assert_eq!(count(&engine(&directory, "es"), "notes"), 0);
}

#[test]
fn binds_parameters_of_every_type() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	let result = engine
		.query(
			"SELECT ?1, ?2, ?3, ?4",
			&[
				Value::Null,
				Value::Integer(7),
				Value::Real(1.5),
				Value::Text("t".into()),
			],
		)
		.unwrap();

	assert_eq!(
		result.rows[0],
		[
			Value::Null,
			Value::Integer(7),
			Value::Real(1.5),
			Value::Text("t".into())
		]
	);
}
