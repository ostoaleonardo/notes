use engine::syntax::parse_note;
use serde_json::{Map, Value};
use std::fs;
use std::path::PathBuf;

fn fixtures() -> PathBuf {
	PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../src/features/syntax/__fixtures__")
}

fn expected() -> Value {
	let text = fs::read_to_string(fixtures().join("expected.json")).expect("expected.json");
	serde_json::from_str(&text).expect("valid json")
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

fn plain_numbers(value: Value) -> Value {
	match value {
		Value::Number(number) => match number.as_f64() {
			Some(float) if number.is_f64() && float.fract() == 0.0 && float.abs() < 9e15 => {
				Value::from(float as i64)
			}
			_ => Value::Number(number),
		},
		Value::Array(items) => Value::Array(items.into_iter().map(plain_numbers).collect()),
		Value::Object(map) => Value::Object(
			map.into_iter()
				.map(|(key, value)| (key, plain_numbers(value)))
				.collect(),
		),
		other => other,
	}
}

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
		let reference: Vec<&str> = expected[&name]["metadata"]["tags"]
			.as_array()
			.expect("tags")
			.iter()
			.map(|tag| tag.as_str().expect("name"))
			.collect();

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
