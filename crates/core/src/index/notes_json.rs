use super::constants::{key, token};
use super::sql;
use crate::error::Result;
use rusqlite::{Connection, Rows};
use std::collections::HashSet;

struct Cursor<'a, T> {
	rows: Rows<'a>,
	pending: Option<(i64, T)>,
	read: fn(&rusqlite::Row<'_>) -> rusqlite::Result<(i64, T)>,
}

impl<'a, T> Cursor<'a, T> {
	fn new(
		mut rows: Rows<'a>,
		read: fn(&rusqlite::Row<'_>) -> rusqlite::Result<(i64, T)>,
	) -> Result<Self> {
		let pending = rows.next()?.map(read).transpose()?;

		Ok(Self {
			rows,
			pending,
			read,
		})
	}

	fn take(&mut self, note_id: i64) -> Result<Vec<T>> {
		let mut taken = Vec::new();

		while self.pending.as_ref().is_some_and(|(id, _)| *id < note_id) {
			self.pending = self.rows.next()?.map(self.read).transpose()?;
		}

		while self.pending.as_ref().is_some_and(|(id, _)| *id == note_id) {
			if let Some((_, value)) = self.pending.take() {
				taken.push(value);
			}

			self.pending = self.rows.next()?.map(self.read).transpose()?;
		}

		Ok(taken)
	}
}

fn read_tag(row: &rusqlite::Row<'_>) -> rusqlite::Result<(i64, (String, bool))> {
	Ok((
		row.get(sql::list_child_column::NOTE_ID)?,
		(
			row.get(sql::list_child_column::FIRST)?,
			row.get::<_, i64>(sql::list_child_column::SECOND)? != 0,
		),
	))
}

fn read_property(row: &rusqlite::Row<'_>) -> rusqlite::Result<(i64, (String, String))> {
	Ok((
		row.get(sql::list_child_column::NOTE_ID)?,
		(
			row.get(sql::list_child_column::FIRST)?,
			row.get(sql::list_child_column::SECOND)?,
		),
	))
}

fn read_link(row: &rusqlite::Row<'_>) -> rusqlite::Result<(i64, String)> {
	Ok((
		row.get(sql::list_child_column::NOTE_ID)?,
		row.get(sql::list_child_column::FIRST)?,
	))
}

pub fn list(connection: &Connection, folder_ids: &[String]) -> Result<String> {
	let mut out = String::new();
	out.push(token::ARRAY_OPEN);

	if !folder_ids.is_empty() {
		write_notes(connection, folder_ids, &mut out)?;
	}

	out.push(token::ARRAY_CLOSE);

	Ok(out)
}

fn write_notes(connection: &Connection, folder_ids: &[String], out: &mut String) -> Result<()> {
	let wanted: HashSet<&str> = folder_ids.iter().map(String::as_str).collect();
	let mut notes = connection.prepare(sql::LIST_NOTES)?;
	let mut tags = connection.prepare(sql::LIST_TAGS)?;
	let mut properties = connection.prepare(sql::LIST_PROPERTIES)?;
	let mut links = connection.prepare(sql::LIST_LINKS)?;

	let mut tag_cursor = Cursor::new(tags.query([])?, read_tag)?;
	let mut property_cursor = Cursor::new(properties.query([])?, read_property)?;
	let mut link_cursor = Cursor::new(links.query([])?, read_link)?;
	let mut rows = notes.query([])?;
	let mut first = true;

	while let Some(row) = rows.next()? {
		let folder: String = row.get(sql::list_note_column::FOLDER_ID)?;
		if !wanted.contains(folder.as_str()) {
			continue;
		}

		let id: i64 = row.get(sql::list_note_column::ID)?;
		let modified: i64 = row.get(sql::list_note_column::MODIFIED)?;
		let invalid: i64 = row.get(sql::list_note_column::INVALID_FRONTMATTER)?;
		let raw: Option<String> = row.get(sql::list_note_column::FRONTMATTER)?;
		let (invalid_raw, valid_raw) = if invalid == 0 {
			(None, raw)
		} else {
			(raw, None)
		};
		let (inline, frontmatter): (Vec<_>, Vec<_>) = tag_cursor
			.take(id)?
			.into_iter()
			.partition(|(_, inline)| *inline);

		if !first {
			out.push(token::SEPARATOR);
		}

		first = false;
		out.reserve(token::ESTIMATED_NOTE_BYTES);
		out.push(token::OBJECT_OPEN);

		string_field(
			out,
			key::FOLDER_ID,
			&row.get::<_, String>(sql::list_note_column::FOLDER_ID)?,
		);
		out.push(token::SEPARATOR);
		string_field(
			out,
			key::FILENAME,
			&row.get::<_, String>(sql::list_note_column::FILENAME)?,
		);
		out.push(token::SEPARATOR);
		string_field(
			out,
			key::FILE_URI,
			&row.get::<_, String>(sql::list_note_column::LOCATION)?,
		);
		out.push(token::SEPARATOR);
		string_field(
			out,
			key::TITLE,
			&row.get::<_, String>(sql::list_note_column::TITLE)?,
		);
		out.push(token::SEPARATOR);
		number_field(out, key::CREATED_AT, modified);
		out.push(token::SEPARATOR);
		number_field(out, key::UPDATED_AT, modified);
		out.push(token::SEPARATOR);
		list_field(
			out,
			key::TAGS,
			frontmatter.iter().map(|(name, _)| name.as_str()),
		);
		out.push(token::SEPARATOR);
		list_field(
			out,
			key::INLINE_TAGS,
			inline.iter().map(|(name, _)| name.as_str()),
		);
		out.push(token::SEPARATOR);
		properties_field(out, &property_cursor.take(id)?);
		out.push(token::SEPARATOR);
		list_field(
			out,
			key::LINK_TEXTS,
			link_cursor.take(id)?.iter().map(String::as_str),
		);
		out.push(token::SEPARATOR);
		optional_field(out, key::INVALID_FRONTMATTER, invalid_raw.as_deref());
		out.push(token::SEPARATOR);
		optional_field(out, key::RAW_FRONTMATTER, valid_raw.as_deref());
		out.push(token::OBJECT_CLOSE);
	}

	Ok(())
}

fn name(out: &mut String, key: &str) {
	out.push(token::QUOTE);
	out.push_str(key);
	out.push(token::QUOTE);
	out.push(token::COLON);
}

fn string_field(out: &mut String, key: &str, value: &str) {
	name(out, key);
	string(out, value);
}

fn number_field(out: &mut String, key: &str, value: i64) {
	name(out, key);
	out.push_str(&value.to_string());
}

fn optional_field(out: &mut String, key: &str, value: Option<&str>) {
	name(out, key);

	match value {
		Some(text) => string(out, text),
		None => out.push_str(token::NULL),
	}
}

fn list_field<'a>(out: &mut String, key: &str, values: impl Iterator<Item = &'a str>) {
	name(out, key);
	out.push(token::ARRAY_OPEN);

	for (index, value) in values.enumerate() {
		if index > 0 {
			out.push(token::SEPARATOR);
		}

		string(out, value);
	}

	out.push(token::ARRAY_CLOSE);
}

fn properties_field(out: &mut String, properties: &[(String, String)]) {
	name(out, key::PROPERTIES);
	out.push(token::OBJECT_OPEN);

	for (index, (property, value)) in properties.iter().enumerate() {
		if index > 0 {
			out.push(token::SEPARATOR);
		}

		string(out, property);
		out.push(token::COLON);
		out.push_str(value);
	}

	out.push(token::OBJECT_CLOSE);
}

fn needs_escape(byte: u8) -> bool {
	byte == token::QUOTE as u8
		|| byte == token::BACKSLASH as u8
		|| byte < token::FIRST_PRINTABLE as u8
}

fn string(out: &mut String, value: &str) {
	out.push(token::QUOTE);

	if !value.bytes().any(needs_escape) {
		out.push_str(value);
		out.push(token::QUOTE);
		return;
	}

	for character in value.chars() {
		match character {
			token::QUOTE => out.push_str(token::ESCAPED_QUOTE),
			token::BACKSLASH => out.push_str(token::ESCAPED_BACKSLASH),
			'\n' => out.push_str(token::ESCAPED_NEWLINE),
			'\r' => out.push_str(token::ESCAPED_RETURN),
			'\t' => out.push_str(token::ESCAPED_TAB),
			control if control < token::FIRST_PRINTABLE => {
				out.push_str(token::ESCAPE_PREFIX);
				out.push_str(&format!("{:02x}", control as u32));
			}
			other => out.push(other),
		}
	}

	out.push(token::QUOTE);
}
