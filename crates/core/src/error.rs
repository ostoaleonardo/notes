use rusqlite::ErrorCode as SqliteCode;
use serde::{Deserialize, Serialize, Serializer};

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
	#[error("already exists: {0}")]
	AlreadyExists(String),
	#[error("invalid name: {0}")]
	InvalidName(String),
	#[error("invalid search query: {0}")]
	InvalidQuery(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
	Busy,
	Database,
	Collation,
	Io,
	AlreadyExists,
	InvalidName,
	InvalidQuery,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ErrorReport {
	pub code: ErrorCode,
	pub message: String,
}

impl Error {
	pub fn code(&self) -> ErrorCode {
		match self {
			Self::Busy(_) => ErrorCode::Busy,
			Self::Database(_) => ErrorCode::Database,
			Self::Collation { .. } => ErrorCode::Collation,
			Self::Io(_) => ErrorCode::Io,
			Self::AlreadyExists(_) => ErrorCode::AlreadyExists,
			Self::InvalidName(_) => ErrorCode::InvalidName,
			Self::InvalidQuery(_) => ErrorCode::InvalidQuery,
		}
	}

	pub fn report(&self) -> ErrorReport {
		ErrorReport {
			code: self.code(),
			message: self.to_string(),
		}
	}

	pub fn is_retryable(&self) -> bool {
		matches!(self, Self::Busy(_))
	}
}

impl Serialize for Error {
	fn serialize<S: Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
		self.report().serialize(serializer)
	}
}

impl From<rusqlite::Error> for Error {
	fn from(error: rusqlite::Error) -> Self {
		match &error {
			rusqlite::Error::SqliteFailure(failure, _)
				if matches!(
					failure.code,
					SqliteCode::DatabaseBusy | SqliteCode::DatabaseLocked
				) =>
			{
				Self::Busy(error)
			}
			_ => Self::Database(error),
		}
	}
}

pub type Result<T> = std::result::Result<T, Error>;
