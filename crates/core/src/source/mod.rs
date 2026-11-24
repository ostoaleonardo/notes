pub mod constants;
mod fs;
mod fs_sink;
mod location;
pub(crate) mod percent;
mod sink;

pub use fs::FsSource;
pub use fs_sink::FsSink;
pub use location::LocationScheme;
pub use sink::NoteSink;

use crate::error::Result;
use crate::model::SourceFile;

pub trait NoteReader: Send + Sync {
	fn read(&self, files: &[&SourceFile]) -> Result<Vec<Option<String>>>;
}

pub trait NoteSource: NoteReader {
	fn scan(&self) -> Result<Vec<SourceFile>>;
}
