use super::sql;
use crate::collation::SortKeys;
use crate::convert::count_i64;
use crate::error::Result;
use crate::model::{IndexedNote, Link, Property, Tag};
use rusqlite::{Transaction, params};

pub fn write_batch(
	transaction: &Transaction<'_>,
	folder_id: &str,
	notes: &[IndexedNote],
	removed: &[String],
	keys: &SortKeys,
) -> Result<()> {
	for filename in removed {
		delete_existing(transaction, folder_id, filename)?;
	}

	for note in notes {
		delete_existing(transaction, folder_id, &note.input.filename)?;
		insert(transaction, folder_id, note, keys)?;
	}

	Ok(())
}

pub fn delete_folder(transaction: &Transaction<'_>, folder_id: &str) -> Result<()> {
	transaction.execute(sql::DELETE_FTS_BY_FOLDER, [folder_id])?;
	transaction.execute(sql::DELETE_NOTES_BY_FOLDER, [folder_id])?;

	Ok(())
}

fn delete_existing(transaction: &Transaction<'_>, folder_id: &str, filename: &str) -> Result<()> {
	let id: Option<i64> = transaction
		.prepare_cached(sql::SELECT_NOTE_ID)?
		.query_row(params![folder_id, filename], |row| {
			row.get(sql::FIRST_COLUMN)
		})
		.ok();

	if let Some(id) = id {
		transaction.prepare_cached(sql::DELETE_FTS)?.execute([id])?;
		transaction
			.prepare_cached(sql::DELETE_NOTE)?
			.execute([id])?;
	}

	Ok(())
}

fn insert(
	transaction: &Transaction<'_>,
	folder_id: &str,
	note: &IndexedNote,
	keys: &SortKeys,
) -> Result<()> {
	let input = &note.input;
	let parsed = &note.parsed;
	let title = title_of(&input.filename);

	transaction
		.prepare_cached(sql::INSERT_NOTE)?
		.execute(params![
			folder_id,
			input.filename,
			input.location,
			title,
			keys.key(title),
			input.modified,
			input.size,
			i64::from(parsed.invalid_frontmatter),
			parsed.frontmatter,
		])?;

	let id = transaction.last_insert_rowid();

	insert_tags(transaction, id, &parsed.tags)?;
	insert_links(transaction, id, &parsed.links)?;
	insert_all(
		transaction,
		sql::INSERT_MARKDOWN_LINK,
		id,
		&parsed.markdown_links,
	)?;
	insert_properties(transaction, id, &parsed.properties)?;

	transaction
		.prepare_cached(sql::INSERT_FTS)?
		.execute(params![id, title, parsed.content])?;

	Ok(())
}

fn insert_tags(transaction: &Transaction<'_>, note_id: i64, tags: &[Tag]) -> Result<()> {
	let mut prepared = transaction.prepare_cached(sql::INSERT_TAG)?;

	for (position, tag) in tags.iter().enumerate() {
		prepared.execute(params![
			note_id,
			count_i64(position),
			tag.name,
			i64::from(tag.inline)
		])?;
	}

	Ok(())
}

fn insert_properties(
	transaction: &Transaction<'_>,
	note_id: i64,
	properties: &[Property],
) -> Result<()> {
	let mut prepared = transaction.prepare_cached(sql::INSERT_PROPERTY)?;

	for (position, property) in properties.iter().enumerate() {
		prepared.execute(params![
			note_id,
			count_i64(position),
			property.key,
			property.value
		])?;
	}

	Ok(())
}

fn insert_links(transaction: &Transaction<'_>, note_id: i64, links: &[Link]) -> Result<()> {
	let mut prepared = transaction.prepare_cached(sql::INSERT_LINK)?;

	for (position, link) in links.iter().enumerate() {
		prepared.execute(params![
			note_id,
			count_i64(position),
			link.text,
			link.name,
			link.anchor_name
		])?;
	}

	Ok(())
}

fn insert_all(
	transaction: &Transaction<'_>,
	statement: &str,
	note_id: i64,
	values: &[String],
) -> Result<()> {
	let mut prepared = transaction.prepare_cached(statement)?;

	for (position, value) in values.iter().enumerate() {
		prepared.execute(params![note_id, count_i64(position), value])?;
	}

	Ok(())
}

fn title_of(filename: &str) -> &str {
	let end = filename.len().saturating_sub(sql::NOTE_EXTENSION_LENGTH);
	filename.get(..end).unwrap_or(filename)
}
