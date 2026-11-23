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
				max_age_ms: 0,
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
				max_age_ms: 0,
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

const DAY_MS: i64 = 86_400_000;

fn commit_at(raw: Option<String>, number: i64, created_at: i64, max_age_ms: i64) -> Option<String> {
	let id = format!("id-{number}");
	let content = format!("line {number}");

	commit_version(
		raw.as_deref(),
		&NewVersion {
			id: &id,
			title: "T",
			created_at,
			content: &content,
			max_versions: MAX_VERSIONS,
			max_age_ms,
		},
	)
	.unwrap()
}

fn kept_ids(raw: &str) -> Vec<String> {
	let store: Value = serde_json::from_str(raw).unwrap();

	store["entries"]
		.as_array()
		.unwrap()
		.iter()
		.map(|entry| entry["id"].as_str().unwrap().to_string())
		.collect()
}

#[test]
fn drops_versions_older_than_the_retention_period() {
	let mut raw = None;

	for (number, day) in [(0, 0), (1, 3), (2, 6), (3, 9)] {
		raw = commit_at(raw, number, day * DAY_MS, 7 * DAY_MS);
	}

	assert_eq!(kept_ids(&raw.unwrap()), ["id-1", "id-2", "id-3"]);
}

#[test]
fn keeps_every_version_when_there_is_no_retention_period() {
	let mut raw = None;

	for (number, day) in [(0, 0), (1, 400), (2, 800)] {
		raw = commit_at(raw, number, day * DAY_MS, 0);
	}

	assert_eq!(kept_ids(&raw.unwrap()), ["id-0", "id-1", "id-2"]);
}

#[test]
fn always_keeps_the_newest_version_even_when_it_is_older_than_the_period() {
	let raw = commit_at(None, 0, 0, DAY_MS);
	let raw = commit_at(raw, 1, 30 * DAY_MS, DAY_MS);

	assert_eq!(kept_ids(&raw.unwrap()), ["id-1"]);
}

#[test]
fn still_rebuilds_older_versions_after_dropping_the_oldest() {
	let mut raw = None;

	for (number, day) in [(0, 0), (1, 3), (2, 6), (3, 9)] {
		raw = commit_at(raw, number, day * DAY_MS, 7 * DAY_MS);
	}

	let store: Value = serde_json::from_str(&raw.unwrap()).unwrap();
	let entries = store["entries"].as_array().unwrap();
	let mut text = store["head"].as_str().unwrap().to_string();

	assert_eq!(text, "line 3");

	for entry in entries[..entries.len() - 1].iter().rev() {
		let delta: Vec<Hunk> = entry["delta"]
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
			.collect();

		text = apply_line_delta(&text, &delta);
	}

	assert_eq!(text, "line 1");
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

mod repository {
	use engine::repository::FsRepository;
	use engine::versions::RepositoryVersions;
	use serde_json::Value;
	use std::fs;
	use std::sync::Arc;
	use tempfile::TempDir;

	const MAX: usize = 200;

	fn setup() -> (TempDir, Arc<FsRepository>) {
		let directory = TempDir::new().unwrap();
		let repository = Arc::new(FsRepository::new(directory.path()));

		(directory, repository)
	}

	fn commit(
		versions: &RepositoryVersions,
		key: &str,
		title: &str,
		content: &str,
		id: &str,
	) -> bool {
		versions.commit(key, title, content, id, 1, MAX, 0).unwrap()
	}

	fn names(directory: &TempDir) -> Vec<String> {
		let mut found: Vec<String> = fs::read_dir(directory.path().join(".notes"))
			.map(|entries| {
				entries
					.map(|entry| entry.unwrap().file_name().into_string().unwrap())
					.collect()
			})
			.unwrap_or_default();

		found.sort();
		found
	}

	#[test]
	fn names_files_like_encode_uri_component() {
		let (directory, repository) = setup();
		let versions = RepositoryVersions::new(repository);

		for case in super::fixture()["filenames"].as_array().unwrap() {
			let key = case["key"].as_str().unwrap();

			versions.write(key, "[]").unwrap();

			let expected = format!("{}.versions.json", case["encoded"].as_str().unwrap());

			assert!(names(&directory).contains(&expected), "file for {key:?}");
		}
	}

	#[test]
	fn commits_and_reads_versions_back() {
		let (_directory, repository) = setup();
		let versions = RepositoryVersions::new(repository);

		assert!(commit(&versions, "Folder/Note.md", "T", "one", "a"));
		assert!(!commit(&versions, "Folder/Note.md", "T", "one", "b"));
		assert!(commit(&versions, "Folder/Note.md", "T", "one\ntwo", "c"));

		let store: Value =
			serde_json::from_str(&versions.read("Folder/Note.md").unwrap().unwrap()).unwrap();

		assert_eq!(store["head"], "one\ntwo");
		assert_eq!(store["entries"].as_array().unwrap().len(), 2);
	}

	#[test]
	fn renames_a_store_and_ignores_missing_or_empty_ones() {
		let (directory, repository) = setup();
		let versions = RepositoryVersions::new(repository);

		commit(&versions, "Old.md", "T", "text", "a");
		versions.rename("Old.md", "New.md").unwrap();
		versions.rename("Missing.md", "Other.md").unwrap();
		versions
			.write("Empty.md", r#"{"head":"","entries":[]}"#)
			.unwrap();
		versions.rename("Empty.md", "Moved.md").unwrap();

		let found = names(&directory);

		assert!(found.contains(&"New.md.versions.json".to_string()));
		assert!(!found.contains(&"Old.md.versions.json".to_string()));
		assert!(!found.contains(&"Other.md.versions.json".to_string()));
		assert!(found.contains(&"Empty.md.versions.json".to_string()));
		assert!(!found.contains(&"Moved.md.versions.json".to_string()));
	}

	#[test]
	fn renames_and_deletes_every_store_under_a_folder_prefix() {
		let (directory, repository) = setup();
		let versions = RepositoryVersions::new(repository);

		commit(&versions, "Work/A.md", "T", "a", "1");
		commit(&versions, "Work/Sub/B.md", "T", "b", "2");
		commit(&versions, "Workshop/C.md", "T", "c", "3");
		commit(&versions, "Año/D.md", "T", "d", "4");

		versions.rename_under("Work", "Job").unwrap();
		versions.rename_under("Año", "Year").unwrap();

		let found = names(&directory);

		assert!(found.contains(&"Job%2FA.md.versions.json".to_string()));
		assert!(found.contains(&"Job%2FSub%2FB.md.versions.json".to_string()));
		assert!(found.contains(&"Workshop%2FC.md.versions.json".to_string()));
		assert!(found.contains(&"Year%2FD.md.versions.json".to_string()));

		versions.delete_under("Job").unwrap();

		let remaining = names(&directory);

		assert!(!remaining.iter().any(|name| name.starts_with("Job")));
		assert!(remaining.contains(&"Workshop%2FC.md.versions.json".to_string()));
	}

	#[test]
	fn keeps_a_copy_of_a_corrupt_store_and_starts_over() {
		let (directory, repository) = setup();
		let versions = RepositoryVersions::new(repository);

		fs::create_dir_all(directory.path().join(".notes")).unwrap();
		fs::write(
			directory.path().join(".notes/Bad.md.versions.json"),
			"{ nope",
		)
		.unwrap();

		assert!(versions.read("Bad.md").unwrap().is_none());
		assert!(names(&directory).contains(&"Bad.md.versions.json.corrupt".to_string()));
		assert!(commit(&versions, "Bad.md", "T", "fresh", "a"));
	}

	#[test]
	fn moves_legacy_store_files_into_the_notes_folder() {
		let (directory, repository) = setup();
		let versions = RepositoryVersions::new(repository);

		fs::create_dir_all(directory.path().join("Folder")).unwrap();
		fs::write(
			directory.path().join("Folder/Old.md.versions.json"),
			r#"[{"id":"a","title":"T","createdAt":1,"content":"x"}]"#,
		)
		.unwrap();
		fs::write(directory.path().join("Folder/Note.md"), "body").unwrap();

		versions.migrate_legacy("Folder", "Folder").unwrap();

		assert!(
			!directory
				.path()
				.join("Folder/Old.md.versions.json")
				.exists()
		);
		assert!(directory.path().join("Folder/Note.md").exists());
		assert!(names(&directory).contains(&"Folder%2FOld.md.versions.json".to_string()));
	}
}
