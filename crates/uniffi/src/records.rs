use crate::constants::ERROR_PROPERTIES_NOT_OBJECT;
use engine::error::ErrorCode;
use engine::model::{self, FileStamp, IndexedNotes, SaveRequest, SourceFile, SyncStats};
use engine::repository::{DirEntry, MoveResult};
use engine::syntax::{Decomposed, NoteFields};

#[derive(uniffi::Enum)]
pub enum SaveReport {
	Saved { stamp: FileStamp },
	Conflict { disk_modified: i64 },
	Missing,
	Failed { message: String },
}

#[derive(uniffi::Record)]
pub struct NoteFieldsRecord {
	pub tags: Vec<String>,
	pub properties_json: String,
	pub invalid_frontmatter: Option<String>,
	pub raw_frontmatter: Option<String>,
}

#[derive(uniffi::Record)]
pub struct DecomposedRecord {
	pub body: String,
	pub tags: Option<Vec<String>>,
	pub properties_json: Option<String>,
	pub invalid_frontmatter: Option<String>,
	pub raw_frontmatter: Option<String>,
}

#[derive(uniffi::Record)]
pub struct NoteRefsReport {
	pub folder_ids: Vec<String>,
	pub filenames: Vec<String>,
}

#[derive(uniffi::Record)]
pub struct QueryReport {
	pub columns: Vec<String>,
	pub rows: Vec<Vec<Value>>,
}

#[derive(uniffi::Enum)]
pub enum Value {
	Null,
	Integer { value: i64 },
	Real { value: f64 },
	Text { value: String },
}

#[derive(Debug, thiserror::Error, uniffi::Error)]
#[uniffi(flat_error)]
pub enum EngineError {
	#[error("{0}")]
	Busy(String),
	#[error("{0}")]
	Database(String),
	#[error("{0}")]
	Collation(String),
	#[error("{0}")]
	Io(String),
	#[error("{0}")]
	AlreadyExists(String),
	#[error("{0}")]
	InvalidName(String),
}

impl From<engine::error::Error> for EngineError {
	fn from(error: engine::error::Error) -> Self {
		let report = error.report();

		match report.code {
			ErrorCode::Busy => Self::Busy(report.message),
			ErrorCode::Database => Self::Database(report.message),
			ErrorCode::Collation => Self::Collation(report.message),
			ErrorCode::Io => Self::Io(report.message),
			ErrorCode::AlreadyExists => Self::AlreadyExists(report.message),
			ErrorCode::InvalidName => Self::InvalidName(report.message),
		}
	}
}

impl From<model::QueryResult> for QueryReport {
	fn from(result: model::QueryResult) -> Self {
		Self {
			columns: result.columns,
			rows: result
				.rows
				.into_iter()
				.map(|row| row.into_iter().map(Value::from).collect())
				.collect(),
		}
	}
}

impl From<model::Value> for Value {
	fn from(value: model::Value) -> Self {
		match value {
			model::Value::Null => Self::Null,
			model::Value::Integer(value) => Self::Integer { value },
			model::Value::Real(value) => Self::Real { value },
			model::Value::Text(value) => Self::Text { value },
		}
	}
}

impl From<Value> for model::Value {
	fn from(value: Value) -> Self {
		match value {
			Value::Null => Self::Null,
			Value::Integer { value } => Self::Integer(value),
			Value::Real { value } => Self::Real(value),
			Value::Text { value } => Self::Text(value),
		}
	}
}

impl From<Vec<model::NoteRef>> for NoteRefsReport {
	fn from(notes: Vec<model::NoteRef>) -> Self {
		let (folder_ids, filenames) = notes
			.into_iter()
			.map(|note| (note.folder_id, note.filename))
			.unzip();

		Self {
			folder_ids,
			filenames,
		}
	}
}

impl From<uniffi::UnexpectedUniFFICallbackError> for EngineError {
	fn from(error: uniffi::UnexpectedUniFFICallbackError) -> Self {
		Self::Io(error.to_string())
	}
}

impl From<EngineError> for engine::error::Error {
	fn from(error: EngineError) -> Self {
		let message = match error {
			EngineError::Busy(message)
			| EngineError::Database(message)
			| EngineError::Collation(message)
			| EngineError::Io(message)
			| EngineError::AlreadyExists(message)
			| EngineError::InvalidName(message) => message,
		};

		Self::Io(std::io::Error::other(message))
	}
}

impl From<model::SaveOutcome> for SaveReport {
	fn from(outcome: model::SaveOutcome) -> Self {
		match outcome {
			model::SaveOutcome::Saved(stamp) => Self::Saved { stamp },
			model::SaveOutcome::Conflict { disk_modified } => Self::Conflict { disk_modified },
			model::SaveOutcome::Missing => Self::Missing,
			model::SaveOutcome::Failed(message) => Self::Failed { message },
		}
	}
}

impl TryFrom<NoteFieldsRecord> for NoteFields {
	type Error = EngineError;

	fn try_from(record: NoteFieldsRecord) -> Result<Self, Self::Error> {
		let properties = match serde_json::from_str(&record.properties_json) {
			Ok(serde_json::Value::Object(map)) => map,
			_ => {
				return Err(EngineError::Io(ERROR_PROPERTIES_NOT_OBJECT.to_string()));
			}
		};

		Ok(Self {
			tags: record.tags,
			properties,
			invalid_frontmatter: record.invalid_frontmatter,
			raw_frontmatter: record.raw_frontmatter,
		})
	}
}

impl From<Decomposed> for DecomposedRecord {
	fn from(parts: Decomposed) -> Self {
		Self {
			body: parts.body,
			tags: parts.tags,
			properties_json: parts
				.properties
				.map(|map| serde_json::Value::Object(map).to_string()),
			invalid_frontmatter: parts.invalid_frontmatter,
			raw_frontmatter: parts.raw_frontmatter,
		}
	}
}

#[derive(uniffi::Enum)]
pub enum MoveReport {
	Moved { stamp: FileStamp },
	TargetExists,
	SourceMissing,
}

impl From<engine::ops::MoveOutcome> for MoveReport {
	fn from(outcome: engine::ops::MoveOutcome) -> Self {
		match outcome {
			engine::ops::MoveOutcome::Moved(stamp) => Self::Moved { stamp },
			engine::ops::MoveOutcome::TargetExists => Self::TargetExists,
			engine::ops::MoveOutcome::SourceMissing => Self::SourceMissing,
		}
	}
}

#[uniffi::remote(Record)]
pub struct SourceFile {
	pub location: String,
	pub filename: String,
	pub modified: i64,
	pub size: i64,
}

#[uniffi::remote(Record)]
pub struct FileStamp {
	pub location: String,
	pub modified: i64,
	pub size: i64,
}

#[uniffi::remote(Record)]
pub struct SaveRequest {
	pub filename: String,
	pub text: String,
	pub expected_modified: Option<i64>,
}

#[uniffi::remote(Record)]
pub struct SyncStats {
	pub total: u32,
	pub added: u32,
	pub updated: u32,
	pub removed: u32,
	pub unchanged: u32,
	pub unreadable: u32,
	pub scan_ms: u64,
	pub read_ms: u64,
	pub parse_ms: u64,
	pub write_ms: u64,
}

#[uniffi::remote(Record)]
pub struct IndexedNotes {
	pub folder_ids: Vec<String>,
	pub filenames: Vec<String>,
	pub modified: Vec<i64>,
}

#[uniffi::remote(Record)]
pub struct DirEntry {
	pub name: String,
	pub is_dir: bool,
}

#[uniffi::remote(Enum)]
pub enum MoveResult {
	Moved,
	TargetExists,
	SourceMissing,
}
