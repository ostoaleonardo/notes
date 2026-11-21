pub mod key {
	pub const FOLDER_ID: &str = "folderId";
	pub const FILENAME: &str = "filename";
	pub const FILE_URI: &str = "fileUri";
	pub const TITLE: &str = "title";
	pub const CREATED_AT: &str = "createdAt";
	pub const UPDATED_AT: &str = "updatedAt";
	pub const TAGS: &str = "tags";
	pub const INLINE_TAGS: &str = "inlineTags";
	pub const PROPERTIES: &str = "properties";
	pub const LINK_TEXTS: &str = "linkTexts";
	pub const INVALID_FRONTMATTER: &str = "invalidFrontmatter";
	pub const RAW_FRONTMATTER: &str = "rawFrontmatter";
}

pub mod token {
	pub const ARRAY_OPEN: char = '[';
	pub const ARRAY_CLOSE: char = ']';
	pub const OBJECT_OPEN: char = '{';
	pub const OBJECT_CLOSE: char = '}';
	pub const SEPARATOR: char = ',';
	pub const COLON: char = ':';
	pub const QUOTE: char = '"';
	pub const BACKSLASH: char = '\\';
	pub const NULL: &str = "null";
	pub const ESCAPE_PREFIX: &str = "\\u00";
	pub const ESCAPED_QUOTE: &str = "\\\"";
	pub const ESCAPED_BACKSLASH: &str = "\\\\";
	pub const ESCAPED_NEWLINE: &str = "\\n";
	pub const ESCAPED_RETURN: &str = "\\r";
	pub const ESCAPED_TAB: &str = "\\t";
	pub const FIRST_PRINTABLE: char = ' ';
	pub const ESTIMATED_NOTE_BYTES: usize = 640;
}
