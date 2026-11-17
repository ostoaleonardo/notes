mod code;
mod constants;
mod frontmatter;
mod links;
mod patterns;
mod tags;

use crate::model::ParsedNote;

pub fn parse_note(text: &str) -> ParsedNote {
	let split = frontmatter::split(text);
	let metadata = frontmatter::read_metadata(split.raw);

	let mut note_tags = tags::frontmatter_tags(&metadata.mapping);
	note_tags.extend(tags::inline_tags(split.body));

	let content = match split.raw {
		Some(raw) if !raw.is_empty() => {
			[raw, constants::FRONTMATTER_PROPERTY_SEPARATOR, split.body].concat()
		}
		_ => split.body.to_string(),
	};

	ParsedNote {
		tags: note_tags,
		links: links::extract_wiki_links(split.body),
		property_keys: frontmatter::property_keys(&metadata.mapping),
		invalid_frontmatter: metadata.invalid,
		content,
	}
}

pub fn inline_tags(text: &str) -> Vec<String> {
	tags::inline_tags(frontmatter::split(text).body)
}

pub fn wiki_links(text: &str) -> Vec<String> {
	links::extract_wiki_links(frontmatter::split(text).body)
}
