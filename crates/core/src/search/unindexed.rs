use super::prefilter::Sort;
use crate::collation::SortKeys;
use crate::index::{Candidate, Facets};
use serde::Deserialize;
use serde_json::{Map, Value};
use std::cmp::Ordering;
use std::collections::HashSet;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnindexedNote {
	pub folder_id: String,
	pub filename: String,
	pub location: String,
	pub title: String,
	pub modified: i64,
	#[serde(default)]
	pub size: i64,
	#[serde(default)]
	pub tags: Vec<String>,
	#[serde(default)]
	pub properties: Map<String, Value>,
}

pub struct Combined {
	pub candidates: Vec<Candidate>,
	pub facets: Facets,
}

struct Ranked {
	key: String,
	candidate: Candidate,
}

fn compare(sort: Sort, left: &Ranked, right: &Ranked) -> Ordering {
	let by_key = left.key.cmp(&right.key);
	let by_id = left.candidate.id.cmp(&right.candidate.id);
	let by_modified = left.candidate.modified.cmp(&right.candidate.modified);

	match sort {
		Sort::NameAsc => by_key.then(by_id),
		Sort::NameDesc => by_key.then(by_id).reverse(),
		Sort::ModifiedDesc | Sort::CreatedDesc => by_modified.reverse().then(by_key).then(by_id),
		Sort::ModifiedAsc | Sort::CreatedAsc => by_modified.then(by_key).then(by_id),
	}
}

fn synthetic_id(position: usize) -> i64 {
	-(position as i64) - 1
}

pub fn combine(
	indexed: Vec<Candidate>,
	unindexed: Vec<UnindexedNote>,
	sort: Sort,
	keys: &SortKeys,
) -> Combined {
	if unindexed.is_empty() {
		return Combined {
			candidates: indexed,
			facets: Facets::default(),
		};
	}

	let replaced: HashSet<(String, String)> = unindexed
		.iter()
		.map(|note| (note.folder_id.clone(), note.filename.clone()))
		.collect();
	let mut facets = Facets::default();
	let mut ranked: Vec<Ranked> = indexed
		.into_iter()
		.filter(|candidate| {
			!replaced.contains(&(candidate.folder_id.clone(), candidate.filename.clone()))
		})
		.map(|candidate| Ranked {
			key: keys.key(&candidate.title),
			candidate,
		})
		.collect();

	for (position, note) in unindexed.into_iter().enumerate() {
		let id = synthetic_id(position);

		facets.tags.insert(id, note.tags);
		facets.properties.insert(id, note.properties);
		ranked.push(Ranked {
			key: keys.key(&note.title),
			candidate: Candidate {
				id,
				folder_id: note.folder_id,
				filename: note.filename,
				location: note.location,
				modified: note.modified,
				size: note.size,
				title: note.title,
			},
		});
	}

	ranked.sort_by(|left, right| compare(sort, left, right));

	Combined {
		candidates: ranked.into_iter().map(|entry| entry.candidate).collect(),
		facets,
	}
}
