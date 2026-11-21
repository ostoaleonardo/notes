use engine::error::Error;
use engine::repository::{
	DirEntry, FsRepository, MoveResult, RepositoryFiles, RepositoryOps, validate_name,
};
use std::fs;
use std::time::{Duration, UNIX_EPOCH};
use tempfile::TempDir;

fn repository() -> (TempDir, FsRepository) {
	let directory = TempDir::new().unwrap();
	let repository = FsRepository::new(directory.path());

	(directory, repository)
}

#[test]
fn exists_reports_files_and_directories() {
	let (_directory, repository) = repository();

	repository.create_dir("a/b").unwrap();
	repository.write_text("a/b/note.md", "x").unwrap();

	assert!(repository.exists("a").unwrap());
	assert!(repository.exists("a/b/note.md").unwrap());
	assert!(!repository.exists("a/missing").unwrap());
}

#[test]
fn creating_a_directory_twice_is_not_an_error() {
	let (_directory, repository) = repository();

	repository.create_dir("a/b").unwrap();
	repository.create_dir("a/b").unwrap();

	assert!(repository.exists("a/b").unwrap());
}

#[test]
fn renaming_a_directory_keeps_its_contents() {
	let (directory, repository) = repository();

	repository.write_text("old/inner/note.md", "text").unwrap();
	repository.rename_dir("old", "fresh").unwrap();

	assert!(!directory.path().join("old").exists());
	assert_eq!(
		fs::read_to_string(directory.path().join("fresh/inner/note.md")).unwrap(),
		"text"
	);
}

#[test]
fn renaming_a_nested_directory_stays_under_its_parent() {
	let (directory, repository) = repository();

	repository.write_text("parent/old/note.md", "text").unwrap();
	repository.rename_dir("parent/old", "fresh").unwrap();

	assert!(directory.path().join("parent/fresh/note.md").exists());
}

#[test]
fn renaming_onto_an_existing_directory_fails_and_changes_nothing() {
	let (directory, repository) = repository();

	repository.write_text("old/note.md", "old").unwrap();
	repository.write_text("taken/note.md", "taken").unwrap();

	assert!(matches!(
		repository.rename_dir("old", "taken"),
		Err(Error::AlreadyExists(_))
	));
	assert_eq!(
		fs::read_to_string(directory.path().join("old/note.md")).unwrap(),
		"old"
	);
	assert_eq!(
		fs::read_to_string(directory.path().join("taken/note.md")).unwrap(),
		"taken"
	);
}

#[test]
fn renaming_a_missing_directory_fails() {
	let (_directory, repository) = repository();

	assert!(matches!(
		repository.rename_dir("ghost", "fresh"),
		Err(Error::Io(_))
	));
}

#[test]
fn moving_a_file_keeps_its_modified_time() {
	let (directory, repository) = repository();

	repository.write_text("a/note.md", "text").unwrap();
	repository.create_dir("b").unwrap();

	let time = UNIX_EPOCH + Duration::from_secs(1_700_000_000);

	fs::File::options()
		.write(true)
		.open(directory.path().join("a/note.md"))
		.unwrap()
		.set_modified(time)
		.unwrap();

	assert_eq!(
		repository.move_file("a/note.md", "b/note.md").unwrap(),
		MoveResult::Moved
	);
	assert!(!directory.path().join("a/note.md").exists());
	assert_eq!(
		fs::metadata(directory.path().join("b/note.md"))
			.unwrap()
			.modified()
			.unwrap(),
		time
	);
}

#[test]
fn moving_never_overwrites_and_reports_missing_sources() {
	let (directory, repository) = repository();

	repository.write_text("a/note.md", "mine").unwrap();
	repository.write_text("b/note.md", "theirs").unwrap();

	assert_eq!(
		repository.move_file("a/note.md", "b/note.md").unwrap(),
		MoveResult::TargetExists
	);
	assert_eq!(
		repository.move_file("a/gone.md", "b/gone.md").unwrap(),
		MoveResult::SourceMissing
	);
	assert_eq!(
		fs::read_to_string(directory.path().join("a/note.md")).unwrap(),
		"mine"
	);
	assert_eq!(
		fs::read_to_string(directory.path().join("b/note.md")).unwrap(),
		"theirs"
	);
}

#[test]
fn removing_a_directory_deletes_everything_under_it_and_ignores_a_missing_one() {
	let (directory, repository) = repository();

	repository.write_text("a/b/note.md", "x").unwrap();
	repository.remove_dir("a").unwrap();
	repository.remove_dir("a").unwrap();

	assert!(!directory.path().join("a").exists());
}

#[test]
fn names_with_separators_or_dots_are_invalid() {
	for name in ["", ".", "..", "a/b", "a\\b", "a\0b"] {
		assert!(
			matches!(validate_name(name), Err(Error::InvalidName(_))),
			"{name:?} must be invalid"
		);
	}

	for name in ["note", "with space", "é日本", ".hidden", "a.b"] {
		assert!(validate_name(name).is_ok(), "{name:?} must be valid");
	}
}

#[test]
fn renaming_with_an_invalid_name_does_not_touch_the_repository() {
	let (directory, repository) = repository();

	repository.write_text("old/note.md", "x").unwrap();

	assert!(matches!(
		repository.rename_dir("old", "../escape"),
		Err(Error::InvalidName(_))
	));
	assert!(directory.path().join("old/note.md").exists());
	assert!(!directory.path().parent().unwrap().join("escape").exists());
}

#[test]
fn listing_a_directory_reports_files_and_directories_sorted_by_name() {
	let (_directory, repository) = repository();

	repository.write_text("b.md", "x").unwrap();
	repository.create_dir("a").unwrap();
	repository.write_text("c/inner.md", "x").unwrap();

	assert_eq!(
		repository.list_dir("").unwrap(),
		[
			DirEntry {
				name: "a".into(),
				is_dir: true
			},
			DirEntry {
				name: "b.md".into(),
				is_dir: false
			},
			DirEntry {
				name: "c".into(),
				is_dir: true
			},
		]
	);
}

#[test]
fn listing_a_missing_directory_gives_nothing() {
	let (_directory, repository) = repository();

	assert!(repository.list_dir("ghost").unwrap().is_empty());
}

#[cfg(target_os = "linux")]
#[test]
fn listing_skips_names_that_are_not_valid_utf8() {
	use std::ffi::OsStr;
	use std::os::unix::ffi::OsStrExt;

	let (directory, repository) = repository();

	fs::write(directory.path().join(OsStr::from_bytes(b"bad\xff.md")), "x").unwrap();
	repository.write_text("good.md", "x").unwrap();

	let names: Vec<String> = repository
		.list_dir("")
		.unwrap()
		.into_iter()
		.map(|entry| entry.name)
		.collect();

	assert_eq!(names, ["good.md"]);
}

#[test]
fn a_directory_can_be_renamed_to_a_different_case_of_its_own_name() {
	let (directory, repository) = repository();

	repository.write_text("Notes/a.md", "x").unwrap();
	repository.rename_dir("Notes", "NOTES").unwrap();

	assert!(directory.path().join("NOTES/a.md").exists());
}
