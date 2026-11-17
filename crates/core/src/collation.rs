use icu_collator::options::CollatorOptions;
use icu_collator::{Collator, CollatorBorrowed, CollatorPreferences};
use icu_locale::Locale;

pub struct SortKeys {
	collator: CollatorBorrowed<'static>,
}

impl SortKeys {
	pub fn new(locale_tag: &str) -> Self {
		let locale: Locale = locale_tag.parse().unwrap_or(Locale::UNKNOWN);
		let collator = Collator::try_new(
			CollatorPreferences::from(&locale),
			CollatorOptions::default(),
		)
		.expect("compiled collation data");
		Self { collator }
	}

	pub fn key(&self, text: &str) -> String {
		let mut bytes = Vec::new();
		let _ = self.collator.write_sort_key_to(text, &mut bytes);
		bytes.iter().map(|byte| format!("{byte:02X}")).collect()
	}
}
