use super::constants::TAG_KEYS;
use super::patterns::{FRONTMATTER, FRONTMATTER_RAW_GROUP};
use serde_yaml_ng::{Mapping, Value};

pub struct Split<'a> {
	pub raw: Option<&'a str>,
	pub body: &'a str,
}

pub struct Metadata {
	pub mapping: Mapping,
	pub invalid: bool,
}

pub fn split(text: &str) -> Split<'_> {
	match FRONTMATTER.captures(text) {
		Some(captures) => Split {
			raw: captures.get(FRONTMATTER_RAW_GROUP).map(|m| m.as_str()),
			body: &text[captures.get(0).map_or(0, |m| m.end())..],
		},
		None => Split {
			raw: None,
			body: text,
		},
	}
}

pub fn read_metadata(raw: Option<&str>) -> Metadata {
	let Some(raw) = raw.filter(|raw| !raw.trim().is_empty()) else {
		return Metadata {
			mapping: Mapping::new(),
			invalid: false,
		};
	};

	match serde_yaml_ng::from_str::<Value>(raw) {
		Ok(Value::Mapping(mapping)) => Metadata {
			mapping,
			invalid: false,
		},
		_ => Metadata {
			mapping: Mapping::new(),
			invalid: true,
		},
	}
}

pub fn property_keys(mapping: &Mapping) -> Vec<String> {
	mapping
		.keys()
		.filter_map(scalar_text)
		.filter(|key| !TAG_KEYS.contains(&key.as_str()))
		.collect()
}

pub fn scalar_text(value: &Value) -> Option<String> {
	match value {
		Value::String(text) => Some(text.clone()),
		Value::Number(number) => Some(number.to_string()),
		Value::Bool(flag) => Some(flag.to_string()),
		_ => None,
	}
}
