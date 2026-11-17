#[derive(Debug, thiserror::Error)]
pub enum Error {
	#[error("database error: {0}")]
	Database(#[from] rusqlite::Error),
}

pub type Result<T> = std::result::Result<T, Error>;
