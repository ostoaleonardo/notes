use crate::records::EngineError;
use crate::source::{ForeignSource, NoteSource};
use engine::engine::Engine as CoreEngine;
use engine::error::Error as CoreError;
use engine::search::{Node, SearchRequest, SearchSession, Sort, Warmup};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

#[derive(uniffi::Record)]
pub struct FolderPathRecord {
	pub folder_id: String,
	pub path: String,
}

#[derive(uniffi::Record)]
pub struct SearchRequestRecord {
	pub query_json: String,
	pub sort: String,
	pub folder_ids: Vec<String>,
	pub folder_paths: Vec<FolderPathRecord>,
	pub pinned: Vec<String>,
	pub match_case: bool,
}

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

fn parse(record: SearchRequestRecord) -> Result<SearchRequest, CoreError> {
	let query: Node = serde_json::from_str(&record.query_json)
		.map_err(|error| CoreError::InvalidQuery(error.to_string()))?;
	let sort: Sort = serde_json::from_value(serde_json::Value::String(record.sort))
		.map_err(|error| CoreError::InvalidQuery(error.to_string()))?;

	Ok(SearchRequest {
		query,
		sort,
		folder_ids: record.folder_ids,
		folder_paths: record
			.folder_paths
			.into_iter()
			.map(|entry| (entry.folder_id, entry.path))
			.collect::<HashMap<_, _>>(),
		pinned: record.pinned.into_iter().collect::<HashSet<_>>(),
		match_case: record.match_case,
	})
}

pub fn open(
	engine: &CoreEngine,
	record: SearchRequestRecord,
	source: Arc<dyn NoteSource>,
) -> Result<Arc<SearchHandle>, EngineError> {
	let request = parse(record)?;
	let inner = engine.search(request, Arc::new(ForeignSource::new(source)))?;

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
	source: Arc<dyn NoteSource>,
) -> Result<Arc<WarmHandle>, EngineError> {
	let inner = engine.warm(&folder_ids, Arc::new(ForeignSource::new(source)))?;

	Ok(Arc::new(WarmHandle { inner }))
}
