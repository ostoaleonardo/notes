uniffi::setup_scaffolding!("engine");

mod constants;
mod links;
mod records;
mod source;
mod vault;

use engine::source::{FsSource, LocationScheme};
use records::{
	DecomposedRecord, EngineError, IndexedNotesReport, MoveReport, NoteFieldsRecord,
	NoteRefsReport, QueryReport, SaveReport, SaveRequestRecord, SyncReport, Value,
};
use source::{ForeignSink, ForeignSource, NoteSink, NoteSource, ProgressListener};
use std::collections::HashSet;
use std::sync::Arc;
use vault::{ForeignVault, VaultFs, VersionsHandle};

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
		let source = FsSource::new(path, LocationScheme::android(uri_prefix));

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

	pub fn rename_folder(
		&self,
		vault: Arc<dyn VaultFs>,
		versions: Arc<VersionsHandle>,
		path: String,
		new_name: String,
		affected_folder_ids: Vec<String>,
	) -> Result<String, EngineError> {
		let ops = ForeignVault::new(vault);
		let vault = engine::ops::Vault {
			ops: &ops,
			versions: versions.core(),
		};

		Ok(self
			.inner
			.rename_folder(&vault, &path, &new_name, &affected_folder_ids)?)
	}

	pub fn remove_folder(
		&self,
		vault: Arc<dyn VaultFs>,
		versions: Arc<VersionsHandle>,
		path: String,
		folder_ids: Vec<String>,
		drop_versions: bool,
	) -> Result<(), EngineError> {
		let ops = ForeignVault::new(vault);
		let vault = engine::ops::Vault {
			ops: &ops,
			versions: versions.core(),
		};

		Ok(self
			.inner
			.remove_folder(&vault, &path, &folder_ids, drop_versions)?)
	}

	pub fn trash_note(
		&self,
		vault: Arc<dyn VaultFs>,
		versions: Arc<VersionsHandle>,
		folder_id: String,
		folder_path: String,
		filename: String,
		trash_path: String,
	) -> Result<String, EngineError> {
		let ops = ForeignVault::new(vault);
		let vault = engine::ops::Vault {
			ops: &ops,
			versions: versions.core(),
		};

		Ok(self
			.inner
			.trash_note(&vault, &folder_id, &folder_path, &filename, &trash_path)?)
	}

	#[allow(clippy::too_many_arguments)]
	pub fn move_note(
		&self,
		vault: Arc<dyn VaultFs>,
		versions: Arc<VersionsHandle>,
		filename: String,
		from_folder_id: String,
		from_path: String,
		to_folder_id: String,
		to_path: String,
		to_sink: Arc<dyn NoteSink>,
	) -> Result<MoveReport, EngineError> {
		let ops = ForeignVault::new(vault);
		let vault = engine::ops::Vault {
			ops: &ops,
			versions: versions.core(),
		};
		let sink = ForeignSink::new(to_sink);

		Ok(self
			.inner
			.move_note(
				&vault,
				&filename,
				&from_folder_id,
				&from_path,
				&to_folder_id,
				&to_path,
				&sink,
			)?
			.into())
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
