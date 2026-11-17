use engine::syntax::{inline_tags, parse_note};

#[test]
fn reads_list_tags_from_the_frontmatter() {
	let note = parse_note("---\ntags:\n  - one\n  - Two\n---\n\nBody");

	assert_eq!(note.tags, ["one", "Two"]);
}

#[test]
fn splits_a_string_tags_value_on_commas_and_spaces() {
	assert_eq!(parse_note("---\ntags: a, b c\n---\n").tags, ["a", "b", "c"]);
}

#[test]
fn reads_the_singular_tag_key_and_keeps_it_out_of_the_property_keys() {
	let note = parse_note("---\ntag: solo\nstatus: open\n---\n");

	assert_eq!(note.tags, ["solo"]);
	assert_eq!(note.property_keys, ["status"]);
}

#[test]
fn drops_tags_made_only_of_digits_and_sanitizes_the_rest() {
	let note = parse_note("---\ntags: ['#hash', ' sp ace ', 'a/b/', 2024, v2]\n---\n");

	assert_eq!(note.tags, ["hash", "sp-ace", "a/b", "v2"]);
}

#[test]
fn deduplicates_tags_ignoring_case() {
	let text = "---\ntags: [Work, work]\n---\n\n#WORK #other";

	assert_eq!(parse_note(text).tags, ["Work", "WORK", "other"]);
	assert_eq!(inline_tags(text), ["WORK", "other"]);
}

#[test]
fn marks_a_malformed_frontmatter_as_invalid() {
	let note = parse_note("---\ntags: [a, b\n---\n\nBody");

	assert!(note.invalid_frontmatter);
	assert!(note.tags.is_empty());
}

#[test]
fn marks_duplicate_keys_as_invalid() {
	assert!(parse_note("---\na: 1\na: 2\n---\n").invalid_frontmatter);
}

#[test]
fn marks_a_frontmatter_that_is_not_a_map_as_invalid() {
	assert!(parse_note("---\n- a\n- b\n---\n").invalid_frontmatter);
}

#[test]
fn keeps_dates_as_plain_properties_without_failing() {
	let note = parse_note("---\ndate: 2024-01-05\ncreated: 2024-01-05T10:20:30Z\n---\n");

	assert!(!note.invalid_frontmatter);
	assert_eq!(note.property_keys, ["date", "created"]);
}

#[test]
fn treats_yes_and_no_as_plain_strings() {
	let note = parse_note("---\nyes: yes\nno: no\n---\n");

	assert!(!note.invalid_frontmatter);
	assert_eq!(note.property_keys, ["yes", "no"]);
}

#[test]
fn accepts_windows_line_endings() {
	let note = parse_note("---\r\ntags: [a]\r\n---\r\n\r\nBody");

	assert_eq!(note.tags, ["a"]);
	assert!(note.content.trim().ends_with("Body"));
}

#[test]
fn ignores_a_block_that_is_never_closed() {
	let text = "---\ntags: [a]\n\nBody";
	let note = parse_note(text);

	assert!(note.tags.is_empty());
	assert_eq!(note.content, text);
}

#[test]
fn finds_inline_tags_and_trims_trailing_slashes() {
	assert_eq!(
		parse_note("Intro #one and #two/ and #123 and a#nope").tags,
		["one", "two"]
	);
}

#[test]
fn ignores_inline_tags_inside_code() {
	let note = parse_note("Text `#inline` and\n\n```\n#fenced\n```\n\n#real");

	assert_eq!(note.tags, ["real"]);
}

#[test]
fn extracts_wiki_link_targets_and_skips_code() {
	let text = "See [[Alpha]] and [[Beta|alias]] and `[[Code]]`\n\n```\n[[Fenced]]\n```\n\n[[Gamma#Heading]]";

	assert_eq!(parse_note(text).links, ["Alpha", "Beta", "Gamma#Heading"]);
}

#[test]
fn returns_empty_lists_for_a_plain_note() {
	let note = parse_note("Just text");

	assert!(note.tags.is_empty());
	assert!(note.links.is_empty());
	assert!(note.property_keys.is_empty());
	assert!(!note.invalid_frontmatter);
}

#[test]
fn keeps_the_raw_frontmatter_in_the_searchable_content() {
	let note = parse_note("---\ntags: [a]\nstatus: open\n---\n\nBody");

	assert_eq!(note.content, "tags: [a]\nstatus: open\nBody");
}

#[test]
fn keeps_the_raw_text_of_an_invalid_frontmatter_in_the_searchable_content() {
	let note = parse_note("---\ntags: [a, b\n---\n\nBody");

	assert!(note.content.starts_with("tags: [a, b\n"));
	assert!(note.content.ends_with("Body"));
}

#[test]
fn uses_only_the_body_as_content_when_there_is_no_frontmatter() {
	assert_eq!(parse_note("Just text").content, "Just text");
}

#[test]
fn ignores_wiki_links_and_tags_after_an_unclosed_fence() {
	let note = parse_note("#a\n```\n#b [[c]]");

	assert_eq!(note.tags, ["a"]);
	assert!(note.links.is_empty());
}

#[test]
fn keeps_links_after_an_unclosed_inline_backtick() {
	assert_eq!(parse_note("` [[a]]").links, ["a"]);
}
