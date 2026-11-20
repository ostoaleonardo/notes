use super::sql;
use crate::error::Result;
use crate::model::{FileMeta, IndexedNotes, QueryResult, Value};
use rusqlite::types::{Value as SqlValue, ValueRef};
use rusqlite::{Connection, params_from_iter};
use std::collections::HashMap;

pub fn metas(connection: &Connection, folder_id: &str) -> Result<HashMap<String, FileMeta>> {
	let mut statement = connection.prepare_cached(sql::SELECT_METAS)?;
	let rows = statement.query_map([folder_id], |row| {
		Ok((
			row.get::<_, String>(sql::metas_column::FILENAME)?,
			FileMeta {
				modified: row.get(sql::metas_column::MODIFIED)?,
				size: row.get(sql::metas_column::SIZE)?,
			},
		))
	})?;

	Ok(rows.collect::<std::result::Result<_, _>>()?)
}

pub fn indexed_notes(connection: &Connection) -> Result<IndexedNotes> {
	let mut statement = connection.prepare_cached(sql::SELECT_INDEXED)?;
	let mut rows = statement.query([])?;
	let mut notes = IndexedNotes::default();

	while let Some(row) = rows.next()? {
		notes
			.folder_ids
			.push(row.get(sql::indexed_column::FOLDER_ID)?);
		notes
			.filenames
			.push(row.get(sql::indexed_column::FILENAME)?);
		notes.modified.push(row.get(sql::indexed_column::MODIFIED)?);
	}

	Ok(notes)
}

pub fn folders(connection: &Connection) -> Result<Vec<String>> {
	let mut statement = connection.prepare_cached(sql::SELECT_REPOSITORIES)?;
	let rows = statement.query_map([], |row| row.get(sql::FIRST_COLUMN))?;

	Ok(rows.collect::<std::result::Result<_, _>>()?)
}

pub fn query(
	connection: &Connection,
	statement_sql: &str,
	params: &[Value],
) -> Result<QueryResult> {
	let mut statement = connection.prepare(statement_sql)?;
	let columns: Vec<String> = statement.column_names().map(str::to_string).collect();
	let bound: Vec<SqlValue> = params.iter().map(to_sql).collect();
	let mut rows = statement.query(params_from_iter(bound))?;
	let mut result = QueryResult {
		columns,
		rows: Vec::new(),
	};

	while let Some(row) = rows.next()? {
		let cells = (0..result.columns.len())
			.map(|index| row.get_ref(index).map(from_sql))
			.collect::<std::result::Result<Vec<_>, _>>()?;

		result.rows.push(cells);
	}

	Ok(result)
}

fn to_sql(value: &Value) -> SqlValue {
	match value {
		Value::Null => SqlValue::Null,
		Value::Integer(number) => SqlValue::Integer(*number),
		Value::Real(number) => SqlValue::Real(*number),
		Value::Text(text) => SqlValue::Text(text.clone()),
	}
}

fn from_sql(value: ValueRef<'_>) -> Value {
	match value {
		ValueRef::Null => Value::Null,
		ValueRef::Integer(number) => Value::Integer(number),
		ValueRef::Real(number) => Value::Real(number),
		ValueRef::Text(bytes) | ValueRef::Blob(bytes) => {
			Value::Text(String::from_utf8_lossy(bytes).into_owned())
		}
	}
}
