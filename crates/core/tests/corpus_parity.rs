mod common;

use common::{corpus, dedupe_ignoring_case, expected, frontmatter_of, strings};
use engine::syntax::{inline_tags, wiki_links};

#[test]
fn extracts_the_same_wiki_links_as_the_reference_corpus() {
	let expected = expected();

	for (name, text) in corpus() {
		let reference: Vec<String> = strings(&expected[&name]["links"])
			.into_iter()
			.filter(|link| !frontmatter_of(&text).contains(&format!("[[{link}")))
			.collect();

		assert_eq!(wiki_links(&text), reference, "links of {name}");
	}
}

#[test]
fn extracts_the_same_inline_tags_as_the_reference_corpus() {
	let expected = expected();

	for (name, text) in corpus() {
		let reference: Vec<String> = expected[&name]["tags"]
			.as_array()
			.expect("tags")
			.iter()
			.map(|tag| tag["name"].as_str().expect("name").to_string())
			.collect();

		assert_eq!(
			inline_tags(&text),
			dedupe_ignoring_case(reference),
			"tags of {name}"
		);
	}
}
