use super::sql;
use crate::error::Result;
use crate::model::NoteRef;
use crate::syntax::normalize;
use rusqlite::{Connection, params_from_iter};
use std::collections::HashSet;

pub fn backlinks(
	connection: &Connection,
	names: &[String],
	markdown_target: &str,
) -> Result<Vec<NoteRef>> {
	let normalized: Vec<String> = names.iter().map(|name| normalize(name)).collect();
	let mut found = Vec::new();

	if !normalized.is_empty() {
		let statement = [
			sql::BACKLINK_BY_NAME_HEAD,
			&sql::placeholders(normalized.len(), 0),
			sql::BACKLINK_BY_NAME_MIDDLE,
			&sql::placeholders(normalized.len(), normalized.len()),
			sql::BACKLINK_BY_NAME_TAIL,
		]
		.concat();
		let doubled = normalized.iter().chain(normalized.iter());

		collect(
			connection,
			&statement,
			params_from_iter(doubled),
			&mut found,
		)?;
	}

	collect(
		connection,
		sql::BACKLINK_BY_MARKDOWN,
		[markdown_target],
		&mut found,
	)?;

	Ok(unique(found))
}

pub fn mentions(connection: &Connection, terms: &[String]) -> Result<Option<Vec<NoteRef>>> {
	if terms
		.iter()
		.any(|term| term.chars().count() < sql::MIN_TRIGRAM_LENGTH)
	{
		return Ok(None);
	}

	if terms.is_empty() {
		return Ok(Some(Vec::new()));
	}

	let query = terms
		.iter()
		.map(|term| phrase(term))
		.collect::<Vec<_>>()
		.join(sql::FTS_OR);
	let mut found = Vec::new();

	collect(connection, sql::MENTION_CANDIDATES, [query], &mut found)?;

	Ok(Some(unique(found)))
}

fn collect<P: rusqlite::Params>(
	connection: &Connection,
	statement: &str,
	params: P,
	found: &mut Vec<NoteRef>,
) -> Result<()> {
	let mut prepared = connection.prepare(statement)?;
	let mut rows = prepared.query(params)?;

	while let Some(row) = rows.next()? {
		found.push(NoteRef {
			folder_id: row.get(sql::ref_column::FOLDER_ID)?,
			filename: row.get(sql::ref_column::FILENAME)?,
		});
	}

	Ok(())
}

fn unique(notes: Vec<NoteRef>) -> Vec<NoteRef> {
	let mut seen = HashSet::new();

	notes
		.into_iter()
		.filter(|note| seen.insert(note.clone()))
		.collect()
}

fn phrase(term: &str) -> String {
	let escaped = term.replace(sql::FTS_QUOTE, sql::FTS_ESCAPED_QUOTE);

	[sql::FTS_QUOTE, &escaped, sql::FTS_QUOTE].concat()
}
