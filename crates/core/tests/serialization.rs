use engine::error::{Error, ErrorCode};
use engine::model::{
	FileStamp, IndexedNotes, QueryResult, SaveOutcome, SaveRequest, SourceFile, SyncStats, Value,
};
use engine::ops::MoveOutcome;
use engine::repository::{DirEntry, MoveResult};
use serde::Serialize;
use serde::de::DeserializeOwned;
use serde_json::{Value as Json, json};

fn shape<T: Serialize + DeserializeOwned + PartialEq + std::fmt::Debug>(value: &T) -> Json {
	let encoded = serde_json::to_value(value).unwrap();
	let decoded: T = serde_json::from_value(encoded.clone()).unwrap();

	assert_eq!(&decoded, value);

	encoded
}

fn stamp() -> FileStamp {
	FileStamp {
		location: "content://note".to_string(),
		modified: 10,
		size: 4,
	}
}

#[test]
fn serializes_file_records_with_snake_case_fields() {
	assert_eq!(
		shape(&stamp()),
		json!({ "location": "content://note", "modified": 10, "size": 4 })
	);
	assert_eq!(
		shape(&SourceFile {
			location: "a".to_string(),
			filename: "a.md".to_string(),
			modified: 1,
			size: 2,
		}),
		json!({ "location": "a", "filename": "a.md", "modified": 1, "size": 2 })
	);
	assert_eq!(
		shape(&SaveRequest {
			filename: "a.md".to_string(),
			text: "body".to_string(),
			expected_modified: None,
		}),
		json!({ "filename": "a.md", "text": "body", "expected_modified": null })
	);
	assert_eq!(
		shape(&DirEntry {
			name: "docs".to_string(),
			is_dir: true,
		}),
		json!({ "name": "docs", "is_dir": true })
	);
}

#[test]
fn serializes_outcomes_as_externally_tagged_variants() {
	assert_eq!(
		shape(&SaveOutcome::Saved(stamp())),
		json!({ "Saved": { "location": "content://note", "modified": 10, "size": 4 } })
	);
	assert_eq!(
		shape(&SaveOutcome::Conflict { disk_modified: 7 }),
		json!({ "Conflict": { "disk_modified": 7 } })
	);
	assert_eq!(shape(&SaveOutcome::Missing), json!("Missing"));
	assert_eq!(
		shape(&SaveOutcome::Failed("denied".to_string())),
		json!({ "Failed": "denied" })
	);
	assert_eq!(shape(&MoveOutcome::TargetExists), json!("TargetExists"));
	assert_eq!(shape(&MoveResult::SourceMissing), json!("SourceMissing"));
}

#[test]
fn serializes_reports_and_query_results() {
	let stats = SyncStats {
		total: 3,
		added: 1,
		updated: 1,
		removed: 0,
		unchanged: 1,
		unreadable: 0,
		scan_ms: 1,
		read_ms: 2,
		parse_ms: 3,
		write_ms: 4,
	};
	let indexed = IndexedNotes {
		folder_ids: vec!["f".to_string()],
		filenames: vec!["a.md".to_string()],
		modified: vec![5],
	};
	let rows = QueryResult {
		columns: vec!["title".to_string()],
		rows: vec![vec![Value::Text("a".to_string()), Value::Null]],
	};

	assert_eq!(shape(&stats)["write_ms"], json!(4));
	assert_eq!(
		shape(&indexed),
		json!({ "folder_ids": ["f"], "filenames": ["a.md"], "modified": [5] })
	);
	assert_eq!(
		shape(&rows),
		json!({ "columns": ["title"], "rows": [[{ "Text": "a" }, "Null"]] })
	);
}

#[test]
fn reports_every_error_with_a_stable_code_and_message() {
	let cases = [
		(
			Error::AlreadyExists("a".to_string()),
			ErrorCode::AlreadyExists,
		),
		(Error::InvalidName("b".to_string()), ErrorCode::InvalidName),
		(Error::Io(std::io::Error::other("c")), ErrorCode::Io),
	];

	for (error, code) in cases {
		let report = error.report();

		assert_eq!(error.code(), code);
		assert_eq!(report.message, error.to_string());
		assert_eq!(
			serde_json::to_value(&error).unwrap(),
			json!({ "code": code, "message": error.to_string() })
		);
	}

	assert_eq!(
		serde_json::to_value(ErrorCode::AlreadyExists).unwrap(),
		json!("already_exists")
	);
}
