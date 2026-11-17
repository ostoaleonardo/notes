use engine::syntax::parse_note;

fn first_link(text: &str) -> (String, Option<String>) {
	let note = parse_note(text);
	let link = &note.links[0];

	(link.name.clone(), link.anchor_name.clone())
}

#[test]
fn lowercases_and_trims_the_link_name() {
	assert_eq!(first_link("[[  Mi Nota ]]"), ("mi nota".into(), None));
}

#[test]
fn keeps_only_the_title_after_the_last_slash() {
	assert_eq!(first_link("[[Folder/Sub/Title]]").0, "title");
}

#[test]
fn composes_decomposed_unicode_so_accents_match() {
	assert_eq!(first_link("[[Cafe\u{301}]]").0, "caf\u{e9}");
}

#[test]
fn splits_the_anchor_into_a_second_name() {
	assert_eq!(
		first_link("[[Note#Heading]]"),
		("note#heading".into(), Some("note".into()))
	);
}

#[test]
fn has_no_anchor_name_for_a_link_to_the_same_note() {
	assert_eq!(first_link("[[#Heading]]").1, None);
}

#[test]
fn reads_the_title_of_a_path_before_the_anchor() {
	assert_eq!(first_link("[[Folder/Note#Heading]]").1, Some("note".into()));
}

#[test]
fn collects_markdown_style_links_outside_code() {
	let note =
		parse_note("[a](wikilink://repo/Note.md) `[b](wikilink://x)`\n```\n[c](wikilink://y)\n```");

	assert_eq!(note.markdown_links, ["repo/Note.md"]);
}
