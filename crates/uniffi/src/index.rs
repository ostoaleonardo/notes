use crate::Engine;
use crate::records::{EngineError, NoteRefsReport, QueryReport, Value};
use engine::model::IndexedNotes;
use std::collections::HashSet;

#[uniffi::export]
impl Engine {
	pub fn indexed_notes(&self) -> Result<IndexedNotes, EngineError> {
		Ok(self.inner.indexed_notes()?)
	}

	pub fn query(&self, sql: String, params: Vec<Value>) -> Result<QueryReport, EngineError> {
		let bound: Vec<_> = params.into_iter().map(Into::into).collect();
		Ok(self.inner.query(&sql, &bound)?.into())
	}

	pub fn list_notes(&self, folder_ids: Vec<String>) -> Result<String, EngineError> {
		Ok(self.inner.list_notes(&folder_ids)?)
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

	pub fn delete_folder(&self, folder_id: String) -> Result<(), EngineError> {
		Ok(self.inner.delete_folder(&folder_id)?)
	}

	pub fn prune(&self, keep: Vec<String>) -> Result<(), EngineError> {
		Ok(self
			.inner
			.prune(&keep.into_iter().collect::<HashSet<_>>())?)
	}
}
