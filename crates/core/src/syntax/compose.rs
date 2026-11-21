use super::constants::{FRONTMATTER_BODY_GAP, FRONTMATTER_FENCE, LINE_END, TAG_KEYS, TAGS_KEY};
use super::frontmatter::{json_properties, read_metadata, split};
use super::patterns::FRONTMATTER;
use super::tags::frontmatter_tags;
use super::yaml_emit::emit;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct NoteFields {
	pub tags: Vec<String>,
	pub properties: Map<String, Value>,
	pub invalid_frontmatter: Option<String>,
	pub raw_frontmatter: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Decomposed {
	pub body: String,
	pub tags: Option<Vec<String>>,
	pub properties: Option<Map<String, Value>>,
	pub invalid_frontmatter: Option<String>,
	pub raw_frontmatter: Option<String>,
}

pub fn compose(fields: &NoteFields, body: &str) -> String {
	let reusable_raw = fields
		.raw_frontmatter
		.as_deref()
		.filter(|raw| same_frontmatter(raw, fields));

	let empty = fields.invalid_frontmatter.is_none()
		&& fields.tags.is_empty()
		&& fields.properties.is_empty();

	if reusable_raw.is_none() && empty && !FRONTMATTER.is_match(body) {
		return body.to_string();
	}

	let block = if let Some(invalid) = &fields.invalid_frontmatter {
		format!("{invalid}{LINE_END}")
	} else if let Some(raw) = reusable_raw {
		format!("{raw}{LINE_END}")
	} else {
		emit(&with_tags(fields))
	};

	format!("{FRONTMATTER_FENCE}{block}{FRONTMATTER_BODY_GAP}{body}")
}

pub fn decompose(content: &str) -> Decomposed {
	let parts = split(content);
	let metadata = read_metadata(parts.raw);

	if metadata.invalid {
		return Decomposed {
			body: parts.body.to_string(),
			invalid_frontmatter: parts.raw.map(str::to_string),
			..Decomposed::default()
		};
	}

	Decomposed {
		body: parts.body.to_string(),
		tags: Some(frontmatter_tags(&metadata.mapping)),
		properties: Some(json_properties(&metadata.mapping)),
		invalid_frontmatter: None,
		raw_frontmatter: parts.raw.map(str::to_string),
	}
}

fn same_frontmatter(raw: &str, fields: &NoteFields) -> bool {
	let metadata = read_metadata(Some(raw));

	!metadata.invalid
		&& frontmatter_tags(&metadata.mapping) == fields.tags
		&& json_properties(&metadata.mapping) == fields.properties
}

fn with_tags(fields: &NoteFields) -> Map<String, Value> {
	let mut mapping: Map<String, Value> = fields
		.properties
		.iter()
		.filter(|(key, _)| !TAG_KEYS.contains(&key.as_str()))
		.map(|(key, value)| (key.clone(), value.clone()))
		.collect();

	if !fields.tags.is_empty() {
		mapping.insert(
			TAGS_KEY.to_string(),
			Value::Array(fields.tags.iter().cloned().map(Value::String).collect()),
		);
	}

	mapping
}
