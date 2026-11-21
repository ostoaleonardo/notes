use engine::error::Error;
use engine::vault::{FsVault, MoveResult, VaultFs, VaultOps, validate_name};
use std::fs;
use std::time::{Duration, UNIX_EPOCH};
use tempfile::TempDir;

fn vault() -> (TempDir, FsVault) {
	let directory = TempDir::new().unwrap();
	let vault = FsVault::new(directory.path());

	(directory, vault)
}

#[test]
fn exists_reports_files_and_directories() {
	let (_directory, vault) = vault();

	vault.create_dir("a/b").unwrap();
	vault.write_text("a/b/note.md", "x").unwrap();

	assert!(vault.exists("a").unwrap());
	assert!(vault.exists("a/b/note.md").unwrap());
	assert!(!vault.exists("a/missing").unwrap());
}

#[test]
fn creating_a_directory_twice_is_not_an_error() {
	let (_directory, vault) = vault();

	vault.create_dir("a/b").unwrap();
	vault.create_dir("a/b").unwrap();

	assert!(vault.exists("a/b").unwrap());
}

#[test]
fn renaming_a_directory_keeps_its_contents() {
	let (directory, vault) = vault();

	vault.write_text("old/inner/note.md", "text").unwrap();
	vault.rename_dir("old", "fresh").unwrap();

	assert!(!directory.path().join("old").exists());
	assert_eq!(
		fs::read_to_string(directory.path().join("fresh/inner/note.md")).unwrap(),
		"text"
	);
}

#[test]
fn renaming_a_nested_directory_stays_under_its_parent() {
	let (directory, vault) = vault();

	vault.write_text("parent/old/note.md", "text").unwrap();
	vault.rename_dir("parent/old", "fresh").unwrap();

	assert!(directory.path().join("parent/fresh/note.md").exists());
}

#[test]
fn renaming_onto_an_existing_directory_fails_and_changes_nothing() {
	let (directory, vault) = vault();

	vault.write_text("old/note.md", "old").unwrap();
	vault.write_text("taken/note.md", "taken").unwrap();

	assert!(matches!(
		vault.rename_dir("old", "taken"),
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
	let (_directory, vault) = vault();

	assert!(matches!(
		vault.rename_dir("ghost", "fresh"),
		Err(Error::Io(_))
	));
}

#[test]
fn moving_a_file_keeps_its_modified_time() {
	let (directory, vault) = vault();

	vault.write_text("a/note.md", "text").unwrap();
	vault.create_dir("b").unwrap();

	let time = UNIX_EPOCH + Duration::from_secs(1_700_000_000);

	fs::File::options()
		.write(true)
		.open(directory.path().join("a/note.md"))
		.unwrap()
		.set_modified(time)
		.unwrap();

	assert_eq!(
		vault.move_file("a/note.md", "b/note.md").unwrap(),
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
	let (directory, vault) = vault();

	vault.write_text("a/note.md", "mine").unwrap();
	vault.write_text("b/note.md", "theirs").unwrap();

	assert_eq!(
		vault.move_file("a/note.md", "b/note.md").unwrap(),
		MoveResult::TargetExists
	);
	assert_eq!(
		vault.move_file("a/gone.md", "b/gone.md").unwrap(),
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
	let (directory, vault) = vault();

	vault.write_text("a/b/note.md", "x").unwrap();
	vault.remove_dir("a").unwrap();
	vault.remove_dir("a").unwrap();

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
fn renaming_with_an_invalid_name_does_not_touch_the_vault() {
	let (directory, vault) = vault();

	vault.write_text("old/note.md", "x").unwrap();

	assert!(matches!(
		vault.rename_dir("old", "../escape"),
		Err(Error::InvalidName(_))
	));
	assert!(directory.path().join("old/note.md").exists());
	assert!(!directory.path().parent().unwrap().join("escape").exists());
}
