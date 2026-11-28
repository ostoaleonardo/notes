use engine::links::{
	Candidate, FolderPathByNote, LinkNote, NoteIndex, find_backlinks, rename_links,
};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

struct Fixture {
	notes: Vec<LinkNote>,
	folders: FolderPathByNote,
	moved: FolderPathByNote,
	self_path: String,
	raw: Value,
}

fn paths(value: &Value) -> FolderPathByNote {
	value
		.as_object()
		.unwrap()
		.iter()
		.map(|(key, folder)| (key.clone(), folder.as_str().unwrap().to_string()))
		.collect()
}

fn fixture(section: Option<&str>) -> Fixture {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/links.json");
	let whole: Value = serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap();
	let raw = match section {
		Some(name) => whole[name].clone(),
		None => whole,
	};

	let notes = raw["notes"]
		.as_array()
		.unwrap()
		.iter()
		.map(|note| LinkNote {
			path: note["path"].as_str().unwrap().to_string(),
			title: note["title"].as_str().unwrap().to_string(),
			aliases: note["aliases"]
				.as_array()
				.unwrap()
				.iter()
				.map(|alias| alias.as_str().unwrap().to_string())
				.collect(),
		})
		.collect();

	Fixture {
		notes,
		folders: paths(&raw["folders"]),
		moved: paths(&raw["movedFolders"]),
		self_path: raw["self"].as_str().unwrap().to_string(),
		raw,
	}
}

#[test]
fn resolves_links_like_the_javascript_resolver() {
	check_resolutions(&fixture(None));
	check_resolutions(&fixture(Some("random")));
}

fn check_resolutions(data: &Fixture) {
	let index = NoteIndex::new(&data.notes);

	for case in data.raw["resolutions"].as_array().unwrap() {
		let text = case["text"].as_str().unwrap();
		let resolved = index.resolve(text, &data.folders, Some(&data.self_path));

		assert_eq!(
			resolved.note.map(|position| position as i64),
			case["note"].as_i64(),
			"note for {text:?}"
		);
		assert_eq!(
			resolved.target,
			case["target"].as_str().unwrap(),
			"target for {text:?}"
		);
		assert_eq!(
			resolved.anchor,
			case["anchor"].as_str().unwrap(),
			"anchor for {text:?}"
		);
	}
}

#[test]
fn renames_links_like_the_javascript_renamer() {
	check_renames(&fixture(None));
	check_renames(&fixture(Some("random")));
}

fn check_renames(data: &Fixture) {
	let index = NoteIndex::new(&data.notes);

	for case in data.raw["renames"].as_array().unwrap() {
		let content = case["content"].as_str().unwrap();
		let target = case["target"].as_str().unwrap();
		let title = case["title"].as_str().unwrap();

		assert_eq!(
			rename_links(content, target, title, &index, &data.folders, &data.folders),
			case["plain"].as_str().unwrap(),
			"plain rename of {content:?}"
		);
		assert_eq!(
			rename_links(content, target, title, &index, &data.moved, &data.folders),
			case["moved"].as_str().unwrap(),
			"moved rename of {content:?}"
		);
	}
}

fn note(path: &str, title: &str, aliases: &[&str]) -> LinkNote {
	LinkNote {
		path: path.to_string(),
		title: title.to_string(),
		aliases: aliases.iter().map(|alias| alias.to_string()).collect(),
	}
}

fn backlinks_of(
	target: &str,
	notes: &[LinkNote],
	folders: &FolderPathByNote,
	bodies: &[(&str, &str)],
) -> Vec<String> {
	let index = NoteIndex::new(notes);
	let candidates: Vec<Candidate<'_>> = bodies
		.iter()
		.map(|(path, body)| Candidate { path, body })
		.collect();

	find_backlinks(target, &index, folders, &candidates)
		.into_iter()
		.map(str::to_string)
		.collect()
}

fn grocery_notes() -> Vec<LinkNote> {
	vec![
		note("target", "Grocery List", &[]),
		note("a", "Recipe", &[]),
		note("b", "Other", &[]),
		note("c", "Alias Note", &[]),
	]
}

const GROCERY_BODIES: [(&str, &str); 4] = [
	("target", "Some content."),
	("a", "See [[Grocery List]] for what to buy."),
	("b", "No links here."),
	("c", "Mentions [[grocery list|itself]] via alias."),
];

#[test]
fn finds_notes_that_link_to_the_target_ignoring_case() {
	let found = backlinks_of(
		"target",
		&grocery_notes(),
		&FolderPathByNote::new(),
		&GROCERY_BODIES,
	);

	assert_eq!(found, ["a", "c"]);
}

#[test]
fn never_includes_the_target_itself() {
	let bodies = [("target", "[[Grocery List]]")];

	assert!(
		backlinks_of(
			"target",
			&grocery_notes(),
			&FolderPathByNote::new(),
			&bodies
		)
		.is_empty()
	);
}

#[test]
fn finds_nothing_when_no_note_links_to_the_target() {
	let found = backlinks_of(
		"unlinked-path",
		&grocery_notes(),
		&FolderPathByNote::new(),
		&GROCERY_BODIES,
	);

	assert!(found.is_empty());
}

#[test]
fn follows_a_renamed_target() {
	let mut notes = grocery_notes();
	notes[0].title = "Shopping".to_string();

	let found = backlinks_of("target", &notes, &FolderPathByNote::new(), &GROCERY_BODIES);

	assert!(found.is_empty());
}

#[test]
fn counts_heading_and_alias_links() {
	let notes = vec![
		note("target", "Grocery List", &["Sync"]),
		note("a", "Recipe", &[]),
		note("b", "Other", &[]),
	];
	let bodies = [("a", "See [[Grocery List#Fruit]]"), ("b", "See [[Sync]]")];

	let found = backlinks_of("target", &notes, &FolderPathByNote::new(), &bodies);

	assert_eq!(found, ["a", "b"]);
}

#[test]
fn counts_markdown_internal_links() {
	let bodies = [
		(
			"a",
			"See [Grocery List](wikilink://target) for what to buy.",
		),
		("b", "See [something](wikilink://other-path) instead."),
	];

	let found = backlinks_of(
		"target",
		&grocery_notes(),
		&FolderPathByNote::new(),
		&bodies,
	);

	assert_eq!(found, ["a"]);
}

#[test]
fn only_counts_links_that_resolve_to_the_note_in_the_right_folder() {
	let notes = vec![
		note("root-test", "Test", &[]),
		note("sub-test", "Test", &[]),
		note("linker", "Linker", &[]),
	];
	let folders: FolderPathByNote = [
		("root-test".to_string(), String::new()),
		("sub-test".to_string(), "one".to_string()),
	]
	.into_iter()
	.collect();
	let bodies = [("linker", "See [[one/Test]] for details")];

	assert_eq!(
		backlinks_of("sub-test", &notes, &folders, &bodies),
		["linker"]
	);
	assert!(backlinks_of("root-test", &notes, &folders, &bodies).is_empty());
}

#[test]
fn scans_wiki_targets_like_the_regular_expression() {
	use engine::links::wiki_targets;
	use regex::Regex;

	let pattern = Regex::new(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]").unwrap();
	let alphabet = ['[', ']', '|', 'a', ' ', '#', 'é'];
	let mut state: u64 = 7;
	let mut next = || {
		state = state
			.wrapping_mul(6364136223846793005)
			.wrapping_add(1442695040888963407);
		(state >> 33) as usize
	};

	for _ in 0..20000 {
		let length = next() % 14;
		let text: String = (0..length)
			.map(|_| alphabet[next() % alphabet.len()])
			.collect();
		let expected: Vec<&str> = pattern
			.captures_iter(&text)
			.map(|captures| captures.get(1).unwrap().as_str())
			.collect();

		assert_eq!(wiki_targets(&text), expected, "text {text:?}");
	}
}

fn folders_of(entries: &[(&str, &str)]) -> FolderPathByNote {
	entries
		.iter()
		.map(|(path, folder)| (path.to_string(), folder.to_string()))
		.collect()
}

fn renamed(
	content: &str,
	target: &str,
	title: &str,
	notes: &[LinkNote],
	folders: &FolderPathByNote,
) -> String {
	let index = NoteIndex::new(notes);

	rename_links(content, target, title, &index, folders, folders)
}

#[test]
fn renames_a_link_that_resolves_to_the_target() {
	let notes = [note("target", "Grocery List", &[])];
	let folders = FolderPathByNote::new();

	assert_eq!(
		renamed(
			"See [[Grocery List]] for details",
			"target",
			"Shopping List",
			&notes,
			&folders
		),
		"See [[Shopping List]] for details"
	);
	assert_eq!(
		renamed(
			"See [[Grocery List|the list]] here",
			"target",
			"Shopping List",
			&notes,
			&folders
		),
		"See [[Shopping List|the list]] here"
	);
	assert_eq!(
		renamed(
			"[[grocery list]]",
			"target",
			"Shopping List",
			&notes,
			&folders
		),
		"[[Shopping List]]"
	);
}

#[test]
fn keeps_the_anchor_when_renaming() {
	let notes = [note("target", "Grocery List", &[])];

	assert_eq!(
		renamed(
			"[[Grocery List#Fruit]] and [[Grocery List#^b1|block]]",
			"target",
			"Shopping List",
			&notes,
			&FolderPathByNote::new()
		),
		"[[Shopping List#Fruit]] and [[Shopping List#^b1|block]]"
	);
}

#[test]
fn leaves_links_to_other_notes_unchanged() {
	let notes = [
		note("target", "Grocery List", &[]),
		note("other", "Meeting Notes", &[]),
	];

	assert_eq!(
		renamed(
			"[[Meeting Notes]]",
			"target",
			"Shopping List",
			&notes,
			&FolderPathByNote::new()
		),
		"[[Meeting Notes]]"
	);
}

#[test]
fn leaves_a_same_titled_note_in_another_folder_unchanged() {
	let notes = [
		note("root-test", "Test", &[]),
		note("sub-test", "Test", &[]),
	];
	let folders = folders_of(&[("root-test", ""), ("sub-test", "one")]);

	assert_eq!(
		renamed(
			"Links to [[Test]] and [[one/Test]]",
			"root-test",
			"Renamed",
			&notes,
			&folders
		),
		"Links to [[Renamed]] and [[one/Test]]"
	);
}

#[test]
fn qualifies_with_the_folder_when_the_new_title_collides() {
	let notes = [note("sub-test", "Test", &[]), note("other", "Fold", &[])];

	assert_eq!(
		renamed(
			"See [[Test]] here",
			"sub-test",
			"Fold",
			&notes,
			&folders_of(&[("sub-test", "one"), ("other", "")])
		),
		"See [[one/Fold|Fold]] here"
	);
	assert_eq!(
		renamed(
			"See [[Test]] here",
			"sub-test",
			"Fold",
			&[note("sub-test", "Test", &[]), note("other", "Fold", &[])],
			&folders_of(&[("sub-test", ""), ("other", "")])
		),
		"See [[Fold]] here"
	);
}

#[test]
fn does_not_rewrite_links_that_matched_through_an_alias() {
	let notes = [
		note("note-1", "Meeting Notes", &["Standup", "Sync"]),
		note("note-2", "Standup", &[]),
	];

	assert_eq!(
		renamed(
			"[[Sync]] and [[Meeting Notes]]",
			"note-1",
			"Retro",
			&notes,
			&FolderPathByNote::new()
		),
		"[[Sync]] and [[Retro]]"
	);
}
