use super::percent::encode;
use std::path::Path;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LocationScheme {
	AndroidDocument { prefix: String },
	FilePath,
}

impl LocationScheme {
	pub fn android(prefix: impl Into<String>) -> Self {
		Self::AndroidDocument {
			prefix: prefix.into(),
		}
	}

	pub(crate) fn locate(&self, root: &Path, filename: &str) -> String {
		match self {
			Self::AndroidDocument { prefix } => format!("{prefix}{}", encode(filename)),
			Self::FilePath => root.join(filename).to_string_lossy().into_owned(),
		}
	}
}
