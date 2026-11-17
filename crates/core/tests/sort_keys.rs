use engine::collation::SortKeys;

fn sorted(locale: &str, words: &[&str]) -> Vec<String> {
	let keys = SortKeys::new(locale);
	let mut items: Vec<_> = words.iter().map(|w| (keys.key(w), w.to_string())).collect();
	items.sort();
	items.into_iter().map(|(_, word)| word).collect()
}

#[test]
fn orders_accents_next_to_their_base_letter() {
	assert_eq!(
		sorted("en", &["zebra", "Éclair", "apple", "eclair"]),
		["apple", "eclair", "Éclair", "zebra"]
	);
}

#[test]
fn places_n_with_tilde_after_n_in_spanish_only() {
	assert_eq!(sorted("es", &["nz", "ña", "oa"]), ["nz", "ña", "oa"]);
	assert_eq!(sorted("sv", &["ä", "z", "a"]), ["a", "z", "ä"]);
	assert_eq!(sorted("en", &["ä", "z", "a"]), ["a", "ä", "z"]);
}

#[test]
fn ignores_case_at_the_primary_level() {
	assert_eq!(sorted("en", &["b", "A", "a", "B"]), ["a", "A", "b", "B"]);
}

#[test]
fn falls_back_to_root_for_unknown_locales() {
	assert_eq!(sorted("zz-invalid-", &["b", "a"]), ["a", "b"]);
}
