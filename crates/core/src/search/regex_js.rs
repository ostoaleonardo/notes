use super::constants::{
	ANY_BUT_LINE_TERMINATORS, ASCII_BOUNDARY, ASCII_DIGIT, ASCII_DIGIT_RANGES, ASCII_NOT_BOUNDARY,
	ASCII_NOT_DIGIT, ASCII_NOT_WORD, ASCII_WORD, ASCII_WORD_RANGES, INSENSITIVE_FLAG,
};
use crate::error::{Error, Result};
use regex::Regex;

const ESCAPE: char = '\\';
const CLASS_OPEN: char = '[';
const CLASS_CLOSE: char = ']';
const DOT: char = '.';
const BACKSPACE_ESCAPE: &str = r"\x08";

fn escape_in_class(character: char, out: &mut String) {
	match character {
		'w' => out.push_str(ASCII_WORD_RANGES),
		'd' => out.push_str(ASCII_DIGIT_RANGES),
		'b' => out.push_str(BACKSPACE_ESCAPE),
		other => {
			out.push(ESCAPE);
			out.push(other);
		}
	}
}

fn escape_outside_class(character: char, out: &mut String) {
	match character {
		'w' => out.push_str(ASCII_WORD),
		'W' => out.push_str(ASCII_NOT_WORD),
		'd' => out.push_str(ASCII_DIGIT),
		'D' => out.push_str(ASCII_NOT_DIGIT),
		'b' => out.push_str(ASCII_BOUNDARY),
		'B' => out.push_str(ASCII_NOT_BOUNDARY),
		other => {
			out.push(ESCAPE);
			out.push(other);
		}
	}
}

pub fn translate(pattern: &str) -> String {
	let mut out = String::with_capacity(pattern.len());
	let mut characters = pattern.chars();
	let mut in_class = false;

	while let Some(character) = characters.next() {
		match character {
			ESCAPE => match characters.next() {
				Some(next) if in_class => escape_in_class(next, &mut out),
				Some(next) => escape_outside_class(next, &mut out),
				None => out.push(ESCAPE),
			},
			CLASS_OPEN if in_class => {
				out.push(ESCAPE);
				out.push(CLASS_OPEN);
			}
			CLASS_OPEN => {
				in_class = true;
				out.push(CLASS_OPEN);
			}
			CLASS_CLOSE => {
				in_class = false;
				out.push(CLASS_CLOSE);
			}
			DOT if !in_class => out.push_str(ANY_BUT_LINE_TERMINATORS),
			other => out.push(other),
		}
	}

	out
}

pub fn compile(pattern: &str, insensitive: bool) -> Result<Regex> {
	let translated = translate(pattern);
	let source = if insensitive {
		format!("{INSENSITIVE_FLAG}{translated}")
	} else {
		translated
	};

	Regex::new(&source).map_err(|error| Error::InvalidQuery(error.to_string()))
}
