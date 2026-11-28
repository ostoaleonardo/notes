use super::Query;
use super::cache::BodyCache;
use super::constants::NOTE_PATH_SEPARATOR;
use super::evaluate::NoteView;
use super::prefilter::{Sort, candidates_sql, requirement_of};
use super::query::Node;
use super::unindexed::UnindexedNote;
use crate::error::Result;
use crate::index::{Candidate, Facets};
use crate::model::{NoteRef, SourceFile};
use crate::source::NoteReader;
use rayon::prelude::*;
use serde::Deserialize;
use serde_json::Map;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchRequest {
	pub query: Node,
	pub sort: Sort,
	pub folder_ids: Vec<String>,
	pub folder_path_by_id: HashMap<String, String>,
	pub pinned: HashSet<String>,
	pub match_case: bool,
	#[serde(default)]
	pub unindexed: Vec<UnindexedNote>,
}

pub struct SearchStep {
	pub matches: Vec<NoteRef>,
	pub done: bool,
}

pub struct SearchSession {
	source: Arc<dyn NoteReader>,
	cache: Arc<BodyCache>,
	query: Query,
	candidates: Vec<Candidate>,
	facets: Facets,
	folder_path_by_id: HashMap<String, String>,
	pinned: HashSet<String>,
	match_case: bool,
	position: Mutex<usize>,
	cancelled: AtomicBool,
}

pub struct Plan {
	pub statement: String,
	pub params: Vec<String>,
	pub query: Query,
}

pub fn plan(request: &SearchRequest) -> Result<Plan> {
	let query = Query::compile(&request.query)?;
	let folders: Vec<String> = request.folder_path_by_id.values().cloned().collect();
	let tree = requirement_of(&request.query, &folders);
	let statement = candidates_sql(tree.as_ref(), &request.folder_ids, request.sort);

	Ok(Plan {
		statement: statement.sql,
		params: statement.params,
		query,
	})
}

impl SearchSession {
	pub fn new(
		request: SearchRequest,
		query: Query,
		candidates: Vec<Candidate>,
		facets: Facets,
		source: Arc<dyn NoteReader>,
		cache: Arc<BodyCache>,
	) -> Self {
		Self {
			source,
			cache,
			query,
			candidates,
			facets,
			folder_path_by_id: request.folder_path_by_id,
			pinned: request.pinned,
			match_case: request.match_case,
			position: Mutex::new(0),
			cancelled: AtomicBool::new(false),
		}
	}

	pub fn cancel(&self) {
		self.cancelled.store(true, Ordering::Relaxed);
	}

	pub fn total(&self) -> usize {
		self.candidates.len()
	}

	pub fn step(&self, size: usize) -> Result<SearchStep> {
		let mut position = self
			.position
			.lock()
			.unwrap_or_else(|poisoned| poisoned.into_inner());
		let start = *position;
		let end = (start + size).min(self.candidates.len());

		if self.cancelled.load(Ordering::Relaxed) || start >= end {
			return Ok(SearchStep {
				matches: Vec::new(),
				done: true,
			});
		}

		let batch = &self.candidates[start..end];
		let files: Vec<SourceFile> = batch
			.iter()
			.map(|candidate| SourceFile {
				location: candidate.location.clone(),
				filename: candidate.filename.clone(),
				modified: candidate.modified,
				size: candidate.size,
			})
			.collect();
		let contents = self.cache.load(self.source.as_ref(), &files)?;

		*position = end;

		let matches = batch
			.par_iter()
			.zip(contents.par_iter())
			.filter_map(|(candidate, content)| {
				let content = content.as_deref()?;

				self.matches(candidate, content).then(|| NoteRef {
					folder_id: candidate.folder_id.clone(),
					filename: candidate.filename.clone(),
				})
			})
			.collect();

		Ok(SearchStep {
			matches,
			done: end >= self.candidates.len(),
		})
	}

	fn matches(&self, candidate: &Candidate, content: &str) -> bool {
		let empty_properties = Map::new();
		let tags: &[String] = self
			.facets
			.tags
			.get(&candidate.id)
			.map_or(&[], Vec::as_slice);
		let path = format!(
			"{}{NOTE_PATH_SEPARATOR}{}",
			candidate.folder_id, candidate.filename
		);
		self.query.matches(
			&NoteView {
				title: &candidate.title,
				filename: &candidate.filename,
				folder: self
					.folder_path_by_id
					.get(&candidate.folder_id)
					.map(String::as_str),
				content,
				tags,
				properties: self
					.facets
					.properties
					.get(&candidate.id)
					.unwrap_or(&empty_properties),
				pinned: self.pinned.contains(&path),
			},
			self.match_case,
		)
	}
}
