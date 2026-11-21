use super::constants::{LABEL_CLOSE, LINK_OPEN, MARKDOWN_TARGET_OPEN};
use super::index::{FolderPaths, NoteIndex};
use super::scan::wiki_targets;
use crate::syntax::patterns::MARKDOWN_LINK;

pub struct Candidate<'a> {
	pub path: &'a str,
	pub body: &'a str,
}

fn links_to(body: &str, target_path: &str, index: &NoteIndex<'_>, folders: &FolderPaths) -> bool {
	let markdown = body.contains(MARKDOWN_TARGET_OPEN)
		&& MARKDOWN_LINK
			.find_iter(body)
			.any(|found| markdown_target(found.as_str()) == target_path);

	if markdown {
		return true;
	}

	body.contains(LINK_OPEN)
		&& wiki_targets(body).into_iter().any(|target| {
			index
				.locate(target, folders)
				.is_some_and(|position| index.notes()[position].path == target_path)
		})
}

pub fn find_backlinks<'a>(
	target_path: &str,
	index: &NoteIndex<'_>,
	folders: &FolderPaths,
	candidates: &[Candidate<'a>],
) -> Vec<&'a str> {
	candidates
		.iter()
		.filter(|candidate| {
			candidate.path != target_path && links_to(candidate.body, target_path, index, folders)
		})
		.map(|candidate| candidate.path)
		.collect()
}

fn markdown_target(link: &str) -> &str {
	let label_end = link.find(LABEL_CLOSE).unwrap_or(0);

	&link[label_end + 1 + MARKDOWN_TARGET_OPEN.len()..link.len() - 1]
}
