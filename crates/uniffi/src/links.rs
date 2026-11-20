use engine::links::{Candidate, FolderPaths, LinkNote, NoteIndex, find_backlinks, rename_links};
use std::collections::HashMap;

#[derive(uniffi::Record)]
pub struct LinkNoteRecord {
	pub path: String,
	pub title: String,
	pub aliases: Vec<String>,
}

impl From<LinkNoteRecord> for LinkNote {
	fn from(record: LinkNoteRecord) -> Self {
		Self {
			path: record.path,
			title: record.title,
			aliases: record.aliases,
		}
	}
}

fn notes_of(records: Vec<LinkNoteRecord>) -> Vec<LinkNote> {
	records.into_iter().map(Into::into).collect()
}

#[uniffi::export]
pub fn find_backlink_paths(
	notes: Vec<LinkNoteRecord>,
	folders: HashMap<String, String>,
	target_path: String,
	candidate_paths: Vec<String>,
	candidate_bodies: Vec<String>,
) -> Vec<String> {
	let notes = notes_of(notes);
	let index = NoteIndex::new(&notes);
	let folders: FolderPaths = folders;

	let candidates: Vec<Candidate<'_>> = candidate_paths
		.iter()
		.zip(&candidate_bodies)
		.map(|(path, body)| Candidate { path, body })
		.collect();

	find_backlinks(&target_path, &index, &folders, &candidates)
		.into_iter()
		.map(str::to_string)
		.collect()
}

#[uniffi::export]
pub fn rename_links_in_bodies(
	notes: Vec<LinkNoteRecord>,
	folders: HashMap<String, String>,
	resolve_folders: Option<HashMap<String, String>>,
	target_path: String,
	new_title: String,
	bodies: Vec<String>,
) -> Vec<String> {
	let notes = notes_of(notes);
	let index = NoteIndex::new(&notes);
	let resolve = resolve_folders.as_ref().unwrap_or(&folders);

	bodies
		.iter()
		.map(|body| rename_links(body, &target_path, &new_title, &index, &folders, resolve))
		.collect()
}
