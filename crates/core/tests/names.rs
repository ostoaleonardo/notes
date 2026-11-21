use engine::names::{
	has_link_breaking_chars, name_key, names_collide, sanitize_filename, unique_name,
};
use proptest::prelude::*;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

const EXTENSION: &str = ".md";
const MAX_FILE_BYTES: usize = 255;
const UNIQUE_RESERVE_BYTES: usize = 8;
const ILLEGAL: &str = "/\\:*?\"<>|";
const LAST_CONTROL: char = '\u{1f}';

fn has_illegal_characters(name: &str) -> bool {
	name.chars()
		.any(|character| ILLEGAL.contains(character) || character <= LAST_CONTROL)
}

fn fixture() -> Vec<(String, String)> {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/filenames.json");
	let cases: Vec<Value> = serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap();

	cases
		.iter()
		.map(|case| {
			(
				case["title"].as_str().unwrap().to_string(),
				case["filename"].as_str().unwrap().to_string(),
			)
		})
		.collect()
}

fn names(items: &[&str]) -> Vec<String> {
	items.iter().map(ToString::to_string).collect()
}

#[test]
fn ordinary_titles_keep_the_name_the_app_gave_them_before() {
	for (title, filename) in fixture() {
		assert_eq!(
			sanitize_filename(&title, EXTENSION),
			filename,
			"title {title:?}"
		);
	}
}

#[test]
fn trailing_dots_and_spaces_are_removed() {
	assert_eq!(sanitize_filename("Nota.", EXTENSION), "Nota");
	assert_eq!(sanitize_filename("Nota . ", EXTENSION), "Nota");
	assert_eq!(sanitize_filename("a. .", EXTENSION), "a");
	assert_eq!(sanitize_filename("...", EXTENSION), "Untitled");
}

#[test]
fn reserved_device_names_get_an_underscore_after_the_device_part() {
	assert_eq!(sanitize_filename("CON", EXTENSION), "CON_");
	assert_eq!(sanitize_filename("con", EXTENSION), "con_");
	assert_eq!(sanitize_filename("Nul", EXTENSION), "Nul_");
	assert_eq!(sanitize_filename("COM1", EXTENSION), "COM1_");
	assert_eq!(sanitize_filename("lpt9", EXTENSION), "lpt9_");
	assert_eq!(sanitize_filename("con.backup", EXTENSION), "con_.backup");
}

#[test]
fn names_that_only_look_reserved_are_left_alone() {
	for title in [
		"COM0",
		"COM10",
		"CONSOLE",
		"AUXILIARY",
		"NULL",
		"LPT",
		"my CON",
	] {
		assert_eq!(sanitize_filename(title, EXTENSION), title);
	}
}

#[test]
fn long_titles_are_cut_by_bytes_on_a_character_boundary() {
	let cut = sanitize_filename(&"日".repeat(300), EXTENSION);

	assert!(cut.len() <= 244);
	assert!(cut.chars().all(|character| character == '日'));
	assert!(format!("{cut} (9999){EXTENSION}").len() <= MAX_FILE_BYTES);
}

#[test]
fn titles_are_normalized_to_composed_form() {
	assert_eq!(sanitize_filename("e\u{301}", EXTENSION), "\u{e9}");
}

#[test]
fn byte_order_marks_and_surrounding_whitespace_are_trimmed() {
	assert_eq!(sanitize_filename("\u{feff}  Title  ", EXTENSION), "Title");
}

#[test]
fn names_differing_only_in_case_or_normalization_collide() {
	assert!(names_collide("Nota", "nota"));
	assert!(names_collide("\u{e9}", "e\u{301}"));
	assert!(names_collide("\u{c9}", "e\u{301}"));
	assert!(!names_collide("a", "b"));
	assert_eq!(name_key("Nota"), "nota");
}

#[test]
fn unique_names_count_up_from_two() {
	assert_eq!(unique_name(&[], "a", EXTENSION, None), "a.md");
	assert_eq!(
		unique_name(&names(&["a.md"]), "a", EXTENSION, None),
		"a (2).md"
	);
	assert_eq!(
		unique_name(&names(&["a.md", "a (2).md"]), "a", EXTENSION, None),
		"a (3).md"
	);
}

#[test]
fn unique_names_ignore_case_and_normalization_when_checking() {
	assert_eq!(
		unique_name(&names(&["A.md"]), "a", EXTENSION, None),
		"a (2).md"
	);
	assert_eq!(
		unique_name(&names(&["e\u{301}.md"]), "\u{e9}", EXTENSION, None),
		"\u{e9} (2).md"
	);
}

#[test]
fn a_note_may_keep_or_re_case_its_own_name() {
	let existing = names(&["Nota.md"]);

	assert_eq!(
		unique_name(&existing, "Nota", EXTENSION, Some("Nota.md")),
		"Nota.md"
	);
	assert_eq!(
		unique_name(&existing, "nota", EXTENSION, Some("Nota.md")),
		"nota.md"
	);
}

#[test]
fn link_breaking_characters_are_detected() {
	for title in ["a#b", "a^b", "a[b", "a]b"] {
		assert!(has_link_breaking_chars(title), "{title:?}");
	}

	assert!(!has_link_breaking_chars("plain title"));
}

proptest! {
	#![proptest_config(ProptestConfig::with_cases(3000))]

	#[test]
	fn a_sanitized_name_is_always_usable(title in any::<String>()) {
		let name = sanitize_filename(&title, EXTENSION);

		prop_assert!(!name.is_empty());
		prop_assert!(name.len() <= MAX_FILE_BYTES - EXTENSION.len() - UNIQUE_RESERVE_BYTES + 1);
		prop_assert!(!has_illegal_characters(&name));
		prop_assert!(!name.ends_with(['.', ' ']));
		prop_assert_eq!(&name, name.trim());
	}

	#[test]
	fn sanitizing_twice_changes_nothing(title in any::<String>()) {
		let once = sanitize_filename(&title, EXTENSION);

		prop_assert_eq!(sanitize_filename(&once, EXTENSION), once);
	}

	#[test]
	fn a_unique_name_never_collides_with_an_existing_one(
		existing in prop::collection::vec("[a-cA-C ()0-9]{0,4}", 0..8)
	) {
		let existing: Vec<String> = existing.iter().map(|name| format!("{name}.md")).collect();
		let chosen = unique_name(&existing, "a", EXTENSION, None);

		prop_assert!(!existing.iter().any(|name| names_collide(name, &chosen)));
	}
}
