use engine::engine::Engine;
use engine::model::{NoteInput, ScannedFile, Value};
use std::collections::HashSet;
use tempfile::TempDir;

fn input(filename: &str, text: &str) -> NoteInput {
	NoteInput {
		filename: filename.to_string(),
		location: format!("file:///{filename}"),
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
	Engine::new(directory.path().join("index.db"), locale).unwrap()
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
fn deletes_a_folder_with_all_its_rows() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write("one", vec![input("A.md", "#t [[x]]")])
		.unwrap();
	engine.write("two", vec![input("A.md", "#t")]).unwrap();
	engine.delete_folder("one").unwrap();

	assert_eq!(count(&engine, "notes"), 1);
	assert_eq!(count(&engine, "links"), 0);
	assert_eq!(count(&engine, "note_fts_docsize"), 1);
}

#[test]
fn prunes_folders_that_are_not_kept() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine.write("keep", vec![input("A.md", "x")]).unwrap();
	engine.write("drop", vec![input("B.md", "y")]).unwrap();
	engine.prune(&HashSet::from(["keep".to_string()])).unwrap();

	let notes = engine.indexed_notes().unwrap();

	assert_eq!(notes.folder_ids, ["keep"]);
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

fn refs(found: Vec<engine::model::NoteRef>) -> Vec<String> {
	let mut names: Vec<String> = found.into_iter().map(|note| note.filename).collect();
	names.sort();
	names
}

fn candidate_engine(directory: &TempDir) -> Engine {
	let engine = engine(directory, "en");

	engine
		.write(
			"repo",
			vec![
				input("Plain.md", "see [[Target]]"),
				input("Alias.md", "see [[the alias]]"),
				input("Path.md", "see [[Folder/Target]]"),
				input("Anchor.md", "see [[Target#Heading]]"),
				input("Markdown.md", "see [x](wikilink://repo/Target.md)"),
				input("Other.md", "see [[Unrelated]]"),
				input("Code.md", "`[[Target]]`"),
			],
		)
		.unwrap();

	engine
}

#[test]
fn finds_notes_that_link_to_a_name_alias_path_anchor_or_markdown_target() {
	let directory = TempDir::new().unwrap();
	let engine = candidate_engine(&directory);

	let found = engine
		.backlink_candidates(
			&["Target".to_string(), "The Alias".to_string()],
			"repo/Target.md",
		)
		.unwrap();

	assert_eq!(
		refs(found),
		[
			"Alias.md",
			"Anchor.md",
			"Markdown.md",
			"Path.md",
			"Plain.md"
		]
	);
}

#[test]
fn finds_no_backlinks_without_names_or_markdown_matches() {
	let directory = TempDir::new().unwrap();
	let engine = candidate_engine(&directory);

	assert!(engine.backlink_candidates(&[], "none").unwrap().is_empty());
}

#[test]
fn finds_mention_candidates_with_full_text_search() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write(
			"repo",
			vec![
				input("A.md", "talks about Rust Engine today"),
				input("B.md", "nothing related"),
			],
		)
		.unwrap();

	let found = engine
		.mention_candidates(&["rust engine".to_string()])
		.unwrap();

	assert_eq!(refs(found.unwrap()), ["A.md"]);
}

#[test]
fn asks_for_a_full_scan_when_a_term_is_too_short_for_trigrams() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	assert!(
		engine
			.mention_candidates(&["ab".to_string()])
			.unwrap()
			.is_none()
	);
}

#[test]
fn escapes_quotes_in_mention_terms() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write("repo", vec![input("A.md", "say \"hello\" now")])
		.unwrap();

	let found = engine
		.mention_candidates(&["\"hello\"".to_string()])
		.unwrap();

	assert_eq!(refs(found.unwrap()), ["A.md"]);
}

fn texts(engine: &Engine, statement: &str) -> Vec<Vec<Value>> {
	engine.query(statement, &[]).unwrap().rows
}

#[test]
fn stores_whether_each_tag_came_from_the_frontmatter_or_the_body() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write("repo", vec![input("A.md", "---\ntags: [fm]\n---\n#body")])
		.unwrap();

	assert_eq!(
		texts(&engine, "SELECT name, inline FROM tags ORDER BY position"),
		[
			[Value::Text("fm".into()), Value::Integer(0)],
			[Value::Text("body".into()), Value::Integer(1)]
		]
	);
}

#[test]
fn stores_property_values_as_json() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write(
			"repo",
			vec![input(
				"A.md",
				"---\ncount: 3\naliases: [x, y]\nnested:\n  k: v\n---\n",
			)],
		)
		.unwrap();

	assert_eq!(
		texts(
			&engine,
			"SELECT key, value FROM properties ORDER BY position"
		),
		[
			[Value::Text("count".into()), Value::Text("3".into())],
			[
				Value::Text("aliases".into()),
				Value::Text("[\"x\",\"y\"]".into())
			],
			[
				Value::Text("nested".into()),
				Value::Text("{\"k\":\"v\"}".into())
			]
		]
	);
}

#[test]
fn stores_the_raw_frontmatter_and_null_when_there_is_no_block() {
	let directory = TempDir::new().unwrap();
	let engine = engine(&directory, "en");

	engine
		.write(
			"repo",
			vec![
				input("A.md", "---\nstatus: open\n---\nbody"),
				input("B.md", "no block"),
				input("C.md", "---\ntags: [a, b\n---\nbroken"),
			],
		)
		.unwrap();

	assert_eq!(
		texts(
			&engine,
			"SELECT frontmatter, invalid_frontmatter FROM notes ORDER BY filename"
		),
		[
			[Value::Text("status: open".into()), Value::Integer(0)],
			[Value::Null, Value::Integer(0)],
			[Value::Text("tags: [a, b".into()), Value::Integer(1)]
		]
	);
}
