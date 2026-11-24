use crate::records::EngineError;
use crate::source::{ForeignReader, NoteReader};
use engine::engine::Engine as CoreEngine;
use engine::error::Error as CoreError;
use engine::search::{SearchRequest, SearchSession, Warmup};
use std::sync::Arc;

#[derive(uniffi::Record)]
pub struct SearchStepRecord {
	pub folder_ids: Vec<String>,
	pub filenames: Vec<String>,
	pub done: bool,
}

#[derive(uniffi::Object)]
pub struct SearchHandle {
	inner: SearchSession,
}

#[uniffi::export]
impl SearchHandle {
	pub fn step(&self, size: u32) -> Result<SearchStepRecord, EngineError> {
		let step = self.inner.step(size as usize)?;
		let (folder_ids, filenames) = step
			.matches
			.into_iter()
			.map(|note| (note.folder_id, note.filename))
			.unzip();

		Ok(SearchStepRecord {
			folder_ids,
			filenames,
			done: step.done,
		})
	}

	pub fn cancel(&self) {
		self.inner.cancel();
	}

	pub fn total(&self) -> u64 {
		self.inner.total() as u64
	}
}

pub fn open(
	engine: &CoreEngine,
	request_json: String,
	reader: Arc<dyn NoteReader>,
) -> Result<Arc<SearchHandle>, EngineError> {
	let request: SearchRequest = serde_json::from_str(&request_json)
		.map_err(|error| CoreError::InvalidQuery(error.to_string()))?;
	let inner = engine.search(request, Arc::new(ForeignReader::new(reader)))?;

	Ok(Arc::new(SearchHandle { inner }))
}

#[derive(uniffi::Object)]
pub struct WarmHandle {
	inner: Warmup,
}

#[uniffi::export]
impl WarmHandle {
	pub fn step(&self, size: u32) -> Result<bool, EngineError> {
		Ok(self.inner.step(size as usize)?)
	}

	pub fn cancel(&self) {
		self.inner.cancel();
	}
}

pub fn warm(
	engine: &CoreEngine,
	folder_ids: Vec<String>,
	reader: Arc<dyn NoteReader>,
) -> Result<Arc<WarmHandle>, EngineError> {
	let inner = engine.warm(&folder_ids, Arc::new(ForeignReader::new(reader)))?;

	Ok(Arc::new(WarmHandle { inner }))
}
