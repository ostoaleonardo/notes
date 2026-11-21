use super::constants::{TEMP_PREFIX, TEMP_SUFFIX, WRITE_ATTEMPTS};
use super::fs::stamp_of;
use super::{LocationScheme, NoteSink};
use crate::error::Result;
use crate::model::FileStamp;
use std::fs;
use std::io;
use std::path::PathBuf;

pub struct FsSink {
	root: PathBuf,
	scheme: LocationScheme,
}

impl FsSink {
	pub fn new(root: impl Into<PathBuf>, scheme: LocationScheme) -> Self {
		Self {
			root: root.into(),
			scheme,
		}
	}

	fn write_once(&self, filename: &str, bytes: &[u8]) -> io::Result<()> {
		let target = self.root.join(filename);
		let temporary = self
			.root
			.join(format!("{TEMP_PREFIX}{filename}{TEMP_SUFFIX}"));

		fs::write(&temporary, bytes)?;

		fs::rename(&temporary, &target).inspect_err(|_| {
			let _ = fs::remove_file(&temporary);
		})
	}
}

impl NoteSink for FsSink {
	fn stat(&self, filename: &str) -> Result<Option<FileStamp>> {
		Ok(stamp_of(&self.root, &self.scheme, filename))
	}

	fn write(&self, filename: &str, text: &str) -> Result<FileStamp> {
		for _ in 0..WRITE_ATTEMPTS {
			self.write_once(filename, text.as_bytes())?;

			if let Some(stamp) = stamp_of(&self.root, &self.scheme, filename)
				&& stamp.size == text.len() as i64
			{
				return Ok(stamp);
			}
		}

		Err(io::Error::other(format!("write verification failed for {filename}")).into())
	}

	fn delete(&self, filename: &str) -> Result<()> {
		match fs::remove_file(self.root.join(filename)) {
			Err(error) if error.kind() != io::ErrorKind::NotFound => Err(error.into()),
			_ => Ok(()),
		}
	}
}
