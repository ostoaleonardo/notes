use engine::engine::Engine;
use engine::error::Error;
use rusqlite::ffi;
use tempfile::TempDir;

fn sqlite_failure(code: i32) -> rusqlite::Error {
	rusqlite::Error::SqliteFailure(ffi::Error::new(code), None)
}

#[test]
fn classifies_a_busy_database_as_retryable() {
	let error = Error::from(sqlite_failure(ffi::SQLITE_BUSY));

	assert!(matches!(error, Error::Busy(_)));
	assert!(error.is_retryable());
}

#[test]
fn classifies_a_locked_database_as_retryable() {
	assert!(Error::from(sqlite_failure(ffi::SQLITE_LOCKED)).is_retryable());
}

#[test]
fn keeps_other_database_failures_as_not_retryable() {
	let error = Error::from(sqlite_failure(ffi::SQLITE_CONSTRAINT));

	assert!(matches!(error, Error::Database(_)));
	assert!(!error.is_retryable());
}

#[test]
fn converts_file_errors_with_a_message() {
	let error = Error::from(std::io::Error::new(std::io::ErrorKind::NotFound, "missing"));

	assert!(matches!(error, Error::Io(_)));
	assert!(error.to_string().contains("missing"));
}

#[test]
fn builds_an_engine_for_an_unknown_locale_using_the_root_collation() {
	let directory = TempDir::new().unwrap();

	assert!(Engine::new(directory.path().join("index.db"), "zz-invalid-").is_ok());
}

#[test]
fn reports_a_database_error_when_the_index_cannot_be_opened() {
	let directory = TempDir::new().unwrap();
	let engine = Engine::new(directory.path().join("missing").join("index.db"), "en").unwrap();

	let error = engine.indexed_notes().unwrap_err();

	assert!(matches!(error, Error::Database(_)));
	assert!(error.to_string().starts_with("database error"));
}
