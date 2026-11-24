pub const OPERATOR_FILE: &str = "file";
pub const OPERATOR_PATH: &str = "path";
pub const OPERATOR_CONTENT: &str = "content";
pub const OPERATOR_MATCH_CASE: &str = "match-case";
pub const OPERATOR_IGNORE_CASE: &str = "ignore-case";
pub const OPERATOR_TAG: &str = "tag";
pub const OPERATOR_LINE: &str = "line";
pub const OPERATOR_BLOCK: &str = "block";
pub const OPERATOR_SECTION: &str = "section";
pub const OPERATOR_TASK_TODO: &str = "task-todo";
pub const OPERATOR_TASK_DONE: &str = "task-done";
pub const OPERATOR_HAS: &str = "has";
pub const OPERATOR_IS: &str = "is";

pub const HAS_IMAGES: &str = "images";
pub const IS_PINNED: &str = "pinned";

pub const COMPARE_GREATER: &str = ">";
pub const COMPARE_GREATER_OR_EQUAL: &str = ">=";
pub const COMPARE_LESS: &str = "<";

pub const TAG_PATH_SEPARATOR: char = '/';
pub const TAG_HASH_PREFIX: char = '#';
pub const PATH_SEPARATOR: char = '/';
pub const LINE_SEPARATOR: char = '\n';
pub const SECTION_JOINER: &str = "\n";
pub const FRONTMATTER_JOINER: &str = "\n";

pub const TASK_TODO_STATUS: char = ' ';
pub const TASK_DONE_STATUSES: [char; 2] = ['x', 'X'];

pub const WORD_CHARACTER_CLASS: &str = r"[\p{L}\p{N}_]";
pub const INSENSITIVE_FLAG: &str = "(?i)";
pub const ECMASCRIPT_FLAGS_SENSITIVE: &str = "u";
pub const ECMASCRIPT_FLAGS_INSENSITIVE: &str = "iu";
pub const ASCII_WORD: &str = "[A-Za-z0-9_]";
pub const ASCII_NOT_WORD: &str = "[^A-Za-z0-9_]";
pub const ASCII_DIGIT: &str = "[0-9]";
pub const ASCII_NOT_DIGIT: &str = "[^0-9]";
pub const ASCII_WORD_RANGES: &str = "A-Za-z0-9_";
pub const ASCII_DIGIT_RANGES: &str = "0-9";
pub const ASCII_BOUNDARY: &str = r"(?-u:\b)";
pub const ASCII_NOT_BOUNDARY: &str = r"(?-u:\B)";
pub const ANY_BUT_LINE_TERMINATORS: &str = r"[^\n\r\u{2028}\u{2029}]";

pub const IMAGE_EXTENSIONS: [&str; 10] = [
	"md", "png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "svg", "heic",
];
pub const FILE_EXTENSION_GROUP: usize = 1;

pub const JS_WHITESPACE: [char; 9] = [
	'\u{00a0}', '\u{1680}', '\u{2028}', '\u{2029}', '\u{202f}', '\u{205f}', '\u{3000}', '\u{feff}',
	'\u{000b}',
];
pub const JS_WHITESPACE_RANGE: (char, char) = ('\u{2000}', '\u{200a}');
pub const NEGATIVE_INFINITY: &str = "-Infinity";
pub const POSITIVE_INFINITY: &str = "Infinity";
pub const SIGNED_POSITIVE_INFINITY: &str = "+Infinity";
pub const RADIX_PREFIXES: [(&str, u32); 6] = [
	("0x", 16),
	("0X", 16),
	("0o", 8),
	("0O", 8),
	("0b", 2),
	("0B", 2),
];
pub const OBJECT_STRING: &str = "[object Object]";
pub const ARRAY_JOINER: &str = ",";
pub const EXPONENT_MARKER: char = 'e';
pub const EXPONENT_WITH_SIGN: &str = "e+";
pub const MAX_PLAIN_NUMBER: f64 = 1e21;
pub const MIN_PLAIN_NUMBER: f64 = 1e-6;
pub const NEGATIVE_EXPONENT: &str = "e-";
pub const NOT_A_NUMBER: &str = "NaN";

pub const MIN_TERM_CHARACTERS: usize = 3;
pub const FORBIDDEN_TERM_CHARACTERS: [char; 2] = ['.', '/'];
pub const PRINTABLE_ASCII: std::ops::RangeInclusive<char> = ' '..='~';
pub const COLUMN_TITLE: &str = "title";
pub const COLUMN_CONTENT: &str = "content";

pub const NOTE_PATH_SEPARATOR: &str = "::";

pub const CACHE_MAX_BYTES: usize = 64 * 1024 * 1024;
pub const CACHE_EVICT_TO_PERCENT: usize = 75;
