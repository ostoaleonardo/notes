use crate::engine::Engine;
use crate::error::Result;
use crate::model::{FileStamp, NoteInput, SaveOutcome, SaveRequest};
use crate::source::NoteSink;

impl Engine {
	pub fn save_note(
		&self,
		folder_id: &str,
		sink: &dyn NoteSink,
		filename: &str,
		text: &str,
		expected_modified: Option<i64>,
	) -> Result<SaveOutcome> {
		let request = SaveRequest {
			filename: filename.to_string(),
			text: text.to_string(),
			expected_modified,
		};

		let mut outcomes = self.save_notes(folder_id, sink, &[request])?;

		Ok(outcomes.remove(0))
	}

	pub fn save_notes(
		&self,
		folder_id: &str,
		sink: &dyn NoteSink,
		requests: &[SaveRequest],
	) -> Result<Vec<SaveOutcome>> {
		let mut outcomes = Vec::with_capacity(requests.len());
		let mut inputs = Vec::new();

		for request in requests {
			match put(sink, request) {
				Ok(Put::Rejected(outcome)) => outcomes.push(outcome),
				Ok(Put::Written(stamp)) => {
					inputs.push(note_input(&request.filename, &request.text, &stamp));
					outcomes.push(SaveOutcome::Saved(stamp));
				}
				Err(error) => outcomes.push(SaveOutcome::Failed(error.to_string())),
			}
		}

		if !inputs.is_empty() {
			self.write(folder_id, inputs)?;
		}

		Ok(outcomes)
	}

	pub fn rename_note(
		&self,
		folder_id: &str,
		sink: &dyn NoteSink,
		from: &str,
		to: &str,
		text: &str,
	) -> Result<SaveOutcome> {
		if sink.stat(to)?.is_some() {
			return Ok(SaveOutcome::Conflict { disk_modified: 0 });
		}

		let stamp = self.store(folder_id, sink, to, text)?;

		sink.delete(from)?;
		self.remove(folder_id, &[from.to_string()])?;

		Ok(SaveOutcome::Saved(stamp))
	}

	pub fn delete_note(&self, folder_id: &str, sink: &dyn NoteSink, filename: &str) -> Result<()> {
		sink.delete(filename)?;
		self.remove(folder_id, &[filename.to_string()])
	}

	fn store(
		&self,
		folder_id: &str,
		sink: &dyn NoteSink,
		filename: &str,
		text: &str,
	) -> Result<FileStamp> {
		let stamp = sink.write(filename, text)?;

		self.write(folder_id, vec![note_input(filename, text, &stamp)])?;

		Ok(stamp)
	}
}

enum Put {
	Rejected(SaveOutcome),
	Written(FileStamp),
}

fn put(sink: &dyn NoteSink, request: &SaveRequest) -> Result<Put> {
	let rejection = check(sink, request)?;

	match rejection {
		Some(outcome) => Ok(Put::Rejected(outcome)),
		None => Ok(Put::Written(sink.write(&request.filename, &request.text)?)),
	}
}

fn check(sink: &dyn NoteSink, request: &SaveRequest) -> Result<Option<SaveOutcome>> {
	let on_disk = sink.stat(&request.filename)?;

	Ok(match (on_disk, request.expected_modified) {
		(Some(stamp), Some(expected)) if stamp.modified != expected => {
			Some(SaveOutcome::Conflict {
				disk_modified: stamp.modified,
			})
		}
		(Some(stamp), None) => Some(SaveOutcome::Conflict {
			disk_modified: stamp.modified,
		}),
		(None, Some(_)) => Some(SaveOutcome::Missing),
		_ => None,
	})
}

fn note_input(filename: &str, text: &str, stamp: &FileStamp) -> NoteInput {
	NoteInput {
		filename: filename.to_string(),
		uri: stamp.uri.clone(),
		modified: stamp.modified,
		size: stamp.size,
		text: text.to_string(),
	}
}
