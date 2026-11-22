use crate::collation::SortKeys;
use crate::constants::FACET_CHUNK;
use crate::error::Result;
use crate::index::Facets;
use crate::model::{
	BatchStats, IndexedNote, IndexedNotes, NoteInput, NoteRef, QueryResult, ReconcilePlan,
	ScannedFile, Value,
};
use crate::pool::{Lease, Pool};
use crate::reconcile;
use crate::search::{self, BodyCache, SearchRequest, SearchSession, Warmup};
use crate::source::NoteSource;
use crate::syntax::parse_note;
use rayon::prelude::*;
use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;

pub struct Engine {
	pool: Pool,
	sort_keys: SortKeys,
	bodies: Arc<BodyCache>,
}

impl Engine {
	pub fn new(database_path: impl Into<PathBuf>, locale_tag: &str) -> Result<Self> {
		Ok(Self {
			pool: Pool::new(database_path.into(), locale_tag.to_string()),
			sort_keys: SortKeys::new(locale_tag)?,
			bodies: Arc::default(),
		})
	}

	pub fn plan(&self, folder_id: &str, scanned: &[ScannedFile]) -> Result<ReconcilePlan> {
		let existing = self.open()?.metas(folder_id)?;
		Ok(reconcile::plan(&existing, scanned))
	}

	pub fn remove(&self, folder_id: &str, filenames: &[String]) -> Result<()> {
		self.open()?
			.write(folder_id, &[], filenames, &self.sort_keys)
	}

	pub fn write(&self, folder_id: &str, inputs: Vec<NoteInput>) -> Result<BatchStats> {
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
			.write(folder_id, &notes, &[], &self.sort_keys)?;

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

	pub fn search(
		&self,
		request: SearchRequest,
		source: Arc<dyn NoteSource>,
	) -> Result<SearchSession> {
		let planned = search::plan(&request)?;
		let index = self.open()?;
		let candidates = index.search_candidates(&planned.statement, &planned.params)?;
		let ids: Vec<i64> = candidates.iter().map(|candidate| candidate.id).collect();
		let mut facets = Facets::default();

		for chunk in ids.chunks(FACET_CHUNK) {
			let part = index.facets(chunk)?;

			facets.tags.extend(part.tags);
			facets.properties.extend(part.properties);
		}

		Ok(SearchSession::new(
			request,
			planned.query,
			candidates,
			facets,
			source,
			self.bodies.clone(),
		))
	}

	pub fn warm(&self, folder_ids: &[String], source: Arc<dyn NoteSource>) -> Result<Warmup> {
		let (statement, params) = search::warm_statement(folder_ids);
		let candidates = self.open()?.search_candidates(&statement, &params)?;

		Ok(Warmup::new(candidates, source, self.bodies.clone()))
	}

	pub fn list_notes(&self, folder_ids: &[String]) -> Result<String> {
		self.open()?.list_notes(folder_ids)
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

	pub fn delete_folder(&self, folder_id: &str) -> Result<()> {
		self.open()?.delete_folder(folder_id)
	}

	pub fn prune(&self, keep: &HashSet<String>) -> Result<()> {
		self.open()?.prune(keep)
	}

	fn open(&self) -> Result<Lease<'_>> {
		self.pool.lease()
	}
}

fn elapsed_ms(start: Instant) -> u64 {
	start.elapsed().as_millis() as u64
}
