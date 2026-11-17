use super::code::{blank, fenced_ranges, inline_ranges};
use super::constants::{
	BYTE_ORDER_MARK, HASH_CHAR, REMOVAL, TAG_HASH_PREFIX, TAG_KEYS, TAG_WORD_JOINER,
};
use super::frontmatter::scalar_text;
use super::patterns::{
	FRONTMATTER, INLINE_TAG, INLINE_TAG_NAME_GROUP, INVALID_TAG_CHAR, TAG_SEPARATOR,
	TRAILING_SLASHES, WHITESPACE_RUN,
};
use serde_yaml_ng::{Mapping, Value};
use std::collections::HashSet;

pub fn frontmatter_tags(mapping: &Mapping) -> Vec<String> {
	let names: Vec<String> = TAG_KEYS
		.iter()
		.filter_map(|key| mapping.get(*key))
		.flat_map(tag_values)
		.map(|name| sanitize(&name))
		.filter(|name| is_valid(name))
		.collect();

	dedupe(names)
}

pub fn inline_tags(body: &str) -> Vec<String> {
	if !body.contains(HASH_CHAR) {
		return Vec::new();
	}

	let without_frontmatter = blank_frontmatter(body);
	let without_fences = blank(&without_frontmatter, &fenced_ranges(&without_frontmatter));
	let visible = blank(&without_fences, &inline_ranges(&without_fences));

	let found = INLINE_TAG
		.captures_iter(&visible)
		.map(|captures| {
			TRAILING_SLASHES
				.replace(&captures[INLINE_TAG_NAME_GROUP], REMOVAL)
				.into_owned()
		})
		.filter(|name| is_valid(name))
		.collect();

	dedupe(found)
}

fn blank_frontmatter(body: &str) -> String {
	let ranges: Vec<_> = FRONTMATTER.find_iter(body).map(|m| m.range()).collect();
	blank(body, &ranges)
}

fn tag_values(value: &Value) -> Vec<String> {
	match value {
		Value::Sequence(items) => items
			.iter()
			.filter(|item| matches!(item, Value::String(_) | Value::Number(_)))
			.filter_map(scalar_text)
			.collect(),
		Value::String(text) => TAG_SEPARATOR.split(text).map(str::to_string).collect(),
		_ => Vec::new(),
	}
}

fn sanitize(name: &str) -> String {
	let trimmed = name.trim_matches(|c: char| c.is_whitespace() || c == BYTE_ORDER_MARK);
	let unprefixed = trimmed.strip_prefix(TAG_HASH_PREFIX).unwrap_or(trimmed);
	let joined = WHITESPACE_RUN.replace_all(unprefixed, TAG_WORD_JOINER);
	let cleaned = INVALID_TAG_CHAR.replace_all(&joined, REMOVAL);

	TRAILING_SLASHES.replace(&cleaned, REMOVAL).into_owned()
}

fn is_valid(name: &str) -> bool {
	name.chars().any(|c| !c.is_ascii_digit())
}

fn dedupe(tags: Vec<String>) -> Vec<String> {
	let mut seen = HashSet::new();
	tags.into_iter()
		.filter(|tag| seen.insert(tag.to_lowercase()))
		.collect()
}
