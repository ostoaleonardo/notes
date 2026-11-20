use super::constants::{ANCHOR_SEPARATOR, PATH_SEPARATOR};
use crate::syntax::normalize;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LinkNote {
	pub path: String,
	pub title: String,
	pub aliases: Vec<String>,
}

pub type FolderPaths = HashMap<String, String>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Resolution {
	pub note: Option<usize>,
	pub target: String,
	pub anchor: String,
}

pub struct NoteIndex<'a> {
	notes: &'a [LinkNote],
	by_title: HashMap<String, Vec<usize>>,
	by_alias: HashMap<String, Vec<usize>>,
}

pub struct LinkText<'a> {
	pub path: &'a str,
	pub title: &'a str,
}

pub fn parse_link_text(text: &str) -> LinkText<'_> {
	let trimmed = text.trim();

	match trimmed.rfind(PATH_SEPARATOR) {
		Some(index) => LinkText {
			path: &trimmed[..index],
			title: &trimmed[index + PATH_SEPARATOR.len_utf8()..],
		},
		None => LinkText {
			path: "",
			title: trimmed,
		},
	}
}

impl<'a> NoteIndex<'a> {
	pub fn new(notes: &'a [LinkNote]) -> Self {
		let mut by_title: HashMap<String, Vec<usize>> = HashMap::new();
		let mut by_alias: HashMap<String, Vec<usize>> = HashMap::new();

		for (position, note) in notes.iter().enumerate() {
			by_title
				.entry(normalize(&note.title))
				.or_default()
				.push(position);

			let aliases: HashSet<String> =
				note.aliases.iter().map(|alias| normalize(alias)).collect();

			for alias in aliases {
				by_alias.entry(alias).or_default().push(position);
			}
		}

		Self {
			notes,
			by_title,
			by_alias,
		}
	}

	pub fn notes(&self) -> &'a [LinkNote] {
		self.notes
	}

	pub fn find(&self, link_text: &str, folders: &FolderPaths) -> Option<usize> {
		let parsed = parse_link_text(link_text);
		let name = normalize(parsed.title);

		let candidates = match self.by_title.get(&name) {
			Some(found) => found,
			None => self.by_alias.get(&name)?,
		};

		if candidates.len() < 2 || parsed.path.is_empty() {
			return candidates.first().copied();
		}

		let wanted = normalize(parsed.path);

		candidates
			.iter()
			.copied()
			.find(|&position| {
				let folder = folders
					.get(&self.notes[position].path)
					.map_or("", String::as_str);

				normalize(folder) == wanted
			})
			.or_else(|| candidates.first().copied())
	}

	pub fn resolve(
		&self,
		link_text: &str,
		folders: &FolderPaths,
		self_path: Option<&str>,
	) -> Resolution {
		if let Some(note) = self.find(link_text, folders) {
			return Resolution {
				note: Some(note),
				target: link_text.to_string(),
				anchor: String::new(),
			};
		}

		let Some(split) = link_text.find(ANCHOR_SEPARATOR) else {
			return Resolution {
				note: None,
				target: link_text.to_string(),
				anchor: String::new(),
			};
		};

		let target = &link_text[..split];
		let anchor = &link_text[split + ANCHOR_SEPARATOR.len_utf8()..];

		let note = if target.trim().is_empty() {
			self_path.and_then(|path| self.notes.iter().position(|note| note.path == path))
		} else {
			self.find(target, folders)
		};

		Resolution {
			note,
			target: target.to_string(),
			anchor: anchor.to_string(),
		}
	}
}
