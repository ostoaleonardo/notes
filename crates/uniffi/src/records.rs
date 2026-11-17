use engine::model;

#[derive(uniffi::Record)]
pub struct NoteRecord {
	pub filename: String,
	pub uri: String,
	pub modified: i64,
	pub size: i64,
	pub text: String,
}

#[derive(uniffi::Record)]
pub struct ScannedRecord {
	pub filename: String,
	pub modified: i64,
	pub size: i64,
}

#[derive(uniffi::Record)]
pub struct PlanReport {
	pub changed: Vec<u32>,
	pub removed: Vec<String>,
	pub added: u32,
	pub updated: u32,
	pub unchanged: u32,
}

#[derive(uniffi::Record)]
pub struct BatchReport {
	pub notes: u32,
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
	Failed(String),
}

impl From<engine::error::Error> for EngineError {
	fn from(error: engine::error::Error) -> Self {
		Self::Failed(error.to_string())
	}
}

impl From<NoteRecord> for model::NoteInput {
	fn from(record: NoteRecord) -> Self {
		Self {
			filename: record.filename,
			uri: record.uri,
			modified: record.modified,
			size: record.size,
			text: record.text,
		}
	}
}

impl From<ScannedRecord> for model::ScannedFile {
	fn from(record: ScannedRecord) -> Self {
		Self {
			filename: record.filename,
			modified: record.modified,
			size: record.size,
		}
	}
}

impl From<model::ReconcilePlan> for PlanReport {
	fn from(plan: model::ReconcilePlan) -> Self {
		Self {
			changed: plan.changed,
			removed: plan.removed,
			added: plan.added,
			updated: plan.updated,
			unchanged: plan.unchanged,
		}
	}
}

impl From<model::BatchStats> for BatchReport {
	fn from(stats: model::BatchStats) -> Self {
		Self {
			notes: stats.notes,
			parse_ms: stats.parse_ms,
			write_ms: stats.write_ms,
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
