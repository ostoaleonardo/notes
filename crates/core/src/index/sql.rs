pub const SCHEMA_VERSION: i64 = 1;
pub const LOCALE_META_KEY: &str = "collation_locale";

pub const PRAGMAS: [&str; 3] = [
	"PRAGMA journal_mode = WAL",
	"PRAGMA synchronous = NORMAL",
	"PRAGMA foreign_keys = ON",
];

pub const READ_VERSION: &str = "PRAGMA user_version";
pub const WRITE_VERSION_PREFIX: &str = "PRAGMA user_version = ";
pub const NOTE_EXTENSION_LENGTH: usize = 3;

pub mod metas_column {
	pub const FILENAME: usize = 0;
	pub const MODIFIED: usize = 1;
	pub const SIZE: usize = 2;
}

pub mod indexed_column {
	pub const REPOSITORY_ID: usize = 0;
	pub const FILENAME: usize = 1;
	pub const MODIFIED: usize = 2;
}

pub const FIRST_COLUMN: usize = 0;

pub fn write_version() -> String {
	format!("{WRITE_VERSION_PREFIX}{SCHEMA_VERSION}")
}

pub const DROP_ORDER: [&str; 6] = [
	"DROP TABLE IF EXISTS note_fts",
	"DROP TABLE IF EXISTS properties",
	"DROP TABLE IF EXISTS links",
	"DROP TABLE IF EXISTS tags",
	"DROP TABLE IF EXISTS notes",
	"DROP TABLE IF EXISTS meta",
];

pub const SCHEMA: [&str; 12] = [
	"CREATE TABLE notes(
		id INTEGER PRIMARY KEY,
		repository_id TEXT NOT NULL,
		filename TEXT NOT NULL,
		uri TEXT NOT NULL,
		title TEXT NOT NULL,
		sort_key TEXT NOT NULL,
		modified INTEGER NOT NULL,
		size INTEGER NOT NULL,
		invalid_frontmatter INTEGER NOT NULL,
		UNIQUE(repository_id, filename)
	)",
	"CREATE TABLE tags(
		note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		name TEXT NOT NULL
	)",
	"CREATE TABLE links(
		note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		text TEXT NOT NULL
	)",
	"CREATE TABLE properties(
		note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		key TEXT NOT NULL
	)",
	"CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL)",
	"CREATE INDEX notes_sort_key ON notes(sort_key, id)",
	"CREATE INDEX notes_modified ON notes(modified, sort_key, id)",
	"CREATE INDEX tags_note ON tags(note_id)",
	"CREATE INDEX tags_name ON tags(name COLLATE NOCASE)",
	"CREATE INDEX links_note ON links(note_id)",
	"CREATE INDEX links_text ON links(text COLLATE NOCASE)",
	"CREATE INDEX properties_note ON properties(note_id)",
];

pub const CREATE_FTS: &str = "CREATE VIRTUAL TABLE note_fts USING fts5(
	title,
	content,
	content='',
	contentless_delete=1,
	tokenize='trigram remove_diacritics 1'
)";

pub const SELECT_META: &str = "SELECT value FROM meta WHERE key = ?1";
pub const UPSERT_META: &str = "INSERT OR REPLACE INTO meta(key, value) VALUES(?1, ?2)";

pub const SELECT_METAS: &str =
	"SELECT filename, modified, size FROM notes WHERE repository_id = ?1";
pub const SELECT_INDEXED: &str = "SELECT repository_id, filename, modified FROM notes";
pub const SELECT_REPOSITORIES: &str = "SELECT DISTINCT repository_id FROM notes";
pub const SELECT_NOTE_ID: &str = "SELECT id FROM notes WHERE repository_id = ?1 AND filename = ?2";
pub const DELETE_FTS: &str = "DELETE FROM note_fts WHERE rowid = ?1";
pub const DELETE_NOTE: &str = "DELETE FROM notes WHERE id = ?1";
pub const DELETE_FTS_BY_REPOSITORY: &str =
	"DELETE FROM note_fts WHERE rowid IN (SELECT id FROM notes WHERE repository_id = ?1)";
pub const DELETE_NOTES_BY_REPOSITORY: &str = "DELETE FROM notes WHERE repository_id = ?1";

pub const INSERT_NOTE: &str = "INSERT INTO notes(
	repository_id, filename, uri, title, sort_key, modified, size, invalid_frontmatter
) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)";
pub const INSERT_TAG: &str = "INSERT INTO tags(note_id, position, name) VALUES(?1,?2,?3)";
pub const INSERT_LINK: &str = "INSERT INTO links(note_id, position, text) VALUES(?1,?2,?3)";
pub const INSERT_PROPERTY: &str = "INSERT INTO properties(note_id, position, key) VALUES(?1,?2,?3)";
pub const INSERT_FTS: &str = "INSERT INTO note_fts(rowid, title, content) VALUES(?1,?2,?3)";
