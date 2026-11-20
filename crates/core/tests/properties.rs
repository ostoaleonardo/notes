use engine::links::wiki_targets;
use engine::syntax::{
	NoteFields, compose, decompose, inline_tags, normalize, parse_note, wiki_links,
};
use engine::versions::{apply_line_delta, build_line_delta};
use proptest::prelude::*;

const MARKDOWN_PIECES: &[&str] = &[
	"[[",
	"]]",
	"[",
	"]",
	"|",
	"#",
	"##",
	"---",
	"\n",
	"\r\n",
	" ",
	"`",
	"```",
	"~~~",
	"\\",
	"![[",
	"^",
	">",
	"-",
	"*",
	"tag",
	"#tag",
	"a/b",
	"é",
	"日本",
	"😀",
	":",
	"\"",
	"'",
	"{",
	"}",
	"%",
	"title: x",
	"tags: [a, b]",
	"\t",
	"\u{0}",
	"\u{feff}",
];

fn markdown() -> impl Strategy<Value = String> {
	prop::collection::vec(prop::sample::select(MARKDOWN_PIECES), 0..60)
		.prop_map(|pieces| pieces.concat())
}

fn lines() -> impl Strategy<Value = String> {
	prop::collection::vec("[a-c]{0,3}", 0..25).prop_map(|lines| lines.join("\n"))
}

proptest! {
	#![proptest_config(ProptestConfig::with_cases(2000))]

	#[test]
	fn parsing_never_panics_on_arbitrary_text(text in any::<String>()) {
		let _ = parse_note(&text);
		let _ = inline_tags(&text);
		let _ = wiki_links(&text);
		let _ = wiki_targets(&text);
		let _ = decompose(&text);
	}

	#[test]
	fn parsing_never_panics_on_markdown_like_text(text in markdown()) {
		let _ = parse_note(&text);
		let _ = decompose(&text);
		let _ = wiki_targets(&text);
	}

	#[test]
	fn composing_a_decomposed_note_keeps_its_body(text in markdown()) {
		let parts = decompose(&text);
		let fields = NoteFields {
			tags: parts.tags.clone().unwrap_or_default(),
			properties: parts.properties.clone().unwrap_or_default(),
			invalid_frontmatter: parts.invalid_frontmatter.clone(),
			raw_frontmatter: parts.raw_frontmatter.clone(),
		};
		let again = decompose(&compose(&fields, &parts.body));

		prop_assert_eq!(again.body, parts.body);
		prop_assert_eq!(again.tags, parts.tags);
		prop_assert_eq!(again.properties, parts.properties);
	}

	#[test]
	fn a_line_delta_rebuilds_the_new_text(from in lines(), to in lines()) {
		let delta = build_line_delta(&from, &to);

		prop_assert_eq!(apply_line_delta(&from, &delta), to);
	}

	#[test]
	fn the_delta_between_equal_texts_is_empty(text in lines()) {
		prop_assert!(build_line_delta(&text, &text).is_empty());
	}

	#[test]
	fn normalizing_a_link_name_twice_changes_nothing(text in any::<String>()) {
		let once = normalize(&text);

		prop_assert_eq!(normalize(&once), once);
	}
}
