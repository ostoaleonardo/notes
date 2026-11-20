use engine::links::{Candidate, FolderPaths, LinkNote, NoteIndex, find_backlinks, rename_links};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

struct Fixture {
	notes: Vec<LinkNote>,
	folders: FolderPaths,
	moved: FolderPaths,
	self_path: String,
	raw: Value,
}

fn paths(value: &Value) -> FolderPaths {
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

#[test]
fn finds_backlinks_like_the_javascript_verifier() {
	let whole = fixture(None);
	let data = fixture(Some("random"));
	let index = NoteIndex::new(&data.notes);
	let bodies = whole.raw["backlinks"]["bodies"].as_object().unwrap();

	let candidates: Vec<Candidate<'_>> = data
		.notes
		.iter()
		.map(|note| Candidate {
			path: note.path.as_str(),
			body: bodies[&note.path].as_str().unwrap(),
		})
		.collect();

	for case in whole.raw["backlinks"]["results"].as_array().unwrap() {
		let target = case["target"].as_str().unwrap();
		let expected: Vec<&str> = case["found"]
			.as_array()
			.unwrap()
			.iter()
			.map(|path| path.as_str().unwrap())
			.collect();

		assert_eq!(
			find_backlinks(target, &index, &data.folders, &candidates),
			expected,
			"backlinks of {target}"
		);
	}
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
