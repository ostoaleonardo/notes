use crate::records::{EngineError, SourceRecord};
use engine::error::Result as EngineResult;
use engine::model::SourceFile;
use std::sync::Arc;

#[uniffi::export(with_foreign)]
pub trait NoteSource: Send + Sync {
	fn scan(&self) -> Result<Vec<SourceRecord>, EngineError>;
	fn read(&self, uris: Vec<String>) -> Result<Vec<Option<String>>, EngineError>;
}

#[uniffi::export(with_foreign)]
pub trait ProgressListener: Send + Sync {
	fn on_progress(&self, done: u32, total: u32);
}

pub struct ForeignSource {
	inner: Arc<dyn NoteSource>,
}

impl ForeignSource {
	pub fn new(inner: Arc<dyn NoteSource>) -> Self {
		Self { inner }
	}
}

impl engine::source::NoteSource for ForeignSource {
	fn scan(&self) -> EngineResult<Vec<SourceFile>> {
		Ok(self
			.inner
			.scan()?
			.into_iter()
			.map(SourceFile::from)
			.collect())
	}

	fn read(&self, files: &[&SourceFile]) -> EngineResult<Vec<Option<String>>> {
		let uris = files.iter().map(|file| file.uri.clone()).collect();

		Ok(self.inner.read(uris)?)
	}
}
