use super::cache::BodyCache;
use super::prefilter::{Sort, candidates_sql};
use crate::error::Result;
use crate::index::Candidate;
use crate::model::SourceFile;
use crate::source::NoteSource;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

pub struct Warmup {
	source: Arc<dyn NoteSource>,
	cache: Arc<BodyCache>,
	files: Vec<SourceFile>,
	position: Mutex<usize>,
	cancelled: AtomicBool,
}

pub fn statement(folder_ids: &[String]) -> (String, Vec<String>) {
	let statement = candidates_sql(None, folder_ids, Sort::NameAsc);

	(statement.sql, statement.params)
}

impl Warmup {
	pub fn new(
		candidates: Vec<Candidate>,
		source: Arc<dyn NoteSource>,
		cache: Arc<BodyCache>,
	) -> Self {
		let files = candidates
			.into_iter()
			.map(|candidate| SourceFile {
				location: candidate.location,
				filename: candidate.filename,
				modified: candidate.modified,
				size: candidate.size,
			})
			.collect();

		Self {
			source,
			cache,
			files,
			position: Mutex::new(0),
			cancelled: AtomicBool::new(false),
		}
	}

	pub fn cancel(&self) {
		self.cancelled.store(true, Ordering::Relaxed);
	}

	pub fn step(&self, size: usize) -> Result<bool> {
		let mut position = self
			.position
			.lock()
			.unwrap_or_else(|poisoned| poisoned.into_inner());
		let start = *position;
		let end = (start + size).min(self.files.len());

		if self.cancelled.load(Ordering::Relaxed) || start >= end {
			return Ok(true);
		}

		self.cache
			.load(self.source.as_ref(), &self.files[start..end])?;
		*position = end;

		Ok(end >= self.files.len())
	}
}
