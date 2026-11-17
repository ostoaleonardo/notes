use super::code::code_segments;
use super::link_name::describe;
use super::patterns::{
	MARKDOWN_LINK, MARKDOWN_LINK_TARGET_GROUP, WIKI_LINK, WIKI_LINK_TARGET_GROUP,
};
use crate::model::Link;

pub struct Links {
	pub wiki: Vec<Link>,
	pub markdown: Vec<String>,
}

pub fn extract(body: &str) -> Links {
	let mut links = Links {
		wiki: Vec::new(),
		markdown: Vec::new(),
	};
	let mut cursor = 0;

	let mut scan = |segment: &str| {
		links.wiki.extend(
			WIKI_LINK
				.captures_iter(segment)
				.map(|captures| describe(&captures[WIKI_LINK_TARGET_GROUP])),
		);
		links.markdown.extend(
			MARKDOWN_LINK
				.captures_iter(segment)
				.map(|captures| captures[MARKDOWN_LINK_TARGET_GROUP].to_string()),
		);
	};

	for code in code_segments(body) {
		scan(&body[cursor..code.start]);
		cursor = code.end;
	}

	scan(&body[cursor..]);
	links
}
