use engine::syntax::{Decomposed, NoteFields, compose, decompose};
use serde_json::{Map, Value, json};
use std::fs;
use std::path::PathBuf;

fn object(value: Value) -> Map<String, Value> {
	match value {
		Value::Object(map) => map,
		other => panic!("expected an object, got {other}"),
	}
}

fn fields(tags: &[&str], properties: Value) -> NoteFields {
	NoteFields {
		tags: tags.iter().map(|tag| tag.to_string()).collect(),
		properties: object(properties),
		..NoteFields::default()
	}
}

fn fixture() -> Vec<(Map<String, Value>, String)> {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/yaml-emit.json");
	let cases: Vec<Value> = serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap();

	cases
		.into_iter()
		.map(|case| {
			(
				object(case["value"].clone()),
				case["expected"].as_str().unwrap().to_string(),
			)
		})
		.collect()
}

fn note_of(value: Map<String, Value>) -> NoteFields {
	let mut properties = value;
	let tags = match properties.remove("tags") {
		Some(Value::Array(items)) => items
			.into_iter()
			.map(|item| item.as_str().unwrap().to_string())
			.collect(),
		_ => Vec::new(),
	};

	NoteFields {
		tags,
		properties,
		..NoteFields::default()
	}
}

fn block_of(content: &str) -> &str {
	let body = content.strip_prefix("---\n").unwrap();

	body.split_once("\n---\n").unwrap().0
}

#[test]
fn emits_the_same_yaml_as_the_javascript_serializer() {
	for (value, expected) in fixture() {
		let content = compose(&note_of(value.clone()), "Body");

		assert_eq!(
			format!("{}\n", block_of(&content)),
			expected,
			"properties: {}",
			Value::Object(value)
		);
	}
}

#[test]
fn emitted_yaml_reads_back_to_the_same_properties() {
	let mut values: Vec<_> = fixture().into_iter().map(|(value, _)| value).collect();
	values.push(object(json!({
		"long": "word ".repeat(40),
		"tabbed": "a\tb",
		"control": "bell\u{7}",
		"trailing": "line\n",
		"indented": "  first\nsecond"
	})));

	for value in values {
		let note = note_of(value);
		let content = compose(&note, "Body");
		let read = decompose(&content);

		assert_eq!(read.properties, Some(note.properties), "content: {content}");
		assert_eq!(read.body, "Body");
	}
}

#[test]
fn serializes_tags_as_a_yaml_block_list() {
	let content = compose(&fields(&["personal", "work"], json!({})), "Body");

	assert_eq!(content, "---\ntags:\n  - personal\n  - work\n---\n\nBody");
}

#[test]
fn quotes_tag_names_with_special_characters() {
	let content = compose(&fields(&["a: b", "has \"quotes\""], json!({})), "Body");

	assert_eq!(
		content,
		"---\ntags:\n  - 'a: b'\n  - has \"quotes\"\n---\n\nBody"
	);
}

#[test]
fn omits_the_block_when_there_are_no_tags_or_properties() {
	assert_eq!(compose(&fields(&[], json!({})), "Body"), "Body");
	assert_eq!(compose(&NoteFields::default(), "Body"), "Body");
}

#[test]
fn keeps_an_empty_block_when_the_body_itself_starts_with_a_fence() {
	let body = "---\nrule\n---\nText";
	let content = compose(&fields(&[], json!({})), body);

	assert_eq!(decompose(&content).body, body);
}

#[test]
fn omits_the_tags_key_when_there_are_properties_but_no_tags() {
	let content = compose(&fields(&[], json!({ "author": "Ana" })), "Body");

	assert_eq!(
		decompose(&content).properties,
		Some(object(json!({ "author": "Ana" })))
	);
	assert!(!content.contains("tags"));
}

#[test]
fn writes_unknown_properties_before_the_tags() {
	let content = compose(
		&fields(&["a"], json!({ "aliases": ["Alias"], "rating": 5 })),
		"Body",
	);

	assert_eq!(
		content,
		"---\naliases:\n  - Alias\nrating: 5\ntags:\n  - a\n---\n\nBody"
	);
}

#[test]
fn writes_date_properties_unquoted() {
	let content = compose(
		&fields(
			&[],
			json!({ "due": "2026-10-04", "at": "2026-10-04T09:30" }),
		),
		"Body",
	);

	assert!(content.contains("due: 2026-10-04\n"));
	assert!(content.contains("at: 2026-10-04T09:30\n"));
}

#[test]
fn keeps_comments_and_key_order_when_tags_and_properties_are_unchanged() {
	let raw = "# my comment\nzeta: 1\ntags: [b, a]\nalpha: 2";
	let note = NoteFields {
		raw_frontmatter: Some(raw.to_string()),
		..fields(&["b", "a"], json!({ "zeta": 1, "alpha": 2 }))
	};

	assert_eq!(compose(&note, "Body"), format!("---\n{raw}\n---\n\nBody"));
}

#[test]
fn rewrites_the_block_when_the_tags_changed() {
	let note = NoteFields {
		raw_frontmatter: Some("# my comment\nzeta: 1\ntags: [b, a]\nalpha: 2".to_string()),
		..fields(&["b"], json!({ "zeta": 1, "alpha": 2 }))
	};
	let content = compose(&note, "Body");

	assert!(!content.contains("# my comment"));
	assert_eq!(decompose(&content).tags, Some(vec!["b".to_string()]));
}

#[test]
fn rewrites_the_block_when_a_property_changed() {
	let note = NoteFields {
		raw_frontmatter: Some("zeta: 1\ntags: [b, a]\nalpha: 2".to_string()),
		..fields(&["b", "a"], json!({ "zeta": 9, "alpha": 2 }))
	};

	assert_eq!(
		decompose(&compose(&note, "Body")).properties,
		Some(object(json!({ "zeta": 9, "alpha": 2 })))
	);
}

#[test]
fn writes_the_raw_invalid_block_verbatim_instead_of_the_tags() {
	let note = NoteFields {
		invalid_frontmatter: Some("tags: [unterminated".to_string()),
		..fields(&["ignored"], json!({}))
	};

	assert_eq!(
		compose(&note, "Body"),
		"---\ntags: [unterminated\n---\n\nBody"
	);
}

#[test]
fn splits_a_valid_file_into_body_and_tags() {
	let content = compose(&fields(&["one", "two"], json!({})), "Body");

	assert_eq!(
		decompose(&content),
		Decomposed {
			body: "Body".to_string(),
			tags: Some(vec!["one".into(), "two".into()]),
			properties: Some(Map::new()),
			invalid_frontmatter: None,
			raw_frontmatter: Some("tags:\n  - one\n  - two".to_string()),
		}
	);
}

#[test]
fn returns_no_tags_and_the_raw_block_when_the_yaml_is_invalid() {
	assert_eq!(
		decompose("---\ntags: [unterminated\n---\n\nBody"),
		Decomposed {
			body: "Body".to_string(),
			invalid_frontmatter: Some("tags: [unterminated".to_string()),
			..Decomposed::default()
		}
	);
}

#[test]
fn returns_empty_tags_when_there_is_no_frontmatter_block() {
	assert_eq!(
		decompose("Just text"),
		Decomposed {
			body: "Just text".to_string(),
			tags: Some(Vec::new()),
			properties: Some(Map::new()),
			invalid_frontmatter: None,
			raw_frontmatter: None,
		}
	);
}

#[test]
fn keeps_the_yaml_comments_of_the_raw_block() {
	let content = "---\ntags:\n  - one # keep\n---\n\nBody";

	assert_eq!(
		decompose(content).raw_frontmatter.as_deref(),
		Some("tags:\n  - one # keep")
	);
}

#[test]
fn round_trips_invalid_frontmatter_through_compose_and_decompose() {
	let note = NoteFields {
		invalid_frontmatter: Some("a: [".to_string()),
		..NoteFields::default()
	};

	assert_eq!(
		decompose(&compose(&note, "Body"))
			.invalid_frontmatter
			.as_deref(),
		Some("a: [")
	);
}

#[test]
fn splits_comma_separated_tags_and_aliases() {
	let content = "---\ntags: a, b\naliases:\n  - Alias\n---\n\nBody";

	assert_eq!(
		decompose(content),
		Decomposed {
			body: "Body".to_string(),
			tags: Some(vec!["a".into(), "b".into()]),
			properties: Some(object(json!({ "aliases": ["Alias"] }))),
			invalid_frontmatter: None,
			raw_frontmatter: Some("tags: a, b\naliases:\n  - Alias".to_string()),
		}
	);
}
