use crate::engine::Engine;
use crate::error::Result;
use crate::model::{FileStamp, NoteInput, SaveOutcome};
use crate::source::NoteSink;

impl Engine {
	pub fn save_note(
		&self,
		repository_id: &str,
		sink: &dyn NoteSink,
		filename: &str,
		text: &str,
		expected_modified: Option<i64>,
	) -> Result<SaveOutcome> {
		let on_disk = sink.stat(filename)?;

		match (on_disk, expected_modified) {
			(Some(stamp), Some(expected)) if stamp.modified != expected => {
				return Ok(SaveOutcome::Conflict {
					disk_modified: stamp.modified,
				});
			}
			(Some(stamp), None) => {
				return Ok(SaveOutcome::Conflict {
					disk_modified: stamp.modified,
				});
			}
			(None, Some(_)) => return Ok(SaveOutcome::Missing),
			_ => {}
		}

		Ok(SaveOutcome::Saved(self.store(
			repository_id,
			sink,
			filename,
			text,
		)?))
	}

	pub fn rename_note(
		&self,
		repository_id: &str,
		sink: &dyn NoteSink,
		from: &str,
		to: &str,
		text: &str,
	) -> Result<SaveOutcome> {
		if sink.stat(to)?.is_some() {
			return Ok(SaveOutcome::Conflict { disk_modified: 0 });
		}

		let stamp = self.store(repository_id, sink, to, text)?;

		sink.delete(from)?;
		self.remove(repository_id, &[from.to_string()])?;

		Ok(SaveOutcome::Saved(stamp))
	}

	pub fn delete_note(
		&self,
		repository_id: &str,
		sink: &dyn NoteSink,
		filename: &str,
	) -> Result<()> {
		sink.delete(filename)?;
		self.remove(repository_id, &[filename.to_string()])
	}

	fn store(
		&self,
		repository_id: &str,
		sink: &dyn NoteSink,
		filename: &str,
		text: &str,
	) -> Result<FileStamp> {
		let stamp = sink.write(filename, text)?;

		self.write(
			repository_id,
			vec![NoteInput {
				filename: filename.to_string(),
				uri: stamp.uri.clone(),
				modified: stamp.modified,
				size: stamp.size,
				text: text.to_string(),
			}],
		)?;

		Ok(stamp)
	}
}
