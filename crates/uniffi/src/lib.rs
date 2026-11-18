uniffi::setup_scaffolding!("engine");

mod records;
mod source;

use engine::source::FsSource;
use records::{EngineError, IndexedNotesReport, NoteRefsReport, QueryReport, SyncReport, Value};
use source::{ForeignSource, NoteSource, ProgressListener};
use std::collections::HashSet;
use std::sync::Arc;

#[derive(uniffi::Object)]
pub struct Engine {
	inner: engine::engine::Engine,
}

#[uniffi::export]
impl Engine {
	#[uniffi::constructor]
	pub fn new(database_path: String, locale_tag: String) -> Result<Self, EngineError> {
		Ok(Self {
			inner: engine::engine::Engine::new(database_path, &locale_tag)?,
		})
	}

	pub fn sync(
		&self,
		repository_id: String,
		source: Arc<dyn NoteSource>,
		listener: Arc<dyn ProgressListener>,
	) -> Result<SyncReport, EngineError> {
		let source = ForeignSource::new(source);

		Ok(self
			.inner
			.sync(&repository_id, &source, &|done, total| {
				listener.on_progress(done, total)
			})?
			.into())
	}

	pub fn sync_directory(
		&self,
		repository_id: String,
		path: String,
		uri_prefix: String,
		listener: Arc<dyn ProgressListener>,
	) -> Result<SyncReport, EngineError> {
		let source = FsSource::new(path, uri_prefix);

		Ok(self
			.inner
			.sync(&repository_id, &source, &|done, total| {
				listener.on_progress(done, total)
			})?
			.into())
	}

	pub fn indexed_notes(&self) -> Result<IndexedNotesReport, EngineError> {
		Ok(self.inner.indexed_notes()?.into())
	}

	pub fn query(&self, sql: String, params: Vec<Value>) -> Result<QueryReport, EngineError> {
		let bound: Vec<_> = params.into_iter().map(Into::into).collect();
		Ok(self.inner.query(&sql, &bound)?.into())
	}

	pub fn list_notes(&self, repository_ids: Vec<String>) -> Result<String, EngineError> {
		Ok(self.inner.list_notes(&repository_ids)?)
	}

	pub fn backlink_candidates(
		&self,
		names: Vec<String>,
		markdown_target: String,
	) -> Result<NoteRefsReport, EngineError> {
		Ok(self
			.inner
			.backlink_candidates(&names, &markdown_target)?
			.into())
	}

	pub fn mention_candidates(
		&self,
		terms: Vec<String>,
	) -> Result<Option<NoteRefsReport>, EngineError> {
		Ok(self.inner.mention_candidates(&terms)?.map(Into::into))
	}

	pub fn delete_repository(&self, repository_id: String) -> Result<(), EngineError> {
		Ok(self.inner.delete_repository(&repository_id)?)
	}

	pub fn prune(&self, keep: Vec<String>) -> Result<(), EngineError> {
		Ok(self
			.inner
			.prune(&keep.into_iter().collect::<HashSet<_>>())?)
	}
}
