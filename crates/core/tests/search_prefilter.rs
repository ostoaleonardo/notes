use engine::engine::Engine;
use engine::model::{NoteInput, Value as Cell};
use engine::search::{Node, Requirement, Sort, candidates_sql, compile_match_ids, requirement_of};
use serde_json::{Value, json};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use tempfile::TempDir;

const REPOSITORY: &str = "repo";
const FILENAME_COLUMN: usize = 2;

fn fixture() -> Value {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/search.json");

	serde_json::from_str(&fs::read_to_string(path).expect("search.json")).expect("valid json")
}

fn text(value: &Value) -> String {
	value.as_str().expect("string").to_string()
}

fn tree_json(requirement: &Requirement) -> Value {
	match requirement {
		Requirement::Fts { columns, term } => {
			json!({ "kind": "fts", "columns": columns, "term": term })
		}
		Requirement::Tag(name) => json!({ "kind": "tag", "name": name }),
		Requirement::And(children) => {
			json!({ "kind": "and", "children": children.iter().map(tree_json).collect::<Vec<_>>() })
		}
		Requirement::Or(children) => {
			json!({ "kind": "or", "children": children.iter().map(tree_json).collect::<Vec<_>>() })
		}
	}
}

fn folders_of(fixture: &Value) -> Vec<String> {
	fixture["folders"]
		.as_array()
		.expect("folders")
		.iter()
		.map(text)
		.collect()
}

#[test]
fn builds_the_same_requirements_and_sql_as_the_reference_prefilter() {
	let fixture = fixture();
	let folders = folders_of(&fixture);
	let mut with_filter = 0;

	for case in fixture["cases"].as_array().expect("cases") {
		let query = text(&case["query"]);
		let node: Node = serde_json::from_value(case["ast"].clone()).expect("ast");
		let found = requirement_of(&node, &folders);

		match (&found, &case["prefilter"]) {
			(None, Value::Null) => {}
			(Some(tree), reference) => {
				let ids = compile_match_ids(tree);

				assert_eq!(tree_json(tree), reference["tree"], "tree of {query}");
				assert_eq!(ids.sql, text(&reference["sql"]), "sql of {query}");
				assert_eq!(json!(ids.params), reference["params"], "params of {query}");
				with_filter += 1;
			}
			(None, reference) => panic!("missing prefilter for {query}: {reference}"),
		}
	}

	assert!(with_filter > 400, "only {with_filter} prefilters checked");
}

#[test]
fn never_drops_a_note_the_evaluator_selects() {
	let fixture = fixture();
	let folders = folders_of(&fixture);
	let directory = TempDir::new().unwrap();
	let engine = Engine::new(directory.path().join("index.db"), "en").unwrap();
	let notes = fixture["notes"].as_array().expect("notes");

	let inputs: Vec<NoteInput> = notes
		.iter()
		.map(|note| NoteInput {
			filename: text(&note["filename"]),
			location: format!("file:///{}", text(&note["filename"])),
			modified: 1,
			size: text(&note["file"]).len() as i64,
			text: text(&note["file"]),
		})
		.collect();

	engine.write(REPOSITORY, inputs).unwrap();

	let by_filename: std::collections::HashMap<String, String> = notes
		.iter()
		.map(|note| (text(&note["filename"]), text(&note["path"])))
		.collect();
	let scope = vec![REPOSITORY.to_string()];
	let mut narrowed = 0;

	for case in fixture["cases"].as_array().expect("cases") {
		let query = text(&case["query"]);
		let node: Node = serde_json::from_value(case["ast"].clone()).expect("ast");
		let tree = requirement_of(&node, &folders);
		let statement = candidates_sql(tree.as_ref(), &scope, Sort::NameAsc);
		let params: Vec<Cell> = statement.params.iter().cloned().map(Cell::Text).collect();
		let rows = engine.query(&statement.sql, &params).unwrap().rows;

		let candidates: HashSet<String> = rows
			.iter()
			.filter_map(|row| match &row[FILENAME_COLUMN] {
				Cell::Text(name) => by_filename.get(name).cloned(),
				_ => None,
			})
			.collect();

		for expected in case["expected"].as_array().expect("expected") {
			assert!(
				candidates.contains(&text(expected)),
				"{query} lost {expected}"
			);
		}

		if candidates.len() < notes.len() {
			narrowed += 1;
		}
	}

	assert!(
		narrowed > 50,
		"the prefilter narrowed only {narrowed} queries"
	);
}

#[test]
fn orders_candidates_like_the_reference_sorts() {
	let scope = vec![REPOSITORY.to_string()];
	let tail = |sort| candidates_sql(None, &scope, sort).sql;

	assert!(tail(Sort::NameAsc).ends_with("ORDER BY n.sort_key ASC, n.id ASC"));
	assert!(tail(Sort::NameDesc).ends_with("ORDER BY n.sort_key DESC, n.id DESC"));
	assert!(
		tail(Sort::ModifiedDesc).ends_with("ORDER BY n.modified DESC, n.sort_key ASC, n.id ASC")
	);
	assert!(tail(Sort::CreatedAsc).ends_with("ORDER BY n.modified ASC, n.sort_key ASC, n.id ASC"));
}
