mod constants;

use crate::engine::Engine;
use crate::error::{Error, Result};
use crate::model::{FileStamp, NoteInput};
use crate::repository::{MoveResult, RepositoryOps, validate_name};
use crate::source::NoteSink;
use crate::versions::RepositoryVersions;
use constants::{FIRST_COPY_NUMBER, NOTE_EXTENSION, PATH_SEPARATOR};
use std::io::{self, ErrorKind};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MoveOutcome {
	Moved(FileStamp),
	TargetExists,
	SourceMissing,
}

pub struct Repository<'a> {
	pub ops: &'a dyn RepositoryOps,
	pub versions: &'a RepositoryVersions,
}

fn join(directory: &str, name: &str) -> String {
	if directory.is_empty() {
		name.to_string()
	} else {
		format!("{directory}{PATH_SEPARATOR}{name}")
	}
}

fn parent_of(path: &str) -> &str {
	path.rsplit_once(PATH_SEPARATOR)
		.map_or("", |(parent, _)| parent)
}

fn stem_and_extension(filename: &str) -> (&str, &str) {
	match filename.strip_suffix(NOTE_EXTENSION) {
		Some(stem) => (stem, NOTE_EXTENSION),
		None => (filename, ""),
	}
}

fn unique_name(repository: &dyn RepositoryOps, directory: &str, filename: &str) -> Result<String> {
	if !repository.exists(&join(directory, filename))? {
		return Ok(filename.to_string());
	}

	let (stem, extension) = stem_and_extension(filename);

	for number in FIRST_COPY_NUMBER.. {
		let candidate = format!("{stem} ({number}){extension}");

		if !repository.exists(&join(directory, &candidate))? {
			return Ok(candidate);
		}
	}

	unreachable!("an unused copy number always exists")
}

impl Engine {
	pub fn rename_folder(
		&self,
		repository: &Repository<'_>,
		path: &str,
		new_name: &str,
		affected_folder_ids: &[String],
	) -> Result<String> {
		validate_name(new_name)?;

		let parent = parent_of(path);
		let new_path = join(parent, new_name);
		let old_name = path
			.rsplit_once(PATH_SEPARATOR)
			.map_or(path, |(_, name)| name);

		repository.ops.rename_dir(path, new_name)?;

		let rest = affected_folder_ids
			.iter()
			.try_for_each(|id| self.delete_folder(id))
			.and_then(|()| repository.versions.rename_under(path, &new_path));

		if let Err(error) = rest {
			let _ = repository.ops.rename_dir(&new_path, old_name);

			return Err(error);
		}

		Ok(new_path)
	}

	pub fn remove_folder(
		&self,
		repository: &Repository<'_>,
		path: &str,
		folder_ids: &[String],
		drop_versions: bool,
	) -> Result<()> {
		for id in folder_ids {
			self.delete_folder(id)?;
		}

		repository.ops.remove_dir(path)?;

		if drop_versions {
			repository.versions.delete_under(path)?;
		}

		Ok(())
	}

	pub fn trash_note(
		&self,
		repository: &Repository<'_>,
		folder_id: &str,
		folder_path: &str,
		filename: &str,
		trash_path: &str,
	) -> Result<String> {
		validate_name(filename)?;
		repository.ops.create_dir(trash_path)?;

		let source = join(folder_path, filename);
		let mut target_name = unique_name(repository.ops, trash_path, filename)?;

		loop {
			match repository
				.ops
				.move_file(&source, &join(trash_path, &target_name))?
			{
				MoveResult::Moved => break,
				MoveResult::SourceMissing => {
					return Err(Error::Io(io::Error::new(ErrorKind::NotFound, source)));
				}
				MoveResult::TargetExists => {
					target_name = unique_name(repository.ops, trash_path, filename)?;
				}
			}
		}

		repository.versions.delete(&source)?;
		self.remove(folder_id, &[filename.to_string()])?;

		Ok(target_name)
	}

	#[allow(clippy::too_many_arguments)]
	pub fn move_note(
		&self,
		repository: &Repository<'_>,
		filename: &str,
		from_folder_id: &str,
		from_path: &str,
		to_folder_id: &str,
		to_path: &str,
		to_sink: &dyn NoteSink,
	) -> Result<MoveOutcome> {
		validate_name(filename)?;

		let source = join(from_path, filename);
		let target = join(to_path, filename);

		match repository.ops.move_file(&source, &target)? {
			MoveResult::TargetExists => return Ok(MoveOutcome::TargetExists),
			MoveResult::SourceMissing => return Ok(MoveOutcome::SourceMissing),
			MoveResult::Moved => {}
		}

		let renamed = repository.versions.rename(&source, &target);

		if let Err(error) = renamed {
			let _ = repository.ops.move_file(&target, &source);

			return Err(error);
		}

		let stamp = to_sink
			.stat(filename)?
			.ok_or_else(|| Error::Io(io::Error::new(ErrorKind::NotFound, target.clone())))?;

		let _ = self.remove(from_folder_id, &[filename.to_string()]);

		if let Some(text) = repository.ops.read_text(&target)? {
			let _ = self.write(
				to_folder_id,
				vec![NoteInput {
					filename: filename.to_string(),
					location: stamp.location.clone(),
					modified: stamp.modified,
					size: stamp.size,
					text,
				}],
			);
		}

		Ok(MoveOutcome::Moved(stamp))
	}
}
