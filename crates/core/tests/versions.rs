use engine::versions::{Hunk, NewVersion, apply_line_delta, build_line_delta, commit_version};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

const MAX_VERSIONS: usize = 200;

fn fixture() -> Value {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/versions.json");

	serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap()
}

fn hunks(value: &Value) -> Vec<Hunk> {
	value
		.as_array()
		.unwrap()
		.iter()
		.map(|hunk| Hunk {
			at: hunk["at"].as_u64().unwrap() as usize,
			remove: hunk["remove"].as_u64().unwrap() as usize,
			insert: hunk["insert"]
				.as_array()
				.unwrap()
				.iter()
				.map(|line| line.as_str().unwrap().to_string())
				.collect(),
		})
		.collect()
}

#[test]
fn builds_the_same_line_deltas_as_javascript() {
	for case in fixture()["deltas"].as_array().unwrap() {
		let from = case["from"].as_str().unwrap();
		let to = case["to"].as_str().unwrap();

		assert_eq!(
			build_line_delta(from, to),
			hunks(&case["delta"]),
			"delta {from:?} to {to:?}"
		);
	}
}

#[test]
fn applies_javascript_deltas_back_to_the_new_text() {
	for case in fixture()["deltas"].as_array().unwrap() {
		let from = case["from"].as_str().unwrap();
		let to = case["to"].as_str().unwrap();

		assert_eq!(apply_line_delta(from, &hunks(&case["delta"])), to);
		assert_eq!(apply_line_delta(from, &build_line_delta(from, to)), to);
	}
}

#[test]
fn commits_versions_like_the_javascript_store() {
	let data = fixture();
	let ids = data["ids"].as_array().unwrap();
	let mut next_id = 0;

	for (position, case) in data["commits"].as_array().unwrap().iter().enumerate() {
		let before = &case["before"];
		let raw =
			(!before.as_array().is_some_and(|items| items.is_empty())).then(|| before.to_string());
		let expected = &case["after"];
		let id = if expected.is_null() {
			"unused"
		} else {
			ids[next_id].as_str().unwrap()
		};

		let result = commit_version(
			raw.as_deref(),
			&NewVersion {
				id,
				title: case["title"].as_str().unwrap(),
				created_at: case["createdAt"].as_i64().unwrap(),
				content: case["content"].as_str().unwrap(),
				max_versions: MAX_VERSIONS,
			},
		)
		.unwrap();

		if !expected.is_null() {
			next_id += 1;
		}

		match (result, expected.is_null()) {
			(None, true) => {}
			(Some(written), false) => {
				let actual: Value = serde_json::from_str(&written).unwrap();

				assert_eq!(&actual, expected, "commit {position}");
			}
			(other, _) => panic!("commit {position}: unexpected {other:?}"),
		}
	}
}

#[test]
fn keeps_only_the_most_recent_versions() {
	let mut raw: Option<String> = None;

	for number in 0..205 {
		let id = format!("id-{number}");
		let content = format!("line {number}");

		raw = commit_version(
			raw.as_deref(),
			&NewVersion {
				id: &id,
				title: "T",
				created_at: number,
				content: &content,
				max_versions: MAX_VERSIONS,
			},
		)
		.unwrap();
	}

	let store: Value = serde_json::from_str(&raw.unwrap()).unwrap();
	let entries = store["entries"].as_array().unwrap();

	assert_eq!(entries.len(), MAX_VERSIONS);
	assert_eq!(entries[0]["id"], "id-5");
	assert_eq!(store["head"], "line 204");
}

#[test]
#[ignore]
fn times_a_delta_of_a_six_hundred_line_note() {
	let base: Vec<String> = (0..600)
		.map(|number| {
			format!(
				"Paragraph {number} with some text that is long enough to resemble real writing in a note."
			)
		})
		.collect();
	let edited: Vec<String> = base
		.iter()
		.enumerate()
		.map(|(number, line)| {
			if number % 2 == 0 {
				format!("{line} v1")
			} else {
				line.clone()
			}
		})
		.collect();

	let start = std::time::Instant::now();
	let delta = build_line_delta(&base.join("\n"), &edited.join("\n"));

	println!("delta {:?} hunks {}", start.elapsed(), delta.len());
}
