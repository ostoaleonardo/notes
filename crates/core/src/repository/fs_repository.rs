use super::constants::PATH_SEPARATOR;
use super::{DirEntry, MoveResult, RepositoryFiles, RepositoryOps, validate_name};
use crate::error::{Error, Result};
use std::fs;
use std::io::{self, ErrorKind};
use std::path::{Path, PathBuf};

pub struct FsRepository {
	root: PathBuf,
}

impl FsRepository {
	pub fn new(root: impl Into<PathBuf>) -> Self {
		Self { root: root.into() }
	}

	fn resolve(&self, path: &str) -> PathBuf {
		path.split(PATH_SEPARATOR)
			.filter(|segment| !segment.is_empty())
			.fold(self.root.clone(), |resolved, segment| {
				resolved.join(segment)
			})
	}
}

fn missing_is_none<T>(result: io::Result<T>) -> Result<Option<T>> {
	match result {
		Ok(value) => Ok(Some(value)),
		Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
		Err(error) => Err(error.into()),
	}
}

impl RepositoryFiles for FsRepository {
	fn read_text(&self, path: &str) -> Result<Option<String>> {
		missing_is_none(fs::read(self.resolve(path)))
			.map(|bytes| bytes.map(|bytes| String::from_utf8_lossy(&bytes).into_owned()))
	}

	fn write_text(&self, path: &str, text: &str) -> Result<()> {
		let target = self.resolve(path);

		if let Some(parent) = target.parent() {
			fs::create_dir_all(parent)?;
		}

		fs::write(target, text.as_bytes())?;

		Ok(())
	}

	fn delete_file(&self, path: &str) -> Result<()> {
		missing_is_none(fs::remove_file(self.resolve(path)))?;

		Ok(())
	}

	fn list_files(&self, directory: &str) -> Result<Vec<String>> {
		let Some(entries) = missing_is_none(fs::read_dir(self.resolve(directory)))? else {
			return Ok(Vec::new());
		};

		let mut names = Vec::new();

		for entry in entries {
			let entry = entry?;

			if entry.file_type()?.is_file()
				&& let Ok(name) = entry.file_name().into_string()
			{
				names.push(name);
			}
		}

		names.sort();

		Ok(names)
	}
}

fn is_same_entry(first: &Path, second: &Path) -> bool {
	match (fs::canonicalize(first), fs::canonicalize(second)) {
		(Ok(first), Ok(second)) => first == second,
		_ => false,
	}
}

impl RepositoryOps for FsRepository {
	fn list_dir(&self, path: &str) -> Result<Vec<DirEntry>> {
		let Some(entries) = missing_is_none(fs::read_dir(self.resolve(path)))? else {
			return Ok(Vec::new());
		};

		let mut listed = Vec::new();

		for entry in entries {
			let entry = entry?;

			if let Ok(name) = entry.file_name().into_string() {
				listed.push(DirEntry {
					name,
					is_dir: entry.file_type()?.is_dir(),
				});
			}
		}

		listed.sort_by(|first, second| first.name.cmp(&second.name));

		Ok(listed)
	}

	fn exists(&self, path: &str) -> Result<bool> {
		Ok(self.resolve(path).exists())
	}

	fn create_dir(&self, path: &str) -> Result<()> {
		fs::create_dir_all(self.resolve(path))?;

		Ok(())
	}

	fn rename_dir(&self, path: &str, new_name: &str) -> Result<()> {
		validate_name(new_name)?;

		let source = self.resolve(path);
		let target = source
			.parent()
			.map(|parent| parent.join(new_name))
			.ok_or_else(|| Error::InvalidName(path.to_string()))?;

		if target.exists() && !is_same_entry(&source, &target) {
			return Err(Error::AlreadyExists(new_name.to_string()));
		}

		fs::rename(source, target)?;

		Ok(())
	}

	fn move_file(&self, from: &str, to: &str) -> Result<MoveResult> {
		let source = self.resolve(from);
		let target = self.resolve(to);

		if !source.is_file() {
			return Ok(MoveResult::SourceMissing);
		}

		if target.exists() {
			return Ok(MoveResult::TargetExists);
		}

		fs::rename(source, target)?;

		Ok(MoveResult::Moved)
	}

	fn remove_dir(&self, path: &str) -> Result<()> {
		missing_is_none(fs::remove_dir_all(self.resolve(path)))?;

		Ok(())
	}
}
