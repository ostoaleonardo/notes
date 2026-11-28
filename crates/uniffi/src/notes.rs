use crate::Engine;
use crate::records::{EngineError, RenameRequest, SaveReport};
use crate::repository::VersionsHandle;
use crate::source::{ForeignSink, NoteSink};
use engine::model::SaveRequest;
use engine::versions::HistoryMove;
use std::sync::Arc;

#[uniffi::export]
impl Engine {
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
		request: RenameRequest,
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
}
