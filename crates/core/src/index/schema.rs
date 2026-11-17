use super::sql;
use crate::error::Result;
use rusqlite::{Connection, OptionalExtension, params};

pub fn prepare(connection: &Connection, locale_tag: &str) -> Result<()> {
	for pragma in sql::PRAGMAS {
		connection.query_row(pragma, [], |_| Ok(())).ok();
	}

	let version: i64 =
		connection.query_row(sql::READ_VERSION, [], |row| row.get(sql::FIRST_COLUMN))?;

	if version == sql::SCHEMA_VERSION && stored_locale(connection).as_deref() == Some(locale_tag) {
		return Ok(());
	}

	rebuild(connection, locale_tag)
}

fn stored_locale(connection: &Connection) -> Option<String> {
	connection
		.query_row(sql::SELECT_META, [sql::LOCALE_META_KEY], |row| {
			row.get(sql::FIRST_COLUMN)
		})
		.optional()
		.ok()
		.flatten()
}

fn rebuild(connection: &Connection, locale_tag: &str) -> Result<()> {
	let transaction = connection.unchecked_transaction()?;

	for statement in sql::DROP_ORDER {
		transaction.execute(statement, [])?;
	}

	for statement in sql::SCHEMA {
		transaction.execute(statement, [])?;
	}

	transaction.execute(sql::CREATE_FTS, [])?;
	transaction.execute(sql::UPSERT_META, params![sql::LOCALE_META_KEY, locale_tag])?;
	transaction.execute_batch(&sql::write_version())?;
	transaction.commit()?;

	Ok(())
}
