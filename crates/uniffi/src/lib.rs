uniffi::setup_scaffolding!("engine");

mod links;
mod records;
mod source;
mod vault;

use engine::source::FsSource;
use records::{
	DecomposedRecord, EngineError, IndexedNotesReport, NoteFieldsRecord, NoteRefsReport,
	QueryReport, SaveReport, SaveRequestRecord, SyncReport, Value,
};
use source::{ForeignSink, ForeignSource, NoteSink, NoteSource, ProgressListener};
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
		folder_id: String,
		source: Arc<dyn NoteSource>,
		listener: Arc<dyn ProgressListener>,
	) -> Result<SyncReport, EngineError> {
		let source = ForeignSource::new(source);

		Ok(self
			.inner
			.sync(&folder_id, &source, &|done, total| {
				listener.on_progress(done, total)
			})?
			.into())
	}

	pub fn sync_directory(
		&self,
		folder_id: String,
		path: String,
		uri_prefix: String,
		listener: Arc<dyn ProgressListener>,
	) -> Result<SyncReport, EngineError> {
		let source = FsSource::new(path, uri_prefix);

		Ok(self
			.inner
			.sync(&folder_id, &source, &|done, total| {
				listener.on_progress(done, total)
			})?
			.into())
	}

	pub fn save_note(
		&self,
		folder_id: String,
		sink: Arc<dyn NoteSink>,
		filename: String,
		text: String,
		expected_modified: Option<i64>,
	) -> Result<SaveReport, EngineError> {
		let sink = ForeignSink::new(sink);

		Ok(self
			.inner
			.save_note(&folder_id, &sink, &filename, &text, expected_modified)?
			.into())
	}

	pub fn save_notes(
		&self,
		folder_id: String,
		sink: Arc<dyn NoteSink>,
		requests: Vec<SaveRequestRecord>,
	) -> Result<Vec<SaveReport>, EngineError> {
		let sink = ForeignSink::new(sink);
		let requests: Vec<_> = requests.into_iter().map(Into::into).collect();

		Ok(self
			.inner
			.save_notes(&folder_id, &sink, &requests)?
			.into_iter()
			.map(Into::into)
			.collect())
	}

	pub fn rename_note(
		&self,
		folder_id: String,
		sink: Arc<dyn NoteSink>,
		from: String,
		to: String,
		text: String,
	) -> Result<SaveReport, EngineError> {
		let sink = ForeignSink::new(sink);

		Ok(self
			.inner
			.rename_note(&folder_id, &sink, &from, &to, &text)?
			.into())
	}

	pub fn delete_note(
		&self,
		folder_id: String,
		sink: Arc<dyn NoteSink>,
		filename: String,
	) -> Result<(), EngineError> {
		let sink = ForeignSink::new(sink);

		Ok(self.inner.delete_note(&folder_id, &sink, &filename)?)
	}

	pub fn indexed_notes(&self) -> Result<IndexedNotesReport, EngineError> {
		Ok(self.inner.indexed_notes()?.into())
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

#[uniffi::export]
pub fn compose_note(fields: NoteFieldsRecord, body: String) -> Result<String, EngineError> {
	Ok(engine::syntax::compose(&fields.try_into()?, &body))
}

#[uniffi::export]
pub fn decompose_note(content: String) -> DecomposedRecord {
	engine::syntax::decompose(&content).into()
}
