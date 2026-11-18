pub mod constants;
mod fs;
mod uri;

pub use fs::FsSource;

use crate::error::Result;
use crate::model::SourceFile;

pub trait NoteSource: Send + Sync {
	fn scan(&self) -> Result<Vec<SourceFile>>;
	fn read(&self, files: &[&SourceFile]) -> Result<Vec<Option<String>>>;
}
