use super::NoteSource;
use super::constants::{HIDDEN_PREFIX, NOTE_EXTENSION};
use super::uri::encode;
use crate::error::Result;
use crate::model::SourceFile;
use rayon::prelude::*;
use std::fs;
use std::path::PathBuf;
use std::time::UNIX_EPOCH;

pub struct FsSource {
	root: PathBuf,
	uri_prefix: String,
}

impl FsSource {
	pub fn new(root: impl Into<PathBuf>, uri_prefix: impl Into<String>) -> Self {
		Self {
			root: root.into(),
			uri_prefix: uri_prefix.into(),
		}
	}

	fn describe(&self, name: String) -> Option<SourceFile> {
		if name.starts_with(HIDDEN_PREFIX) || !is_note(&name) {
			return None;
		}

		let metadata = fs::metadata(self.root.join(&name)).ok()?;

		if metadata.is_dir() {
			return None;
		}

		let modified = metadata
			.modified()
			.ok()
			.and_then(|time| time.duration_since(UNIX_EPOCH).ok())
			.map_or(0, |elapsed| elapsed.as_millis() as i64);

		Some(SourceFile {
			uri: format!("{}{}", self.uri_prefix, encode(&name)),
			filename: name,
			modified,
			size: metadata.len() as i64,
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

fn is_note(name: &str) -> bool {
	name.len() >= NOTE_EXTENSION.len()
		&& name.is_char_boundary(name.len() - NOTE_EXTENSION.len())
		&& name[name.len() - NOTE_EXTENSION.len()..].eq_ignore_ascii_case(NOTE_EXTENSION)
}
