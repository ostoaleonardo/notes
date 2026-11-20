use super::constants::{
	ALIAS_SEPARATOR, ANCHOR_LABEL_SEPARATOR, ANCHOR_SEPARATOR, LINK_CLOSE, LINK_OPEN,
	PATH_SEPARATOR,
};
use super::index::{FolderPaths, NoteIndex, parse_link_text};
use crate::syntax::normalize;
use crate::syntax::patterns::WIKI_LINK;

pub fn rename_links(
	content: &str,
	target_path: &str,
	new_title: &str,
	index: &NoteIndex<'_>,
	folders: &FolderPaths,
	resolve_folders: &FolderPaths,
) -> String {
	if content.is_empty() {
		return String::new();
	}

	let folder = folders.get(target_path).map_or("", String::as_str);
	let normalized_new = normalize(new_title);

	let ambiguous = !folder.is_empty()
		&& index
			.notes()
			.iter()
			.any(|note| note.path != target_path && normalize(&note.title) == normalized_new);

	let qualified = if ambiguous {
		format!("{folder}{PATH_SEPARATOR}{new_title}")
	} else {
		new_title.to_string()
	};

	WIKI_LINK
		.replace_all(content, |captures: &regex::Captures<'_>| {
			let whole = &captures[0];
			let link_text = &captures[1];
			let alias = captures.get(2).map(|alias| alias.as_str());
			let resolution = index.resolve(link_text, resolve_folders, None);

			let Some(position) = resolution.note else {
				return whole.to_string();
			};

			let note = &index.notes()[position];

			if note.path != target_path
				|| normalize(parse_link_text(&resolution.target).title) != normalize(&note.title)
			{
				return whole.to_string();
			}

			let suffix = if resolution.anchor.is_empty() {
				String::new()
			} else {
				format!("{ANCHOR_SEPARATOR}{}", resolution.anchor)
			};

			if let Some(alias) = alias {
				return format!(
					"{LINK_OPEN}{qualified}{suffix}{ALIAS_SEPARATOR}{alias}{LINK_CLOSE}"
				);
			}

			if !ambiguous {
				return format!("{LINK_OPEN}{new_title}{suffix}{LINK_CLOSE}");
			}

			let label = if resolution.anchor.is_empty() {
				new_title.to_string()
			} else {
				format!("{new_title}{ANCHOR_LABEL_SEPARATOR}{}", resolution.anchor)
			};

			format!("{LINK_OPEN}{qualified}{suffix}{ALIAS_SEPARATOR}{label}{LINK_CLOSE}")
		})
		.into_owned()
}
