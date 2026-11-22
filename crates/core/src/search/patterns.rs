use super::constants::{ANY_BUT_LINE_TERMINATORS, WORD_CHARACTER_CLASS};
use regex::Regex;
use std::sync::LazyLock;

fn compile(pattern: &str) -> Regex {
	Regex::new(pattern).expect("static pattern")
}

pub static HEADING_LINE: LazyLock<Regex> = LazyLock::new(|| compile(r"^#{1,6}\s"));

pub static TASK_LINE: LazyLock<Regex> = LazyLock::new(|| {
	compile(&format!(
		r"^\s*(?:>\s*)*(?:[-*+]|[0-9]+[.)])\s+\[({ANY_BUT_LINE_TERMINATORS})\]\s"
	))
});

pub static BLOCK_SEPARATOR: LazyLock<Regex> = LazyLock::new(|| compile(r"\n[ \t]*\n"));

pub static IMAGE_REFERENCE: LazyLock<Regex> = LazyLock::new(|| {
	compile(
		r"(?i)!\[[^\]]*\]\([^)]+\)|!\[\[[^\]]+\.(?:png|jpe?g|gif|webp|avif|bmp|svg|heic)(?:[|#][^\]]*)?\]\]",
	)
});

pub static FILE_EMBED: LazyLock<Regex> =
	LazyLock::new(|| compile(r"!?\[\[[^\]|#]+\.([A-Za-z0-9_]+)(?:[|#][^\]]*)?\]\]"));

pub static FILE_LINK: LazyLock<Regex> =
	LazyLock::new(|| compile(r"(?i)\[[^\]]*\]\((?:file|content):[^)]+\)"));

pub static WORD_CHARACTER: LazyLock<Regex> =
	LazyLock::new(|| compile(&format!("^{WORD_CHARACTER_CLASS}$")));

pub static NUMBER_LITERAL: LazyLock<Regex> =
	LazyLock::new(|| compile(r"^[+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$"));
