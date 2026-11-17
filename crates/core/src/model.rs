#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Link {
	pub text: String,
	pub name: String,
	pub anchor_name: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct NoteRef {
	pub repository_id: String,
	pub filename: String,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ParsedNote {
	pub tags: Vec<String>,
	pub links: Vec<Link>,
	pub markdown_links: Vec<String>,
	pub property_keys: Vec<String>,
	pub invalid_frontmatter: bool,
	pub content: String,
}

#[derive(Debug, Clone)]
pub struct NoteInput {
	pub filename: String,
	pub uri: String,
	pub modified: i64,
	pub size: i64,
	pub text: String,
}

#[derive(Debug, Clone)]
pub struct IndexedNote {
	pub input: NoteInput,
	pub parsed: ParsedNote,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScannedFile {
	pub filename: String,
	pub modified: i64,
	pub size: i64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct FileMeta {
	pub modified: i64,
	pub size: i64,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ReconcilePlan {
	pub changed: Vec<u32>,
	pub removed: Vec<String>,
	pub added: u32,
	pub updated: u32,
	pub unchanged: u32,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct BatchStats {
	pub notes: u32,
	pub parse_ms: u64,
	pub write_ms: u64,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct IndexedNotes {
	pub repository_ids: Vec<String>,
	pub filenames: Vec<String>,
	pub modified: Vec<i64>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Value {
	Null,
	Integer(i64),
	Real(f64),
	Text(String),
}

#[derive(Debug, Clone, Default, PartialEq)]
pub struct QueryResult {
	pub columns: Vec<String>,
	pub rows: Vec<Vec<Value>>,
}
