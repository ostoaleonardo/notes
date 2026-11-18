use crate::collation::SortKeys;
use crate::error::Result;
use crate::index::Index;
use crate::model::{
	BatchStats, IndexedNote, IndexedNotes, NoteInput, NoteRef, QueryResult, ReconcilePlan,
	ScannedFile, Value,
};
use crate::reconcile;
use crate::syntax::parse_note;
use rayon::prelude::*;
use std::collections::HashSet;
use std::path::PathBuf;
use std::time::Instant;

pub struct Engine {
	database_path: PathBuf,
	locale_tag: String,
	sort_keys: SortKeys,
}

impl Engine {
	pub fn new(database_path: impl Into<PathBuf>, locale_tag: &str) -> Result<Self> {
		Ok(Self {
			database_path: database_path.into(),
			locale_tag: locale_tag.to_string(),
			sort_keys: SortKeys::new(locale_tag)?,
		})
	}

	pub fn plan(&self, repository_id: &str, scanned: &[ScannedFile]) -> Result<ReconcilePlan> {
		let existing = self.open()?.metas(repository_id)?;
		Ok(reconcile::plan(&existing, scanned))
	}

	pub fn remove(&self, repository_id: &str, filenames: &[String]) -> Result<()> {
		self.open()?
			.write(repository_id, &[], filenames, &self.sort_keys)
	}

	pub fn write(&self, repository_id: &str, inputs: Vec<NoteInput>) -> Result<BatchStats> {
		let parse_start = Instant::now();

		let notes: Vec<IndexedNote> = inputs
			.into_par_iter()
			.map(|input| {
				let parsed = parse_note(&input.text);
				IndexedNote { input, parsed }
			})
			.collect();

		let parse_ms = elapsed_ms(parse_start);
		let write_start = Instant::now();

		self.open()?
			.write(repository_id, &notes, &[], &self.sort_keys)?;

		Ok(BatchStats {
			notes: notes.len() as u32,
			parse_ms,
			write_ms: elapsed_ms(write_start),
		})
	}

	pub fn indexed_notes(&self) -> Result<IndexedNotes> {
		self.open()?.indexed_notes()
	}

	pub fn query(&self, statement: &str, params: &[Value]) -> Result<QueryResult> {
		self.open()?.query(statement, params)
	}

	pub fn list_notes(&self, repository_ids: &[String]) -> Result<String> {
		self.open()?.list_notes(repository_ids)
	}

	pub fn backlink_candidates(
		&self,
		names: &[String],
		markdown_target: &str,
	) -> Result<Vec<NoteRef>> {
		self.open()?.backlink_candidates(names, markdown_target)
	}

	pub fn mention_candidates(&self, terms: &[String]) -> Result<Option<Vec<NoteRef>>> {
		self.open()?.mention_candidates(terms)
	}

	pub fn delete_repository(&self, repository_id: &str) -> Result<()> {
		self.open()?.delete_repository(repository_id)
	}

	pub fn prune(&self, keep: &HashSet<String>) -> Result<()> {
		self.open()?.prune(keep)
	}

	fn open(&self) -> Result<Index> {
		Index::open(&self.database_path, &self.locale_tag)
	}
}

fn elapsed_ms(start: Instant) -> u64 {
	start.elapsed().as_millis() as u64
}
