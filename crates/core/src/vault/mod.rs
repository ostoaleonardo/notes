mod fs_vault;

pub use fs_vault::FsVault;

use crate::error::Result;

pub trait VaultFs: Send + Sync {
	fn read_text(&self, path: &str) -> Result<Option<String>>;
	fn write_text(&self, path: &str, text: &str) -> Result<()>;
	fn delete_file(&self, path: &str) -> Result<()>;
	fn list_files(&self, directory: &str) -> Result<Vec<String>>;
}
