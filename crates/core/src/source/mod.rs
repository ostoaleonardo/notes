pub mod constants;
mod fs;
mod fs_sink;
mod sink;
mod uri;

pub use fs::FsSource;
pub use fs_sink::FsSink;
pub use sink::NoteSink;

use crate::error::Result;
use crate::model::SourceFile;

pub trait NoteSource: Send + Sync {
	fn scan(&self) -> Result<Vec<SourceFile>>;
	fn read(&self, files: &[&SourceFile]) -> Result<Vec<Option<String>>>;
}
