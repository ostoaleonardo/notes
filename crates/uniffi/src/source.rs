use crate::records::EngineError;
use engine::error::Result as EngineResult;
use engine::model::{FileStamp, SourceFile};
use engine::source::LocationScheme;
use std::sync::Arc;

#[uniffi::export(with_foreign)]
pub trait NoteReader: Send + Sync {
	fn read(&self, locations: Vec<String>) -> Result<Vec<Option<String>>, EngineError>;
}

#[uniffi::export(with_foreign)]
pub trait NoteSource: Send + Sync {
	fn scan(&self) -> Result<Vec<SourceFile>, EngineError>;
	fn read(&self, locations: Vec<String>) -> Result<Vec<Option<String>>, EngineError>;
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

fn locations_of(files: &[&SourceFile]) -> Vec<String> {
	files.iter().map(|file| file.location.clone()).collect()
}

impl engine::source::NoteReader for ForeignSource {
	fn read(&self, files: &[&SourceFile]) -> EngineResult<Vec<Option<String>>> {
		Ok(self.inner.read(locations_of(files))?)
	}
}

impl engine::source::NoteSource for ForeignSource {
	fn scan(&self) -> EngineResult<Vec<SourceFile>> {
		Ok(self.inner.scan()?)
	}
}

pub struct ForeignReader {
	inner: Arc<dyn NoteReader>,
}

impl ForeignReader {
	pub fn new(inner: Arc<dyn NoteReader>) -> Self {
		Self { inner }
	}
}

impl engine::source::NoteReader for ForeignReader {
	fn read(&self, files: &[&SourceFile]) -> EngineResult<Vec<Option<String>>> {
		Ok(self.inner.read(locations_of(files))?)
	}
}

#[uniffi::export(with_foreign)]
pub trait NoteSink: Send + Sync {
	fn stat(&self, filename: String) -> Result<Option<FileStamp>, EngineError>;
	fn write(&self, filename: String, text: String) -> Result<FileStamp, EngineError>;
	fn delete(&self, filename: String) -> Result<(), EngineError>;
}

pub struct ForeignSink {
	inner: Arc<dyn NoteSink>,
}

impl ForeignSink {
	pub fn new(inner: Arc<dyn NoteSink>) -> Self {
		Self { inner }
	}
}

impl engine::source::NoteSink for ForeignSink {
	fn stat(&self, filename: &str) -> EngineResult<Option<FileStamp>> {
		Ok(self.inner.stat(filename.to_string())?)
	}

	fn write(&self, filename: &str, text: &str) -> EngineResult<FileStamp> {
		Ok(self.inner.write(filename.to_string(), text.to_string())?)
	}

	fn delete(&self, filename: &str) -> EngineResult<()> {
		Ok(self.inner.delete(filename.to_string())?)
	}
}

#[derive(uniffi::Object)]
pub struct FsNoteSink {
	inner: engine::source::FsSink,
}

#[uniffi::export]
impl FsNoteSink {
	#[uniffi::constructor]
	pub fn new(path: String, uri_prefix: String) -> Arc<Self> {
		Arc::new(Self {
			inner: engine::source::FsSink::new(path, LocationScheme::android(uri_prefix)),
		})
	}
}

#[uniffi::export]
impl NoteSink for FsNoteSink {
	fn stat(&self, filename: String) -> Result<Option<FileStamp>, EngineError> {
		Ok(engine::source::NoteSink::stat(&self.inner, &filename)?)
	}

	fn write(&self, filename: String, text: String) -> Result<FileStamp, EngineError> {
		Ok(engine::source::NoteSink::write(
			&self.inner,
			&filename,
			&text,
		)?)
	}

	fn delete(&self, filename: String) -> Result<(), EngineError> {
		Ok(engine::source::NoteSink::delete(&self.inner, &filename)?)
	}
}
