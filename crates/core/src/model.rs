#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Tag {
	pub name: String,
	pub inline: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Property {
	pub key: String,
	pub value: String,
}

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
	pub tags: Vec<Tag>,
	pub links: Vec<Link>,
	pub markdown_links: Vec<String>,
	pub properties: Vec<Property>,
	pub frontmatter: Option<String>,
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

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceFile {
	pub uri: String,
	pub filename: String,
	pub modified: i64,
	pub size: i64,
}

impl From<&SourceFile> for ScannedFile {
	fn from(file: &SourceFile) -> Self {
		Self {
			filename: file.filename.clone(),
			modified: file.modified,
			size: file.size,
		}
	}
}

impl NoteInput {
	pub fn from_file(file: &SourceFile, text: String) -> Self {
		Self {
			filename: file.filename.clone(),
			uri: file.uri.clone(),
			modified: file.modified,
			size: file.size,
			text,
		}
	}
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct SyncStats {
	pub total: u32,
	pub added: u32,
	pub updated: u32,
	pub removed: u32,
	pub unchanged: u32,
	pub unreadable: u32,
	pub scan_ms: u64,
	pub read_ms: u64,
	pub parse_ms: u64,
	pub write_ms: u64,
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
