uniffi::setup_scaffolding!("engine");

mod records;

use records::{
	BatchReport, EngineError, IndexedNotesReport, NoteRecord, PlanReport, QueryReport,
	ScannedRecord, Value,
};
use std::collections::HashSet;

#[derive(uniffi::Object)]
pub struct Engine {
	inner: engine::engine::Engine,
}

#[uniffi::export]
impl Engine {
	#[uniffi::constructor]
	pub fn new(database_path: String, locale_tag: String) -> Self {
		Self {
			inner: engine::engine::Engine::new(database_path, &locale_tag),
		}
	}

	pub fn plan(
		&self,
		repository_id: String,
		scanned: Vec<ScannedRecord>,
	) -> Result<PlanReport, EngineError> {
		let files: Vec<_> = scanned.into_iter().map(Into::into).collect();
		Ok(self.inner.plan(&repository_id, &files)?.into())
	}

	pub fn remove(&self, repository_id: String, filenames: Vec<String>) -> Result<(), EngineError> {
		Ok(self.inner.remove(&repository_id, &filenames)?)
	}

	pub fn write(
		&self,
		repository_id: String,
		notes: Vec<NoteRecord>,
	) -> Result<BatchReport, EngineError> {
		let inputs = notes.into_iter().map(Into::into).collect();
		Ok(self.inner.write(&repository_id, inputs)?.into())
	}

	pub fn indexed_notes(&self) -> Result<IndexedNotesReport, EngineError> {
		Ok(self.inner.indexed_notes()?.into())
	}

	pub fn query(&self, sql: String, params: Vec<Value>) -> Result<QueryReport, EngineError> {
		let bound: Vec<_> = params.into_iter().map(Into::into).collect();
		Ok(self.inner.query(&sql, &bound)?.into())
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
