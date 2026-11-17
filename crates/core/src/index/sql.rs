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

pub const DROP_ORDER: &[&str] = &[
	"DROP TABLE IF EXISTS note_fts",
	"DROP TABLE IF EXISTS properties",
	"DROP TABLE IF EXISTS markdown_links",
	"DROP TABLE IF EXISTS links",
	"DROP TABLE IF EXISTS tags",
	"DROP TABLE IF EXISTS notes",
	"DROP TABLE IF EXISTS meta",
];

pub const SCHEMA: &[&str] = &[
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
		frontmatter TEXT,
		UNIQUE(repository_id, filename)
	)",
	"CREATE TABLE tags(
		note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		name TEXT NOT NULL,
		inline INTEGER NOT NULL
	)",
	"CREATE TABLE links(
		note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		text TEXT NOT NULL,
		name TEXT NOT NULL,
		anchor_name TEXT
	)",
	"CREATE TABLE markdown_links(
		note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		target TEXT NOT NULL
	)",
	"CREATE TABLE properties(
		note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		key TEXT NOT NULL,
		value TEXT NOT NULL
	)",
	"CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL)",
	"CREATE INDEX notes_sort_key ON notes(sort_key, id)",
	"CREATE INDEX notes_modified ON notes(modified, sort_key, id)",
	"CREATE INDEX tags_note ON tags(note_id)",
	"CREATE INDEX tags_name ON tags(name COLLATE NOCASE)",
	"CREATE INDEX links_note ON links(note_id)",
	"CREATE INDEX links_text ON links(text COLLATE NOCASE)",
	"CREATE INDEX links_name ON links(name)",
	"CREATE INDEX links_anchor_name ON links(anchor_name)",
	"CREATE INDEX markdown_links_note ON markdown_links(note_id)",
	"CREATE INDEX markdown_links_target ON markdown_links(target)",
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
	repository_id, filename, uri, title, sort_key, modified, size, invalid_frontmatter, frontmatter
) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)";
pub const INSERT_TAG: &str =
	"INSERT INTO tags(note_id, position, name, inline) VALUES(?1,?2,?3,?4)";
pub const INSERT_LINK: &str =
	"INSERT INTO links(note_id, position, text, name, anchor_name) VALUES(?1,?2,?3,?4,?5)";
pub const INSERT_MARKDOWN_LINK: &str =
	"INSERT INTO markdown_links(note_id, position, target) VALUES(?1,?2,?3)";
pub const INSERT_PROPERTY: &str =
	"INSERT INTO properties(note_id, position, key, value) VALUES(?1,?2,?3,?4)";
pub const INSERT_FTS: &str = "INSERT INTO note_fts(rowid, title, content) VALUES(?1,?2,?3)";

pub const BACKLINK_BY_NAME_HEAD: &str = "SELECT DISTINCT n.repository_id, n.filename
	FROM links l JOIN notes n ON n.id = l.note_id
	WHERE l.name IN (";
pub const BACKLINK_BY_NAME_MIDDLE: &str = ") OR l.anchor_name IN (";
pub const BACKLINK_BY_NAME_TAIL: &str = ")";
pub const BACKLINK_BY_MARKDOWN: &str = "SELECT DISTINCT n.repository_id, n.filename
	FROM markdown_links m JOIN notes n ON n.id = m.note_id
	WHERE m.target = ?1";
pub const MENTION_CANDIDATES: &str = "SELECT n.repository_id, n.filename
	FROM note_fts JOIN notes n ON n.id = note_fts.rowid
	WHERE note_fts MATCH ?1";

pub const PLACEHOLDER: &str = "?";
pub const PLACEHOLDER_SEPARATOR: &str = ",";
pub const FTS_QUOTE: &str = "\"";
pub const FTS_ESCAPED_QUOTE: &str = "\"\"";
pub const FTS_OR: &str = " OR ";
pub const MIN_TRIGRAM_LENGTH: usize = 3;

pub mod ref_column {
	pub const REPOSITORY_ID: usize = 0;
	pub const FILENAME: usize = 1;
}

pub fn placeholders(count: usize, offset: usize) -> String {
	(offset + 1..=offset + count)
		.map(|index| format!("{PLACEHOLDER}{index}"))
		.collect::<Vec<_>>()
		.join(PLACEHOLDER_SEPARATOR)
}

pub const LIST_NOTES: &str = "SELECT id, repository_id, filename, uri, title, modified,
	invalid_frontmatter, frontmatter
	FROM notes ORDER BY id";
pub const LIST_TAGS: &str = "SELECT note_id, name, inline FROM tags ORDER BY note_id, rowid";
pub const LIST_PROPERTIES: &str =
	"SELECT note_id, key, value FROM properties ORDER BY note_id, rowid";
pub const LIST_LINKS: &str = "SELECT note_id, text FROM links ORDER BY note_id, rowid";

pub mod list_note_column {
	pub const ID: usize = 0;
	pub const REPOSITORY_ID: usize = 1;
	pub const FILENAME: usize = 2;
	pub const URI: usize = 3;
	pub const TITLE: usize = 4;
	pub const MODIFIED: usize = 5;
	pub const INVALID_FRONTMATTER: usize = 6;
	pub const FRONTMATTER: usize = 7;
}

pub mod list_child_column {
	pub const NOTE_ID: usize = 0;
	pub const FIRST: usize = 1;
	pub const SECOND: usize = 2;
}
