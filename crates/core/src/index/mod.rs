mod candidates;
mod notes_json;
mod reader;
mod schema;
mod sql;
mod writer;

use crate::collation::SortKeys;
use crate::error::Result;
use crate::model::{FileMeta, IndexedNote, IndexedNotes, NoteRef, QueryResult, Value};
use rusqlite::{Connection, TransactionBehavior};
use std::collections::{HashMap, HashSet};
use std::path::Path;

pub struct Index {
	connection: Connection,
}

impl Index {
	pub fn open(path: impl AsRef<Path>, locale_tag: &str) -> Result<Self> {
		let connection = Connection::open(path)?;
		schema::prepare(&connection, locale_tag)?;
		Ok(Self { connection })
	}

	pub fn metas(&self, repository_id: &str) -> Result<HashMap<String, FileMeta>> {
		reader::metas(&self.connection, repository_id)
	}

	pub fn indexed_notes(&self) -> Result<IndexedNotes> {
		reader::indexed_notes(&self.connection)
	}

	pub fn query(&self, statement: &str, params: &[Value]) -> Result<QueryResult> {
		reader::query(&self.connection, statement, params)
	}

	pub fn list_notes(&self, repository_ids: &[String]) -> Result<String> {
		notes_json::list(&self.connection, repository_ids)
	}

	pub fn backlink_candidates(
		&self,
		names: &[String],
		markdown_target: &str,
	) -> Result<Vec<NoteRef>> {
		candidates::backlinks(&self.connection, names, markdown_target)
	}

	pub fn mention_candidates(&self, terms: &[String]) -> Result<Option<Vec<NoteRef>>> {
		candidates::mentions(&self.connection, terms)
	}

	pub fn write(
		&mut self,
		repository_id: &str,
		notes: &[IndexedNote],
		removed: &[String],
		keys: &SortKeys,
	) -> Result<()> {
		let transaction = self.immediate()?;
		writer::write_batch(&transaction, repository_id, notes, removed, keys)?;
		transaction.commit()?;

		Ok(())
	}

	pub fn delete_repository(&mut self, repository_id: &str) -> Result<()> {
		let transaction = self.immediate()?;
		writer::delete_repository(&transaction, repository_id)?;
		transaction.commit()?;

		Ok(())
	}

	pub fn prune(&mut self, keep: &HashSet<String>) -> Result<()> {
		let stale: Vec<String> = reader::repositories(&self.connection)?
			.into_iter()
			.filter(|repository| !keep.contains(repository))
			.collect();

		for repository in stale {
			self.delete_repository(&repository)?;
		}

		Ok(())
	}

	fn immediate(&mut self) -> Result<rusqlite::Transaction<'_>> {
		Ok(self
			.connection
			.transaction_with_behavior(TransactionBehavior::Immediate)?)
	}
}
