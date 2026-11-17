use engine::model::{FileMeta, ScannedFile};
use engine::reconcile::plan;
use std::collections::HashMap;

fn file(name: &str, modified: i64, size: i64) -> ScannedFile {
	ScannedFile {
		filename: name.to_string(),
		modified,
		size,
	}
}

fn known(names: &[&str]) -> HashMap<String, FileMeta> {
	names
		.iter()
		.map(|name| {
			(
				name.to_string(),
				FileMeta {
					modified: 1,
					size: 1,
				},
			)
		})
		.collect()
}

#[test]
fn parses_every_file_when_the_index_is_empty() {
	let result = plan(&HashMap::new(), &[file("a.md", 1, 1), file("b.md", 1, 1)]);

	assert_eq!(result.added, 2);
	assert_eq!(result.changed, [0, 1]);
	assert_eq!(result.unchanged, 0);
}

#[test]
fn skips_files_whose_modified_time_and_size_match() {
	let result = plan(&known(&["a.md"]), &[file("a.md", 1, 1)]);

	assert!(result.changed.is_empty());
	assert_eq!(result.unchanged, 1);
}

#[test]
fn reparses_a_file_when_its_modified_time_changes() {
	let result = plan(&known(&["a.md"]), &[file("a.md", 2, 1)]);

	assert_eq!(result.updated, 1);
	assert_eq!(result.changed, [0]);
}

#[test]
fn reparses_a_file_when_its_size_changes() {
	assert_eq!(plan(&known(&["a.md"]), &[file("a.md", 1, 9)]).updated, 1);
}

#[test]
fn removes_indexed_files_that_are_no_longer_on_disk() {
	let result = plan(&known(&["a.md", "gone.md"]), &[file("a.md", 1, 1)]);

	assert_eq!(result.removed, ["gone.md"]);
	assert_eq!(result.unchanged, 1);
}

#[test]
fn handles_added_updated_removed_and_unchanged_files_together() {
	let result = plan(
		&known(&["keep.md", "edit.md", "gone.md"]),
		&[
			file("keep.md", 1, 1),
			file("edit.md", 5, 1),
			file("new.md", 1, 1),
		],
	);

	assert_eq!(result.added, 1);
	assert_eq!(result.updated, 1);
	assert_eq!(result.unchanged, 1);
	assert_eq!(result.removed, ["gone.md"]);
}
