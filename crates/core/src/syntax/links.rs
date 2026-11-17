use super::code::code_segments;
use super::patterns::{WIKI_LINK, WIKI_LINK_TARGET_GROUP};

pub fn extract_wiki_links(body: &str) -> Vec<String> {
	let mut links = Vec::new();
	let mut cursor = 0;

	let mut scan = |segment: &str| {
		links.extend(
			WIKI_LINK
				.captures_iter(segment)
				.map(|captures| captures[WIKI_LINK_TARGET_GROUP].to_string()),
		);
	};

	for code in code_segments(body) {
		scan(&body[cursor..code.start]);
		cursor = code.end;
	}

	scan(&body[cursor..]);
	links
}
