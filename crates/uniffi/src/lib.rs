uniffi::setup_scaffolding!("engine");

mod constants;
mod links;
mod records;
mod repository;
mod search;
mod source;

use engine::model::{IndexedNotes, SaveRequest, SyncStats};
use engine::ops::{FolderRef, MoveRequest};
use engine::source::{FsSource, LocationScheme};
use engine::versions::HistoryMove;
use records::{
	DecomposedRecord, EngineError, MoveReport, MoveRequestRecord, NoteFieldsRecord, NoteRefsReport,
	QueryReport, RenameRequestRecord, SaveReport, Value,
};
use repository::{ForeignRepository, RepositoryFiles, VersionsHandle};
use search::{SearchHandle, WarmHandle};
use source::{ForeignSink, ForeignSource, NoteReader, NoteSink, NoteSource, ProgressListener};
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
	) -> Result<SyncStats, EngineError> {
		let source = ForeignSource::new(source);

		Ok(self.inner.sync(&folder_id, &source, &|done, total| {
			listener.on_progress(done, total)
		})?)
	}

	pub fn sync_directory(
		&self,
		folder_id: String,
		path: String,
		uri_prefix: String,
		listener: Arc<dyn ProgressListener>,
	) -> Result<SyncStats, EngineError> {
		let source = FsSource::new(path, LocationScheme::android(uri_prefix));

		Ok(self.inner.sync(&folder_id, &source, &|done, total| {
			listener.on_progress(done, total)
		})?)
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
		requests: Vec<SaveRequest>,
	) -> Result<Vec<SaveReport>, EngineError> {
		let sink = ForeignSink::new(sink);

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
		request: RenameRequestRecord,
		versions: Option<Arc<VersionsHandle>>,
	) -> Result<SaveReport, EngineError> {
		let sink = ForeignSink::new(sink);
		let history = versions.as_ref().map(|handle| HistoryMove {
			versions: handle.core(),
			from_key: &request.from_key,
			to_key: &request.to_key,
		});

		Ok(self
			.inner
			.rename_note(
				&folder_id,
				&sink,
				&request.from,
				&request.to,
				&request.text,
				history.as_ref(),
			)?
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

	pub fn rename_folder(
		&self,
		repository: Arc<dyn RepositoryFiles>,
		versions: Arc<VersionsHandle>,
		path: String,
		new_name: String,
		affected_folder_ids: Vec<String>,
	) -> Result<String, EngineError> {
		let ops = ForeignRepository::new(repository);
		let repository = engine::ops::Repository {
			ops: &ops,
			versions: versions.core(),
		};

		Ok(self
			.inner
			.rename_folder(&repository, &path, &new_name, &affected_folder_ids)?)
	}

	pub fn remove_folder(
		&self,
		repository: Arc<dyn RepositoryFiles>,
		versions: Arc<VersionsHandle>,
		path: String,
		folder_ids: Vec<String>,
		drop_versions: bool,
	) -> Result<(), EngineError> {
		let ops = ForeignRepository::new(repository);
		let repository = engine::ops::Repository {
			ops: &ops,
			versions: versions.core(),
		};

		Ok(self
			.inner
			.remove_folder(&repository, &path, &folder_ids, drop_versions)?)
	}

	pub fn trash_note(
		&self,
		repository: Arc<dyn RepositoryFiles>,
		versions: Arc<VersionsHandle>,
		folder_id: String,
		folder_path: String,
		filename: String,
		trash_path: String,
	) -> Result<String, EngineError> {
		let ops = ForeignRepository::new(repository);
		let repository = engine::ops::Repository {
			ops: &ops,
			versions: versions.core(),
		};

		Ok(self.inner.trash_note(
			&repository,
			&folder_id,
			&folder_path,
			&filename,
			&trash_path,
		)?)
	}

	pub fn move_note(
		&self,
		repository: Arc<dyn RepositoryFiles>,
		versions: Arc<VersionsHandle>,
		request: MoveRequestRecord,
		to_sink: Arc<dyn NoteSink>,
	) -> Result<MoveReport, EngineError> {
		let ops = ForeignRepository::new(repository);
		let repository = engine::ops::Repository {
			ops: &ops,
			versions: versions.core(),
		};
		let sink = ForeignSink::new(to_sink);

		Ok(self
			.inner
			.move_note(
				&repository,
				&MoveRequest {
					filename: &request.filename,
					from: FolderRef {
						id: &request.from_folder_id,
						path: &request.from_path,
					},
					to: FolderRef {
						id: &request.to_folder_id,
						path: &request.to_path,
					},
				},
				&sink,
			)?
			.into())
	}

	pub fn indexed_notes(&self) -> Result<IndexedNotes, EngineError> {
		Ok(self.inner.indexed_notes()?)
	}

	pub fn query(&self, sql: String, params: Vec<Value>) -> Result<QueryReport, EngineError> {
		let bound: Vec<_> = params.into_iter().map(Into::into).collect();
		Ok(self.inner.query(&sql, &bound)?.into())
	}

	pub fn search(
		&self,
		request_json: String,
		reader: Arc<dyn NoteReader>,
	) -> Result<Arc<SearchHandle>, EngineError> {
		search::open(&self.inner, request_json, reader)
	}

	pub fn warm(
		&self,
		folder_ids: Vec<String>,
		reader: Arc<dyn NoteReader>,
	) -> Result<Arc<WarmHandle>, EngineError> {
		search::warm(&self.inner, folder_ids, reader)
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

#[uniffi::export]
pub fn sanitize_filename(title: String, extension: String) -> String {
	engine::names::sanitize_filename(&title, &extension)
}

#[uniffi::export]
pub fn unique_filename(
	existing: Vec<String>,
	stem: String,
	extension: String,
	current: Option<String>,
) -> String {
	engine::names::unique_name(&existing, &stem, &extension, current.as_deref())
}
