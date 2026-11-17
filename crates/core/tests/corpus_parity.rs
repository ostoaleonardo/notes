use engine::syntax::{inline_tags, wiki_links};
use serde_json::Value;
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;

fn fixtures() -> PathBuf {
	PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../src/features/syntax/__fixtures__")
}

fn expected() -> Value {
	let text = fs::read_to_string(fixtures().join("expected.json")).expect("expected.json");
	serde_json::from_str(&text).expect("valid json")
}

fn dedupe_ignoring_case(names: Vec<String>) -> Vec<String> {
	let mut seen = HashSet::new();
	names
		.into_iter()
		.filter(|name| seen.insert(name.to_lowercase()))
		.collect()
}

fn corpus() -> Vec<(String, String)> {
	let mut entries: Vec<_> = fs::read_dir(fixtures().join("corpus"))
		.expect("corpus directory")
		.map(|entry| entry.expect("entry").path())
		.filter(|path| path.extension().is_some_and(|ext| ext == "md"))
		.map(|path| {
			let name = path
				.file_stem()
				.expect("stem")
				.to_string_lossy()
				.into_owned();
			(name, fs::read_to_string(&path).expect("readable"))
		})
		.collect();

	entries.sort();
	entries
}

fn frontmatter_of(text: &str) -> &str {
	let body = text.strip_prefix("---\n").unwrap_or("");
	body.split_once("\n---").map_or("", |(raw, _)| raw)
}

#[test]
fn extracts_the_same_wiki_links_as_the_reference_corpus() {
	let expected = expected();

	for (name, text) in corpus() {
		let reference: Vec<String> = expected[&name]["links"]
			.as_array()
			.expect("links")
			.iter()
			.map(|link| link.as_str().expect("text").to_string())
			.filter(|link| !frontmatter_of(&text).contains(&format!("[[{link}")))
			.collect();

		assert_eq!(wiki_links(&text), reference, "links of {name}");
	}
}

#[test]
fn extracts_the_same_inline_tags_as_the_reference_corpus() {
	let expected = expected();

	for (name, text) in corpus() {
		let reference: Vec<String> = expected[&name]["tags"]
			.as_array()
			.expect("tags")
			.iter()
			.map(|tag| tag["name"].as_str().expect("name").to_string())
			.collect();

		assert_eq!(
			inline_tags(&text),
			dedupe_ignoring_case(reference),
			"tags of {name}"
		);
	}
}
