use crate::error::Result;
use crate::model::FileStamp;

pub trait NoteSink: Send + Sync {
	fn stat(&self, filename: &str) -> Result<Option<FileStamp>>;
	fn write(&self, filename: &str, text: &str) -> Result<FileStamp>;
	fn delete(&self, filename: &str) -> Result<()>;
}
