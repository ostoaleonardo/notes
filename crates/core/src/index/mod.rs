mod candidates;
mod constants;
mod notes_json;
mod reader;
mod schema;
mod search;
mod sql;
mod writer;

use crate::collation::SortKeys;
use crate::error::Result;
use crate::model::{FileMeta, IndexedNote, IndexedNotes, NoteRef, QueryResult, Value};
use rusqlite::{Connection, TransactionBehavior};
use std::collections::{HashMap, HashSet};
use std::path::Path;

pub use search::{Candidate, Facets};

pub struct Index {
	connection: Connection,
}

impl Index {
	pub fn open(path: impl AsRef<Path>, locale_tag: &str) -> Result<Self> {
		let connection = Connection::open(path)?;
		schema::prepare(&connection, locale_tag)?;
		Ok(Self { connection })
	}

	pub fn metas(&self, folder_id: &str) -> Result<HashMap<String, FileMeta>> {
		reader::metas(&self.connection, folder_id)
	}

	pub fn indexed_notes(&self) -> Result<IndexedNotes> {
		reader::indexed_notes(&self.connection)
	}

	pub fn query(&self, statement: &str, params: &[Value]) -> Result<QueryResult> {
		reader::query(&self.connection, statement, params)
	}

	pub fn search_candidates(&self, statement: &str, params: &[String]) -> Result<Vec<Candidate>> {
		search::candidates(&self.connection, statement, params)
	}

	pub fn facets(&self, ids: &[i64]) -> Result<Facets> {
		search::facets(&self.connection, ids)
	}

	pub fn list_notes(&self, folder_ids: &[String]) -> Result<String> {
		notes_json::list(&self.connection, folder_ids)
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
		folder_id: &str,
		notes: &[IndexedNote],
		removed: &[String],
		keys: &SortKeys,
	) -> Result<()> {
		let transaction = self.immediate()?;
		writer::write_batch(&transaction, folder_id, notes, removed, keys)?;
		transaction.commit()?;

		Ok(())
	}

	pub fn delete_folder(&mut self, folder_id: &str) -> Result<()> {
		let transaction = self.immediate()?;
		writer::delete_folder(&transaction, folder_id)?;
		transaction.commit()?;

		Ok(())
	}

	pub fn prune(&mut self, keep: &HashSet<String>) -> Result<()> {
		let stale: Vec<String> = reader::folders(&self.connection)?
			.into_iter()
			.filter(|folder| !keep.contains(folder))
			.collect();

		for folder in stale {
			self.delete_folder(&folder)?;
		}

		Ok(())
	}

	fn immediate(&mut self) -> Result<rusqlite::Transaction<'_>> {
		Ok(self
			.connection
			.transaction_with_behavior(TransactionBehavior::Immediate)?)
	}
}
