use super::RepositoryFiles;
use super::constants::{BACKSLASH, CURRENT_DIRECTORY, NUL, PARENT_DIRECTORY, PATH_SEPARATOR};
use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MoveResult {
	Moved,
	TargetExists,
	SourceMissing,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DirEntry {
	pub name: String,
	pub is_dir: bool,
}

pub trait RepositoryOps: RepositoryFiles {
	fn list_dir(&self, path: &str) -> Result<Vec<DirEntry>>;
	fn exists(&self, path: &str) -> Result<bool>;
	fn create_dir(&self, path: &str) -> Result<()>;
	fn rename_dir(&self, path: &str, new_name: &str) -> Result<()>;
	fn move_file(&self, from: &str, to: &str) -> Result<MoveResult>;
	fn remove_dir(&self, path: &str) -> Result<()>;
}

pub fn validate_name(name: &str) -> Result<()> {
	let invalid = name.is_empty()
		|| name == CURRENT_DIRECTORY
		|| name == PARENT_DIRECTORY
		|| name.contains([PATH_SEPARATOR, BACKSLASH, NUL]);

	if invalid {
		return Err(Error::InvalidName(name.to_string()));
	}

	Ok(())
}
