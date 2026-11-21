mod constants;
mod fs_repository;
mod ops;

pub use fs_repository::FsRepository;
pub use ops::{MoveResult, RepositoryOps, validate_name};

use crate::error::Result;

pub trait RepositoryFiles: Send + Sync {
	fn read_text(&self, path: &str) -> Result<Option<String>>;
	fn write_text(&self, path: &str, text: &str) -> Result<()>;
	fn delete_file(&self, path: &str) -> Result<()>;
	fn list_files(&self, directory: &str) -> Result<Vec<String>>;
}
