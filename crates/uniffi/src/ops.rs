use crate::Engine;
use crate::records::{EngineError, MoveReport, MoveRequest};
use crate::repository::{ForeignRepository, RepositoryFiles, VersionsHandle};
use crate::source::{ForeignSink, NoteSink};
use engine::ops::{FolderRef, MoveRequest as CoreMoveRequest};
use std::sync::Arc;

#[uniffi::export]
impl Engine {
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
		request: MoveRequest,
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
				&CoreMoveRequest {
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
}
