use engine::error::Error;
use engine::search::{Node, NoteView, Query};
use serde_json::{Map, Value};

fn matches(pattern: &str, content: &str, match_case: bool) -> bool {
	let query = Query::compile(&Node::Regex {
		pattern: pattern.to_string(),
	})
	.unwrap();
	let properties: Map<String, Value> = Map::new();

	query.matches(
		&NoteView {
			title: "T",
			filename: "t.md",
			folder: None,
			content,
			tags: &[],
			properties: &properties,
			pinned: false,
		},
		match_case,
	)
}

#[test]
fn supports_negative_lookbehind() {
	assert!(matches("(?<!x)y", "ay", false));
	assert!(!matches("(?<!x)y", "xy", false));
}

#[test]
fn supports_positive_lookbehind_and_lookahead() {
	assert!(matches("(?<=a)b", "ab", false));
	assert!(!matches("(?<=a)b", "cb", false));
	assert!(matches("a(?=b)", "ab", false));
	assert!(!matches("a(?!b)", "ab", false));
}

#[test]
fn supports_back_references() {
	assert!(matches(r"(a)\1", "aa", false));
	assert!(!matches(r"(a)\1", "ab", false));
}

#[test]
fn keeps_the_case_rules_of_the_search_for_look_around() {
	assert!(matches("(?<=A)b", "ab", false));
	assert!(!matches("(?<=A)b", "ab", true));
}

#[test]
fn rejects_a_pattern_that_neither_engine_accepts() {
	let result = Query::compile(&Node::Regex {
		pattern: "(".to_string(),
	});

	assert!(matches!(result, Err(Error::InvalidQuery(_))));
}
