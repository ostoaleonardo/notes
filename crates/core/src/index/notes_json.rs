use super::sql;
use crate::error::Result;
use rusqlite::{Connection, params_from_iter};
use serde_json::{Map, Value};
use std::collections::HashMap;

mod key {
	pub const REPOSITORY_ID: &str = "repositoryId";
	pub const FILENAME: &str = "filename";
	pub const FILE_URI: &str = "fileUri";
	pub const TITLE: &str = "title";
	pub const CREATED_AT: &str = "createdAt";
	pub const UPDATED_AT: &str = "updatedAt";
	pub const SIZE: &str = "size";
	pub const TAGS: &str = "tags";
	pub const INLINE_TAGS: &str = "inlineTags";
	pub const PROPERTIES: &str = "properties";
	pub const LINK_TEXTS: &str = "linkTexts";
	pub const INVALID_FRONTMATTER: &str = "invalidFrontmatter";
	pub const RAW_FRONTMATTER: &str = "rawFrontmatter";
}

#[derive(Default)]
struct Children {
	tags: Vec<String>,
	inline_tags: Vec<String>,
	properties: Map<String, Value>,
	link_texts: Vec<String>,
}

pub fn list(connection: &Connection, repository_ids: &[String]) -> Result<String> {
	if repository_ids.is_empty() {
		return Ok(Value::Array(Vec::new()).to_string());
	}

	let mut children = read_children(connection, repository_ids)?;
	let statement = [
		sql::LIST_NOTES_HEAD,
		&sql::placeholders(repository_ids.len(), 0),
		sql::LIST_NOTES_TAIL,
	]
	.concat();
	let mut prepared = connection.prepare(&statement)?;
	let mut rows = prepared.query(params_from_iter(repository_ids))?;
	let mut notes = Vec::new();

	while let Some(row) = rows.next()? {
		let id: i64 = row.get(sql::list_note_column::ID)?;
		let modified: i64 = row.get(sql::list_note_column::MODIFIED)?;
		let invalid: i64 = row.get(sql::list_note_column::INVALID_FRONTMATTER)?;
		let raw: Option<String> = row.get(sql::list_note_column::FRONTMATTER)?;
		let child = children.remove(&id).unwrap_or_default();
		let (invalid_raw, valid_raw) = if invalid == 0 {
			(None, raw)
		} else {
			(raw, None)
		};

		let mut note = Map::new();
		note.insert(
			key::REPOSITORY_ID.into(),
			row.get::<_, String>(sql::list_note_column::REPOSITORY_ID)?
				.into(),
		);
		note.insert(
			key::FILENAME.into(),
			row.get::<_, String>(sql::list_note_column::FILENAME)?
				.into(),
		);
		note.insert(
			key::FILE_URI.into(),
			row.get::<_, String>(sql::list_note_column::URI)?.into(),
		);
		note.insert(
			key::TITLE.into(),
			row.get::<_, String>(sql::list_note_column::TITLE)?.into(),
		);
		note.insert(key::CREATED_AT.into(), modified.into());
		note.insert(key::UPDATED_AT.into(), modified.into());
		note.insert(
			key::SIZE.into(),
			row.get::<_, i64>(sql::list_note_column::SIZE)?.into(),
		);
		note.insert(key::TAGS.into(), strings(child.tags));
		note.insert(key::INLINE_TAGS.into(), strings(child.inline_tags));
		note.insert(key::PROPERTIES.into(), Value::Object(child.properties));
		note.insert(key::LINK_TEXTS.into(), strings(child.link_texts));
		note.insert(key::INVALID_FRONTMATTER.into(), optional(invalid_raw));
		note.insert(key::RAW_FRONTMATTER.into(), optional(valid_raw));
		notes.push(Value::Object(note));
	}

	Ok(Value::Array(notes).to_string())
}

fn read_children(
	connection: &Connection,
	repository_ids: &[String],
) -> Result<HashMap<i64, Children>> {
	let mut children: HashMap<i64, Children> = HashMap::new();

	for (head, tail) in [
		(sql::LIST_TAGS_HEAD, sql::LIST_TAGS_TAIL),
		(sql::LIST_PROPERTIES_HEAD, sql::LIST_PROPERTIES_TAIL),
		(sql::LIST_LINKS_HEAD, sql::LIST_LINKS_TAIL),
	] {
		let statement = [head, &sql::placeholders(repository_ids.len(), 0), tail].concat();
		let mut prepared = connection.prepare(&statement)?;
		let mut rows = prepared.query(params_from_iter(repository_ids))?;

		while let Some(row) = rows.next()? {
			let child = children
				.entry(row.get(sql::list_child_column::NOTE_ID)?)
				.or_default();
			let first: String = row.get(sql::list_child_column::FIRST)?;

			match head {
				sql::LIST_TAGS_HEAD if row.get::<_, i64>(sql::list_child_column::SECOND)? == 0 => {
					child.tags.push(first)
				}
				sql::LIST_TAGS_HEAD => child.inline_tags.push(first),
				sql::LIST_PROPERTIES_HEAD => {
					let value: String = row.get(sql::list_child_column::SECOND)?;
					child
						.properties
						.insert(first, serde_json::from_str(&value).unwrap_or(Value::Null));
				}
				_ => child.link_texts.push(first),
			}
		}
	}

	Ok(children)
}

fn strings(values: Vec<String>) -> Value {
	Value::Array(values.into_iter().map(Value::String).collect())
}

fn optional(value: Option<String>) -> Value {
	value.map_or(Value::Null, Value::String)
}
