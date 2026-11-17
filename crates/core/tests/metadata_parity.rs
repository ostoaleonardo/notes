mod common;

use common::{corpus, expected, plain_numbers, strings};
use engine::syntax::parse_note;
use serde_json::{Map, Value};

fn properties_of(text: &str) -> Map<String, Value> {
	parse_note(text)
		.properties
		.into_iter()
		.map(|property| {
			let value = serde_json::from_str(&property.value).expect("json value");
			(property.key, plain_numbers(value))
		})
		.collect()
}

#[test]
fn reads_the_same_frontmatter_tags_as_the_reference_corpus() {
	let expected = expected();

	for (name, text) in corpus() {
		let reference = strings(&expected[&name]["metadata"]["tags"]);
		let found: Vec<String> = parse_note(&text)
			.tags
			.into_iter()
			.filter(|tag| !tag.inline)
			.map(|tag| tag.name)
			.collect();

		assert_eq!(found, reference, "frontmatter tags of {name}");
	}
}

#[test]
fn reads_the_same_properties_as_the_reference_corpus() {
	let expected = expected();

	for (name, text) in corpus() {
		let reference = expected[&name]["metadata"]["properties"]
			.as_object()
			.expect("properties");
		let found = properties_of(&text);

		assert_eq!(&found, reference, "properties of {name}");
		assert_eq!(
			found.keys().collect::<Vec<_>>(),
			reference.keys().collect::<Vec<_>>(),
			"property order of {name}"
		);
	}
}

#[test]
fn keeps_the_same_raw_and_invalid_frontmatter_as_the_reference_corpus() {
	let expected = expected();

	for (name, text) in corpus() {
		let metadata = &expected[&name]["metadata"];
		let note = parse_note(&text);
		let invalid = metadata["invalidFrontmatter"].as_str();
		let raw = metadata["rawFrontmatter"].as_str();

		assert_eq!(
			note.invalid_frontmatter,
			invalid.is_some(),
			"invalid flag of {name}"
		);
		assert_eq!(
			note.frontmatter.as_deref(),
			invalid.or(raw),
			"raw frontmatter of {name}"
		);
	}
}
