mod constants;

use constants::{
	BYTE_ORDER_MARK, DEFAULT_FILENAME, FILENAME_MAX_BYTES, FIRST_COPY_NUMBER, ILLEGAL_CHARS,
	LAST_CONTROL_CHAR, LINK_BREAKING_CHARS, NUMBERED_DEVICE_DIGITS, NUMBERED_DEVICES, PIPE_CHAR,
	REPLACEMENT_CHAR, RESERVED_DEVICES, RESERVED_SUFFIX, STEM_END, TRAILING_TRIMMED,
	UNIQUE_SUFFIX_RESERVE_BYTES,
};
use icu_normalizer::ComposingNormalizerBorrowed;
use std::collections::HashSet;

fn nfc(text: &str) -> String {
	ComposingNormalizerBorrowed::new_nfc()
		.normalize(text)
		.into_owned()
}

fn is_illegal(character: char) -> bool {
	ILLEGAL_CHARS.contains(&character) || character == PIPE_CHAR || character <= LAST_CONTROL_CHAR
}

fn is_trimmed(character: char) -> bool {
	character.is_whitespace() || character == BYTE_ORDER_MARK
}

fn trim_end(text: &str) -> &str {
	text.trim_end_matches(|character| {
		is_trimmed(character) || TRAILING_TRIMMED.contains(&character)
	})
}

fn is_reserved(stem: &str) -> bool {
	let device = stem.split(STEM_END).next().unwrap_or(stem).to_uppercase();

	if RESERVED_DEVICES.contains(&device.as_str()) {
		return true;
	}

	NUMBERED_DEVICES.iter().any(|prefix| {
		device
			.strip_prefix(prefix)
			.is_some_and(|digits| digits.len() == 1 && NUMBERED_DEVICE_DIGITS.contains(digits))
	})
}

fn cut_to_bytes(text: &str, limit: usize) -> &str {
	if text.len() <= limit {
		return text;
	}

	let mut end = limit;

	while !text.is_char_boundary(end) {
		end -= 1;
	}

	&text[..end]
}

pub fn sanitize_filename(title: &str, extension: &str) -> String {
	let replaced: String = nfc(title)
		.chars()
		.map(|character| {
			if is_illegal(character) {
				REPLACEMENT_CHAR
			} else {
				character
			}
		})
		.collect();

	let limit = FILENAME_MAX_BYTES - extension.len() - UNIQUE_SUFFIX_RESERVE_BYTES;
	let trimmed = replaced.trim_matches(is_trimmed);
	let cut = trim_end(cut_to_bytes(trimmed, limit));

	if cut.is_empty() {
		return DEFAULT_FILENAME.to_string();
	}

	if is_reserved(cut) {
		let device_end = cut.find(STEM_END).unwrap_or(cut.len());

		return format!(
			"{}{RESERVED_SUFFIX}{}",
			&cut[..device_end],
			&cut[device_end..]
		);
	}

	cut.to_string()
}

pub fn name_key(name: &str) -> String {
	nfc(name).to_lowercase()
}

pub fn names_collide(first: &str, second: &str) -> bool {
	name_key(first) == name_key(second)
}

pub fn has_link_breaking_chars(title: &str) -> bool {
	title.contains(LINK_BREAKING_CHARS)
}

pub fn unique_name(
	existing: &[String],
	stem: &str,
	extension: &str,
	current: Option<&str>,
) -> String {
	let taken: HashSet<String> = existing.iter().map(|name| name_key(name)).collect();
	let own = current.map(name_key);
	let is_taken = |name: &str| {
		let key = name_key(name);

		own.as_deref() != Some(key.as_str()) && taken.contains(&key)
	};

	let first = format!("{stem}{extension}");

	if !is_taken(&first) {
		return first;
	}

	(FIRST_COPY_NUMBER..)
		.map(|number| format!("{stem} ({number}){extension}"))
		.find(|name| !is_taken(name))
		.unwrap_or(first)
}
