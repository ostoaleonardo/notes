use engine::model;

#[derive(uniffi::Record)]
pub struct SourceRecord {
	pub uri: String,
	pub filename: String,
	pub modified: i64,
	pub size: i64,
}

#[derive(uniffi::Record)]
pub struct SyncReport {
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

#[derive(uniffi::Record)]
pub struct IndexedNotesReport {
	pub repository_ids: Vec<String>,
	pub filenames: Vec<String>,
	pub modified: Vec<i64>,
}

#[derive(uniffi::Record)]
pub struct NoteRefsReport {
	pub repository_ids: Vec<String>,
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
}

impl From<engine::error::Error> for EngineError {
	fn from(error: engine::error::Error) -> Self {
		let message = error.to_string();

		match error {
			engine::error::Error::Busy(_) => Self::Busy(message),
			engine::error::Error::Database(_) => Self::Database(message),
			engine::error::Error::Collation { .. } => Self::Collation(message),
			engine::error::Error::Io(_) => Self::Io(message),
		}
	}
}

impl From<model::IndexedNotes> for IndexedNotesReport {
	fn from(notes: model::IndexedNotes) -> Self {
		Self {
			repository_ids: notes.repository_ids,
			filenames: notes.filenames,
			modified: notes.modified,
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
		let (repository_ids, filenames) = notes
			.into_iter()
			.map(|note| (note.repository_id, note.filename))
			.unzip();

		Self {
			repository_ids,
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
			| EngineError::Io(message) => message,
		};

		Self::Io(std::io::Error::other(message))
	}
}

impl From<SourceRecord> for model::SourceFile {
	fn from(record: SourceRecord) -> Self {
		Self {
			uri: record.uri,
			filename: record.filename,
			modified: record.modified,
			size: record.size,
		}
	}
}

impl From<model::SyncStats> for SyncReport {
	fn from(stats: model::SyncStats) -> Self {
		Self {
			total: stats.total,
			added: stats.added,
			updated: stats.updated,
			removed: stats.removed,
			unchanged: stats.unchanged,
			unreadable: stats.unreadable,
			scan_ms: stats.scan_ms,
			read_ms: stats.read_ms,
			parse_ms: stats.parse_ms,
			write_ms: stats.write_ms,
		}
	}
}
