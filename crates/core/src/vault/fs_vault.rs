use super::VaultFs;
use super::constants::PATH_SEPARATOR;
use crate::error::Result;
use std::fs;
use std::io::{self, ErrorKind};
use std::path::PathBuf;

pub struct FsVault {
	root: PathBuf,
}

impl FsVault {
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

impl VaultFs for FsVault {
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
