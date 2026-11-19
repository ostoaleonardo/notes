use super::constants::TAG_KEYS;
use super::patterns::{FRONTMATTER, FRONTMATTER_RAW_GROUP};
use crate::model::Property;
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

pub fn properties(mapping: &Mapping) -> Vec<Property> {
	mapping
		.iter()
		.filter_map(|(key, value)| Some((scalar_text(key)?, value)))
		.filter(|(key, _)| !TAG_KEYS.contains(&key.as_str()))
		.map(|(key, value)| Property {
			key,
			value: to_json(value).to_string(),
		})
		.collect()
}

pub fn json_properties(mapping: &Mapping) -> serde_json::Map<String, serde_json::Value> {
	mapping
		.iter()
		.filter_map(|(key, value)| Some((scalar_text(key)?, value)))
		.filter(|(key, _)| !TAG_KEYS.contains(&key.as_str()))
		.map(|(key, value)| (key, to_json(value)))
		.collect()
}

fn to_json(value: &Value) -> serde_json::Value {
	match value {
		Value::Null => serde_json::Value::Null,
		Value::Bool(flag) => serde_json::Value::Bool(*flag),
		Value::Number(number) => number_to_json(number),
		Value::String(text) => serde_json::Value::String(text.clone()),
		Value::Sequence(items) => serde_json::Value::Array(items.iter().map(to_json).collect()),
		Value::Mapping(mapping) => serde_json::Value::Object(
			mapping
				.iter()
				.filter_map(|(key, value)| Some((scalar_text(key)?, to_json(value))))
				.collect(),
		),
		Value::Tagged(tagged) => to_json(&tagged.value),
	}
}

fn number_to_json(number: &serde_yaml_ng::Number) -> serde_json::Value {
	if let Some(integer) = number.as_i64() {
		return integer.into();
	}

	if let Some(integer) = number.as_u64() {
		return integer.into();
	}

	number
		.as_f64()
		.and_then(serde_json::Number::from_f64)
		.map_or(serde_json::Value::Null, serde_json::Value::Number)
}

pub fn scalar_text(value: &Value) -> Option<String> {
	match value {
		Value::String(text) => Some(text.clone()),
		Value::Number(number) => Some(number.to_string()),
		Value::Bool(flag) => Some(flag.to_string()),
		_ => None,
	}
}
