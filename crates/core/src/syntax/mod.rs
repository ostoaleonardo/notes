mod code;
mod constants;
mod frontmatter;
mod link_name;
mod links;
mod patterns;
mod tags;

pub use link_name::normalize;

use crate::model::{ParsedNote, Tag};

pub fn parse_note(text: &str) -> ParsedNote {
	let split = frontmatter::split(text);
	let metadata = frontmatter::read_metadata(split.raw);

	let note_tags = tags::frontmatter_tags(&metadata.mapping)
		.into_iter()
		.map(|name| Tag {
			name,
			inline: false,
		})
		.chain(
			tags::inline_tags(split.body)
				.into_iter()
				.map(|name| Tag { name, inline: true }),
		)
		.collect();

	let content = match split.raw {
		Some(raw) if !raw.is_empty() => {
			[raw, constants::FRONTMATTER_PROPERTY_SEPARATOR, split.body].concat()
		}
		_ => split.body.to_string(),
	};

	let links = links::extract(split.body);

	ParsedNote {
		tags: note_tags,
		links: links.wiki,
		markdown_links: links.markdown,
		properties: frontmatter::properties(&metadata.mapping),
		frontmatter: split.raw.map(str::to_string),
		invalid_frontmatter: metadata.invalid,
		content,
	}
}

pub fn inline_tags(text: &str) -> Vec<String> {
	tags::inline_tags(frontmatter::split(text).body)
}

pub fn wiki_links(text: &str) -> Vec<String> {
	links::extract(frontmatter::split(text).body)
		.wiki
		.into_iter()
		.map(|link| link.text)
		.collect()
}
