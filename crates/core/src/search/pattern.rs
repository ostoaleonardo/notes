use super::constants::{ECMASCRIPT_FLAGS_INSENSITIVE, ECMASCRIPT_FLAGS_SENSITIVE};
use super::regex_js;
use crate::error::{Error, Result};

pub trait TextPattern: Send + Sync {
	fn is_match(&self, text: &str) -> bool;
}

impl TextPattern for regex::Regex {
	fn is_match(&self, text: &str) -> bool {
		regex::Regex::is_match(self, text)
	}
}

struct Backtracking(regress::Regex);

impl TextPattern for Backtracking {
	fn is_match(&self, text: &str) -> bool {
		self.0.find(text).is_some()
	}
}

pub fn compile_pattern(source: &str, insensitive: bool) -> Result<Box<dyn TextPattern>> {
	if let Ok(fast) = regex_js::compile(source, insensitive) {
		return Ok(Box::new(fast));
	}

	let flags = if insensitive {
		ECMASCRIPT_FLAGS_INSENSITIVE
	} else {
		ECMASCRIPT_FLAGS_SENSITIVE
	};

	regress::Regex::with_flags(source, flags)
		.map(|engine| Box::new(Backtracking(engine)) as Box<dyn TextPattern>)
		.map_err(|error| Error::InvalidQuery(error.to_string()))
}
