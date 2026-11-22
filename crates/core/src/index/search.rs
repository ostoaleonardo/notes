use super::sql;
use crate::error::Result;
use rusqlite::{Connection, params_from_iter};
use serde_json::{Map, Value};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Candidate {
	pub id: i64,
	pub folder_id: String,
	pub filename: String,
	pub location: String,
	pub modified: i64,
	pub size: i64,
	pub title: String,
}

#[derive(Debug, Default)]
pub struct Facets {
	pub tags: HashMap<i64, Vec<String>>,
	pub properties: HashMap<i64, Map<String, Value>>,
}

pub fn candidates(
	connection: &Connection,
	statement_sql: &str,
	params: &[String],
) -> Result<Vec<Candidate>> {
	let mut statement = connection.prepare(statement_sql)?;
	let rows = statement.query_map(params_from_iter(params), |row| {
		Ok(Candidate {
			id: row.get(sql::candidate_column::ID)?,
			folder_id: row.get(sql::candidate_column::FOLDER_ID)?,
			filename: row.get(sql::candidate_column::FILENAME)?,
			location: row.get(sql::candidate_column::LOCATION)?,
			modified: row.get(sql::candidate_column::MODIFIED)?,
			size: row.get(sql::candidate_column::SIZE)?,
			title: row.get(sql::candidate_column::TITLE)?,
		})
	})?;

	Ok(rows.collect::<std::result::Result<_, _>>()?)
}

fn statement_for(head: &str, tail: &str, count: usize) -> String {
	let placeholders = vec![sql::FACET_PLACEHOLDER; count].join(sql::FACET_SEPARATOR);

	format!("{head}{placeholders}{tail}")
}

pub fn facets(connection: &Connection, ids: &[i64]) -> Result<Facets> {
	let mut facets = Facets::default();

	if ids.is_empty() {
		return Ok(facets);
	}

	let mut tags = connection.prepare(&statement_for(
		sql::FACET_TAGS_HEAD,
		sql::FACET_TAGS_TAIL,
		ids.len(),
	))?;
	let mut rows = tags.query(params_from_iter(ids))?;

	while let Some(row) = rows.next()? {
		facets
			.tags
			.entry(row.get(sql::facet_column::NOTE_ID)?)
			.or_default()
			.push(row.get(sql::facet_column::NAME)?);
	}

	let mut properties = connection.prepare(&statement_for(
		sql::FACET_PROPERTIES_HEAD,
		sql::FACET_PROPERTIES_TAIL,
		ids.len(),
	))?;
	let mut rows = properties.query(params_from_iter(ids))?;

	while let Some(row) = rows.next()? {
		let value: String = row.get(sql::facet_column::VALUE)?;

		facets
			.properties
			.entry(row.get(sql::facet_column::NOTE_ID)?)
			.or_default()
			.insert(
				row.get(sql::facet_column::NAME)?,
				serde_json::from_str(&value).unwrap_or(Value::Null),
			);
	}

	Ok(facets)
}
