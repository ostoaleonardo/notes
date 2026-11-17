use regex::Regex;
use std::sync::LazyLock;

const WHITESPACE: &str =
	r"\s\u{00a0}\u{1680}\u{2000}-\u{200a}\u{2028}\u{2029}\u{202f}\u{205f}\u{3000}\u{feff}";
const INVALID_TAG_CHARS: &str = r"!-,.:-@\[-\^`{-~";

pub const FRONTMATTER_RAW_GROUP: usize = 1;
pub const INLINE_TAG_NAME_GROUP: usize = 2;
pub const WIKI_LINK_TARGET_GROUP: usize = 1;
pub const MARKDOWN_LINK_TARGET_GROUP: usize = 2;

fn compile(pattern: &str) -> Regex {
	Regex::new(pattern).expect("static pattern")
}

pub static FRONTMATTER: LazyLock<Regex> =
	LazyLock::new(|| compile(r"(?s)^---\r?\n(.*?)\r?\n---(?:\r?\n+|\z)"));

pub static INLINE_CODE: LazyLock<Regex> = LazyLock::new(|| compile(r"`[^`\n]*`"));

pub static INLINE_TAG: LazyLock<Regex> = LazyLock::new(|| {
	compile(&format!(
		"(^|[{WHITESPACE}])#([^{WHITESPACE}{INVALID_TAG_CHARS}]+)"
	))
});

pub static TAG_SEPARATOR: LazyLock<Regex> = LazyLock::new(|| compile(&format!("[,{WHITESPACE}]+")));

pub static WHITESPACE_RUN: LazyLock<Regex> = LazyLock::new(|| compile(&format!("[{WHITESPACE}]+")));

pub static INVALID_TAG_CHAR: LazyLock<Regex> =
	LazyLock::new(|| compile(&format!("[{INVALID_TAG_CHARS}]")));

pub static TRAILING_SLASHES: LazyLock<Regex> = LazyLock::new(|| compile(r"/+\z"));

pub static WIKI_LINK: LazyLock<Regex> =
	LazyLock::new(|| compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]"));

pub static MARKDOWN_LINK: LazyLock<Regex> =
	LazyLock::new(|| compile(r"\[([^\]]*)\]\(wikilink://([^)]+)\)"));
