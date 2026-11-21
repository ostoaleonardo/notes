use super::LocationScheme;
use super::NoteSource;
use super::constants::{HIDDEN_PREFIX, NOTE_EXTENSION};
use crate::error::Result;
use crate::model::{FileStamp, SourceFile};
use rayon::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

pub struct FsSource {
	root: PathBuf,
	scheme: LocationScheme,
}

impl FsSource {
	pub fn new(root: impl Into<PathBuf>, scheme: LocationScheme) -> Self {
		Self {
			root: root.into(),
			scheme,
		}
	}

	fn describe(&self, name: String) -> Option<SourceFile> {
		if name.starts_with(HIDDEN_PREFIX) || !is_note(&name) {
			return None;
		}

		let stamp = stamp_of(&self.root, &self.scheme, &name)?;

		Some(SourceFile {
			location: stamp.location,
			filename: name,
			modified: stamp.modified,
			size: stamp.size,
		})
	}
}

impl NoteSource for FsSource {
	fn scan(&self) -> Result<Vec<SourceFile>> {
		let names: Vec<String> = fs::read_dir(&self.root)?
			.filter_map(|entry| entry.ok()?.file_name().into_string().ok())
			.collect();

		Ok(names
			.into_par_iter()
			.filter_map(|name| self.describe(name))
			.collect())
	}

	fn read(&self, files: &[&SourceFile]) -> Result<Vec<Option<String>>> {
		Ok(files
			.par_iter()
			.map(|file| {
				fs::read(self.root.join(&file.filename))
					.ok()
					.map(|bytes| String::from_utf8_lossy(&bytes).into_owned())
			})
			.collect())
	}
}

pub fn stamp_of(root: &Path, scheme: &LocationScheme, filename: &str) -> Option<FileStamp> {
	let metadata = fs::metadata(root.join(filename)).ok()?;

	if metadata.is_dir() {
		return None;
	}

	let modified = metadata
		.modified()
		.ok()
		.and_then(|time| time.duration_since(UNIX_EPOCH).ok())
		.map_or(0, |elapsed| elapsed.as_millis() as i64);

	Some(FileStamp {
		location: scheme.locate(root, filename),
		modified,
		size: metadata.len() as i64,
	})
}

fn is_note(name: &str) -> bool {
	name.len() >= NOTE_EXTENSION.len()
		&& name.is_char_boundary(name.len() - NOTE_EXTENSION.len())
		&& name[name.len() - NOTE_EXTENSION.len()..].eq_ignore_ascii_case(NOTE_EXTENSION)
}
