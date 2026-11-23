use super::constants::{
	CORRUPT_SUFFIX, ERROR_LOCK_POISONED, KEY_ENTRIES, NOTES_FOLDER, PATH_SEPARATOR, VERSIONS_SUFFIX,
};
use super::store::{NewVersion, commit_version};
use crate::error::{Error, Result};
use crate::repository::RepositoryFiles;
use crate::source::percent::{decode, encode};
use serde_json::Value;
use std::io;
use std::sync::{Arc, Mutex};

pub struct HistoryMove<'a> {
	pub versions: &'a RepositoryVersions,
	pub from_key: &'a str,
	pub to_key: &'a str,
}

pub struct RepositoryVersions {
	repository: Arc<dyn RepositoryFiles>,
	guard: Mutex<()>,
}

fn filename_of(key: &str) -> String {
	format!("{}{VERSIONS_SUFFIX}", encode(key))
}

fn notes_path(filename: &str) -> String {
	format!("{NOTES_FOLDER}{PATH_SEPARATOR}{filename}")
}

fn is_empty_store(value: &Value) -> bool {
	match value {
		Value::Array(items) => items.is_empty(),
		other => other[KEY_ENTRIES].as_array().is_none_or(Vec::is_empty),
	}
}

impl RepositoryVersions {
	pub fn new(repository: Arc<dyn RepositoryFiles>) -> Self {
		Self {
			repository,
			guard: Mutex::new(()),
		}
	}

	fn lock(&self) -> Result<std::sync::MutexGuard<'_, ()>> {
		self.guard
			.lock()
			.map_err(|_| Error::Io(io::Error::other(ERROR_LOCK_POISONED)))
	}

	fn read_valid(&self, directory: &str, filename: &str) -> Result<Option<String>> {
		let path = format!("{directory}{PATH_SEPARATOR}{filename}");
		let Some(text) = self.repository.read_text(&path)? else {
			return Ok(None);
		};

		if serde_json::from_str::<Value>(&text).is_ok() {
			return Ok(Some(text));
		}

		self.repository
			.write_text(&format!("{path}{CORRUPT_SUFFIX}"), &text)?;

		Ok(None)
	}

	pub fn read(&self, key: &str) -> Result<Option<String>> {
		let _lock = self.lock()?;

		self.read_valid(NOTES_FOLDER, &filename_of(key))
	}

	pub fn write(&self, key: &str, json: &str) -> Result<()> {
		let _lock = self.lock()?;

		self.repository
			.write_text(&notes_path(&filename_of(key)), json)
	}

	pub fn delete(&self, key: &str) -> Result<()> {
		let _lock = self.lock()?;

		self.repository.delete_file(&notes_path(&filename_of(key)))
	}

	#[allow(clippy::too_many_arguments)]
	pub fn commit(
		&self,
		key: &str,
		title: &str,
		content: &str,
		id: &str,
		created_at: i64,
		max_versions: usize,
		max_age_ms: i64,
	) -> Result<bool> {
		let _lock = self.lock()?;
		let filename = filename_of(key);
		let raw = self.read_valid(NOTES_FOLDER, &filename)?;

		let written = commit_version(
			raw.as_deref(),
			&NewVersion {
				id,
				title,
				created_at,
				content,
				max_versions,
				max_age_ms,
			},
		)
		.map_err(|message| Error::Io(io::Error::other(message)))?;

		match written {
			Some(json) => {
				self.repository.write_text(&notes_path(&filename), &json)?;

				Ok(true)
			}
			None => Ok(false),
		}
	}

	pub fn rename(&self, old_key: &str, new_key: &str) -> Result<()> {
		let _lock = self.lock()?;

		self.move_store(old_key, new_key)
	}

	pub fn replace(&self, old_key: &str, new_key: &str) -> Result<()> {
		let _lock = self.lock()?;
		let moving = self.read_valid(NOTES_FOLDER, &filename_of(old_key))?;
		let has_history = moving
			.is_some_and(|raw| !is_empty_store(&serde_json::from_str(&raw).unwrap_or(Value::Null)));

		if has_history {
			return self.move_store(old_key, new_key);
		}

		self.repository
			.delete_file(&notes_path(&filename_of(new_key)))
	}

	fn move_store(&self, old_key: &str, new_key: &str) -> Result<()> {
		let Some(raw) = self.read_valid(NOTES_FOLDER, &filename_of(old_key))? else {
			return Ok(());
		};

		let parsed: Value = serde_json::from_str(&raw).unwrap_or(Value::Null);

		if is_empty_store(&parsed) {
			return Ok(());
		}

		self.repository
			.write_text(&notes_path(&filename_of(new_key)), &raw)?;
		self.repository
			.delete_file(&notes_path(&filename_of(old_key)))
	}

	fn keys_under(&self, prefix: &str) -> Result<Vec<String>> {
		let wanted = encode(&format!("{prefix}{PATH_SEPARATOR}"));

		Ok(self
			.repository
			.list_files(NOTES_FOLDER)?
			.into_iter()
			.filter(|name| name.starts_with(&wanted) && name.ends_with(VERSIONS_SUFFIX))
			.map(|name| decode(&name[..name.len() - VERSIONS_SUFFIX.len()]))
			.collect())
	}

	pub fn rename_under(&self, old_prefix: &str, new_prefix: &str) -> Result<()> {
		let _lock = self.lock()?;

		for key in self.keys_under(old_prefix)? {
			let renamed = format!("{new_prefix}{}", &key[old_prefix.len()..]);

			self.move_store(&key, &renamed)?;
		}

		Ok(())
	}

	pub fn delete_under(&self, prefix: &str) -> Result<()> {
		let _lock = self.lock()?;

		for key in self.keys_under(prefix)? {
			self.repository
				.delete_file(&notes_path(&filename_of(&key)))?;
		}

		Ok(())
	}

	pub fn migrate_legacy(&self, folder: &str, folder_path: &str) -> Result<()> {
		let _lock = self.lock()?;

		for name in self.repository.list_files(folder)? {
			let Some(filename) = name.strip_suffix(VERSIONS_SUFFIX) else {
				continue;
			};

			if let Some(raw) = self.read_valid(folder, &name)? {
				let key = if folder_path.is_empty() {
					filename.to_string()
				} else {
					format!("{folder_path}{PATH_SEPARATOR}{filename}")
				};

				self.repository
					.write_text(&notes_path(&filename_of(&key)), &raw)?;
			}

			self.repository
				.delete_file(&format!("{folder}{PATH_SEPARATOR}{name}"))?;
		}

		Ok(())
	}
}
