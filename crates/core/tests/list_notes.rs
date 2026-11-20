mod common;

use common::{corpus, dedupe_ignoring_case, expected, frontmatter_of, plain_numbers, strings};
use engine::engine::Engine;
use engine::model::NoteInput;
use serde_json::Value;
use tempfile::TempDir;

const REPOSITORY: &str = "repo";
const MODIFIED: i64 = 7;

fn input(name: &str, text: &str) -> NoteInput {
	NoteInput {
		filename: format!("{name}.md"),
		uri: format!("file:///{name}.md"),
		modified: MODIFIED,
		size: text.len() as i64,
		text: text.to_string(),
	}
}

fn listed(inputs: Vec<NoteInput>, folders: &[&str]) -> Vec<Value> {
	let directory = TempDir::new().unwrap();
	let engine = Engine::new(directory.path().join("index.db"), "en").unwrap();

	engine.write(REPOSITORY, inputs).unwrap();

	let ids: Vec<String> = folders.iter().map(|id| id.to_string()).collect();
	let json = engine.list_notes(&ids).unwrap();

	serde_json::from_str::<Value>(&json)
		.unwrap()
		.as_array()
		.unwrap()
		.clone()
}

fn corpus_notes() -> Vec<Value> {
	listed(
		corpus()
			.into_iter()
			.map(|(name, text)| input(&name, &text))
			.collect(),
		&[REPOSITORY],
	)
}

fn note_named<'a>(notes: &'a [Value], name: &str) -> &'a Value {
	notes
		.iter()
		.find(|note| note["filename"] == format!("{name}.md"))
		.expect("listed note")
}

#[test]
fn lists_every_indexed_note_with_its_file_fields() {
	let notes = corpus_notes();
	let first = &notes[0];

	assert_eq!(notes.len(), corpus().len());
	assert_eq!(first["folderId"], REPOSITORY);
	assert_eq!(first["updatedAt"], MODIFIED);
	assert_eq!(first["createdAt"], MODIFIED);
	assert_eq!(
		first["fileUri"],
		format!("file:///{}", first["filename"].as_str().unwrap())
	);
}

#[test]
fn lists_nothing_for_unknown_or_empty_repositories() {
	assert!(listed(vec![input("a", "x")], &["other"]).is_empty());
	assert!(listed(vec![input("a", "x")], &[]).is_empty());
}

#[test]
fn lists_the_same_tags_properties_and_frontmatter_as_the_reference_corpus() {
	let expected = expected();
	let notes = corpus_notes();

	for (name, _) in corpus() {
		let note = note_named(&notes, &name);
		let metadata = &expected[&name]["metadata"];

		assert_eq!(
			strings(&note["tags"]),
			strings(&metadata["tags"]),
			"tags of {name}"
		);
		assert_eq!(
			&plain_numbers(note["properties"].clone()),
			&metadata["properties"],
			"properties of {name}"
		);
		assert_eq!(
			note["invalidFrontmatter"], metadata["invalidFrontmatter"],
			"invalid of {name}"
		);
		assert_eq!(
			note["rawFrontmatter"], metadata["rawFrontmatter"],
			"raw of {name}"
		);
	}
}

#[test]
fn lists_the_same_inline_tags_and_link_texts_as_the_reference_corpus() {
	let expected = expected();
	let notes = corpus_notes();

	for (name, text) in corpus() {
		let note = note_named(&notes, &name);
		let inline: Vec<String> = expected[&name]["tags"]
			.as_array()
			.expect("tags")
			.iter()
			.map(|tag| tag["name"].as_str().expect("name").to_string())
			.collect();
		let links: Vec<String> = strings(&expected[&name]["links"])
			.into_iter()
			.filter(|link| !frontmatter_of(&text).contains(&format!("[[{link}")))
			.collect();

		assert_eq!(
			strings(&note["inlineTags"]),
			dedupe_ignoring_case(inline),
			"inline of {name}"
		);
		assert_eq!(strings(&note["linkTexts"]), links, "links of {name}");
	}
}

#[test]
fn lists_notes_in_the_order_they_were_indexed() {
	let notes = listed(
		vec![input("b", ""), input("a", ""), input("c", "")],
		&[REPOSITORY],
	);
	let names: Vec<&str> = notes
		.iter()
		.map(|note| note["title"].as_str().unwrap())
		.collect();

	assert_eq!(names, ["b", "a", "c"]);
}
