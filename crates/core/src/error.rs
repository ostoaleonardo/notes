use rusqlite::ErrorCode;

#[derive(Debug, thiserror::Error)]
pub enum Error {
	#[error("the index is busy, try again: {0}")]
	Busy(rusqlite::Error),
	#[error("database error: {0}")]
	Database(rusqlite::Error),
	#[error("collation data is unavailable for locale {locale}: {reason}")]
	Collation { locale: String, reason: String },
	#[error("file error: {0}")]
	Io(#[from] std::io::Error),
}

impl Error {
	pub fn is_retryable(&self) -> bool {
		matches!(self, Self::Busy(_))
	}
}

impl From<rusqlite::Error> for Error {
	fn from(error: rusqlite::Error) -> Self {
		match &error {
			rusqlite::Error::SqliteFailure(failure, _)
				if matches!(
					failure.code,
					ErrorCode::DatabaseBusy | ErrorCode::DatabaseLocked
				) =>
			{
				Self::Busy(error)
			}
			_ => Self::Database(error),
		}
	}
}

pub type Result<T> = std::result::Result<T, Error>;
