use super::constants::{ANCHOR_SEPARATOR, PATH_SEPARATOR};
use crate::model::Link;
use icu_normalizer::ComposingNormalizerBorrowed;

pub fn describe(text: &str) -> Link {
	Link {
		text: text.to_string(),
		name: normalize(title_of(text)),
		anchor_name: anchor_target(text).map(|target| normalize(title_of(target))),
	}
}

fn anchor_target(text: &str) -> Option<&str> {
	let (target, _) = text.split_once(ANCHOR_SEPARATOR)?;

	(!target.trim().is_empty()).then_some(target)
}

fn title_of(text: &str) -> &str {
	let trimmed = text.trim();

	trimmed
		.rsplit_once(PATH_SEPARATOR)
		.map_or(trimmed, |(_, title)| title)
}

pub fn normalize(text: &str) -> String {
	if text.is_ascii() {
		return text.trim().to_ascii_lowercase();
	}

	ComposingNormalizerBorrowed::new_nfc()
		.normalize(text)
		.trim()
		.to_lowercase()
}
