use super::constants::{CACHE_EVICT_TO_PERCENT, CACHE_MAX_BYTES};
use crate::error::Result;
use crate::model::SourceFile;
use crate::source::NoteSource;
use crate::syntax::search_text;
use rayon::prelude::*;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

struct Entry {
	modified: i64,
	size: i64,
	content: Arc<str>,
	used: u64,
}

#[derive(Default)]
struct State {
	entries: HashMap<String, Entry>,
	bytes: usize,
	clock: u64,
}

#[derive(Default)]
pub struct BodyCache {
	state: Mutex<State>,
}

impl BodyCache {
	pub fn get(&self, file: &SourceFile) -> Option<Arc<str>> {
		let mut state = self.lock();

		state.clock += 1;
		let clock = state.clock;
		let entry = state.entries.get_mut(&file.location)?;

		if entry.modified != file.modified || entry.size != file.size {
			return None;
		}

		entry.used = clock;
		Some(entry.content.clone())
	}

	pub fn put(&self, file: &SourceFile, content: Arc<str>) {
		let mut state = self.lock();

		state.clock += 1;
		let entry = Entry {
			modified: file.modified,
			size: file.size,
			used: state.clock,
			content,
		};

		state.bytes += entry.content.len();

		if let Some(previous) = state.entries.insert(file.location.clone(), entry) {
			state.bytes -= previous.content.len();
		}

		if state.bytes > CACHE_MAX_BYTES {
			evict(&mut state);
		}
	}

	pub fn load(
		&self,
		source: &dyn NoteSource,
		files: &[SourceFile],
	) -> Result<Vec<Option<Arc<str>>>> {
		let mut contents: Vec<Option<Arc<str>>> = files.iter().map(|file| self.get(file)).collect();
		let missing: Vec<usize> = (0..files.len())
			.filter(|index| contents[*index].is_none())
			.collect();

		if missing.is_empty() {
			return Ok(contents);
		}

		let references: Vec<&SourceFile> = missing.iter().map(|index| &files[*index]).collect();
		let texts = source.read(&references)?;
		let loaded: Vec<Option<Arc<str>>> = texts
			.par_iter()
			.map(|text| text.as_deref().map(|text| Arc::from(search_text(text))))
			.collect();

		for (index, content) in missing.into_iter().zip(loaded) {
			if let Some(content) = &content {
				self.put(&files[index], content.clone());
			}

			contents[index] = content;
		}

		Ok(contents)
	}

	fn lock(&self) -> std::sync::MutexGuard<'_, State> {
		self.state
			.lock()
			.unwrap_or_else(|poisoned| poisoned.into_inner())
	}
}

fn evict(state: &mut State) {
	let target = CACHE_MAX_BYTES / 100 * CACHE_EVICT_TO_PERCENT;
	let mut order: Vec<(u64, String)> = state
		.entries
		.iter()
		.map(|(location, entry)| (entry.used, location.clone()))
		.collect();

	order.sort_unstable();

	for (_, location) in order {
		if state.bytes <= target {
			break;
		}

		if let Some(removed) = state.entries.remove(&location) {
			state.bytes -= removed.content.len();
		}
	}
}
