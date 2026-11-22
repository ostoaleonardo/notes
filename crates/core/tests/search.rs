use engine::search::{Node, NoteView, Query};
use serde_json::{Map, Value, json};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;

const UNSUPPORTED_PATTERNS: [&str; 1] = ["/(?<!x)y/"];

struct FixtureNote {
	path: String,
	title: String,
	filename: String,
	folder: String,
	tags: Vec<String>,
	properties: Map<String, Value>,
	content: String,
}

fn fixture() -> Value {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/search.json");

	serde_json::from_str(&fs::read_to_string(path).expect("search.json")).expect("valid json")
}

fn text(value: &Value) -> String {
	value.as_str().expect("string").to_string()
}

fn notes_of(fixture: &Value) -> Vec<FixtureNote> {
	fixture["notes"]
		.as_array()
		.expect("notes")
		.iter()
		.map(|note| FixtureNote {
			path: text(&note["path"]),
			title: text(&note["title"]),
			filename: text(&note["filename"]),
			folder: note["folder"].as_str().unwrap_or_default().to_string(),
			tags: note["tags"]
				.as_array()
				.expect("tags")
				.iter()
				.map(text)
				.collect(),
			properties: note["properties"].as_object().expect("properties").clone(),
			content: text(&note["content"]),
		})
		.collect()
}

fn view<'a>(note: &'a FixtureNote, pinned: &HashSet<String>) -> NoteView<'a> {
	NoteView {
		title: &note.title,
		filename: &note.filename,
		folder: Some(&note.folder),
		content: &note.content,
		tags: &note.tags,
		properties: &note.properties,
		pinned: pinned.contains(&note.path),
	}
}

#[test]
fn selects_the_same_notes_as_the_reference_evaluator() {
	let fixture = fixture();
	let notes = notes_of(&fixture);
	let pinned: HashSet<String> = fixture["pinned"]
		.as_array()
		.expect("pinned")
		.iter()
		.map(text)
		.collect();
	let mut checked = 0;

	for case in fixture["cases"].as_array().expect("cases") {
		let query = text(&case["query"]);
		let node: Node = serde_json::from_value(case["ast"].clone())
			.unwrap_or_else(|error| panic!("ast of {query}: {error}"));

		let compiled = match Query::compile(&node) {
			Ok(compiled) => compiled,
			Err(_) => {
				assert!(
					UNSUPPORTED_PATTERNS.contains(&query.as_str()),
					"unexpected compile failure for {query}"
				);
				continue;
			}
		};

		let match_case = case["matchCase"].as_bool().expect("matchCase");
		let found: Vec<String> = notes
			.iter()
			.filter(|note| compiled.matches(&view(note, &pinned), match_case))
			.map(|note| note.path.clone())
			.collect();
		let expected: Vec<String> = case["expected"]
			.as_array()
			.expect("expected")
			.iter()
			.map(text)
			.collect();

		assert_eq!(found, expected, "query {query} (match case {match_case})");
		checked += 1;
	}

	assert!(checked > 600, "only {checked} cases checked");
}

#[test]
#[ignore = "benchmark"]
fn evaluates_five_thousand_notes_quickly() {
	let fixture = fixture();
	let sources = notes_of(&fixture);
	let properties = Map::new();
	let contents: Vec<String> = (0..5000)
		.map(|index| {
			format!(
				"{}\nnote {index} milk eggs agenda\n- [ ] call Ana\n",
				sources[index % sources.len()].content
			)
		})
		.collect();
	let text =
		|value: &str, phrase: bool| json!({ "type": "text", "value": value, "phrase": phrase });
	let filter = |name: &str, argument: Value| json!({ "type": "filter", "name": name, "argument": argument });
	let queries = [
		("word", text("agenda", false)),
		("phrase", text("milk eggs", true)),
		("regex", json!({ "type": "regex", "pattern": "ag\\w+a" })),
		("line", filter("line", text("milk eggs", true))),
		("task", filter("task-todo", text("call", false))),
	];

	for (name, ast) in queries {
		let node: Node = serde_json::from_value(ast).expect("ast");
		let compiled = Query::compile(&node).expect("compiles");
		let start = std::time::Instant::now();
		let found = contents
			.iter()
			.filter(|content| {
				compiled.matches(
					&NoteView {
						title: "t",
						filename: "t.md",
						folder: None,
						content,
						tags: &[],
						properties: &properties,
						pinned: false,
					},
					false,
				)
			})
			.count();

		println!("{name}: {found} of 5000 in {:?}", start.elapsed());
	}
}
