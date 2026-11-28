use crate::Engine;
use crate::records::EngineError;
use crate::source::{ForeignSource, NoteSource, ProgressListener};
use engine::model::SyncStats;
use engine::source::{FsSource, LocationScheme};
use std::sync::Arc;

#[uniffi::export]
impl Engine {
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
}
