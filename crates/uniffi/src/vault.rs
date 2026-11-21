use crate::records::{EngineError, MoveStatus};
use engine::error::Result as CoreResult;
use engine::vault::{MoveResult, VaultFs as CoreVaultFs, VaultOps as CoreVaultOps};
use engine::versions::VersionVault;
use std::sync::Arc;

#[uniffi::export(with_foreign)]
pub trait VaultFs: Send + Sync {
	fn read_text(&self, path: String) -> Result<Option<String>, EngineError>;
	fn write_text(&self, path: String, text: String) -> Result<(), EngineError>;
	fn delete_file(&self, path: String) -> Result<(), EngineError>;
	fn list_files(&self, directory: String) -> Result<Vec<String>, EngineError>;
	fn exists(&self, path: String) -> Result<bool, EngineError>;
	fn create_dir(&self, path: String) -> Result<(), EngineError>;
	fn rename_dir(&self, path: String, new_name: String) -> Result<(), EngineError>;
	fn move_file(&self, from: String, to: String) -> Result<MoveStatus, EngineError>;
	fn remove_dir(&self, path: String) -> Result<(), EngineError>;
}

pub(crate) struct ForeignVault {
	inner: Arc<dyn VaultFs>,
}

impl CoreVaultFs for ForeignVault {
	fn read_text(&self, path: &str) -> CoreResult<Option<String>> {
		Ok(self.inner.read_text(path.to_string())?)
	}

	fn write_text(&self, path: &str, text: &str) -> CoreResult<()> {
		Ok(self.inner.write_text(path.to_string(), text.to_string())?)
	}

	fn delete_file(&self, path: &str) -> CoreResult<()> {
		Ok(self.inner.delete_file(path.to_string())?)
	}

	fn list_files(&self, directory: &str) -> CoreResult<Vec<String>> {
		Ok(self.inner.list_files(directory.to_string())?)
	}
}

impl ForeignVault {
	pub(crate) fn new(inner: Arc<dyn VaultFs>) -> Self {
		Self { inner }
	}
}

impl CoreVaultOps for ForeignVault {
	fn exists(&self, path: &str) -> CoreResult<bool> {
		Ok(self.inner.exists(path.to_string())?)
	}

	fn create_dir(&self, path: &str) -> CoreResult<()> {
		Ok(self.inner.create_dir(path.to_string())?)
	}

	fn rename_dir(&self, path: &str, new_name: &str) -> CoreResult<()> {
		Ok(self
			.inner
			.rename_dir(path.to_string(), new_name.to_string())?)
	}

	fn move_file(&self, from: &str, to: &str) -> CoreResult<MoveResult> {
		Ok(self
			.inner
			.move_file(from.to_string(), to.to_string())?
			.into())
	}

	fn remove_dir(&self, path: &str) -> CoreResult<()> {
		Ok(self.inner.remove_dir(path.to_string())?)
	}
}

#[derive(uniffi::Object)]
pub struct FsVaultHandle {
	inner: engine::vault::FsVault,
}

#[uniffi::export]
impl FsVaultHandle {
	#[uniffi::constructor]
	pub fn new(path: String) -> Arc<Self> {
		Arc::new(Self {
			inner: engine::vault::FsVault::new(path),
		})
	}
}

#[uniffi::export]
impl VaultFs for FsVaultHandle {
	fn read_text(&self, path: String) -> Result<Option<String>, EngineError> {
		Ok(CoreVaultFs::read_text(&self.inner, &path)?)
	}

	fn write_text(&self, path: String, text: String) -> Result<(), EngineError> {
		Ok(CoreVaultFs::write_text(&self.inner, &path, &text)?)
	}

	fn delete_file(&self, path: String) -> Result<(), EngineError> {
		Ok(CoreVaultFs::delete_file(&self.inner, &path)?)
	}

	fn list_files(&self, directory: String) -> Result<Vec<String>, EngineError> {
		Ok(CoreVaultFs::list_files(&self.inner, &directory)?)
	}

	fn exists(&self, path: String) -> Result<bool, EngineError> {
		Ok(CoreVaultOps::exists(&self.inner, &path)?)
	}

	fn create_dir(&self, path: String) -> Result<(), EngineError> {
		Ok(CoreVaultOps::create_dir(&self.inner, &path)?)
	}

	fn rename_dir(&self, path: String, new_name: String) -> Result<(), EngineError> {
		Ok(CoreVaultOps::rename_dir(&self.inner, &path, &new_name)?)
	}

	fn move_file(&self, from: String, to: String) -> Result<MoveStatus, EngineError> {
		Ok(CoreVaultOps::move_file(&self.inner, &from, &to)?.into())
	}

	fn remove_dir(&self, path: String) -> Result<(), EngineError> {
		Ok(CoreVaultOps::remove_dir(&self.inner, &path)?)
	}
}

#[derive(uniffi::Object)]
pub struct VersionsHandle {
	inner: VersionVault,
}

impl VersionsHandle {
	pub(crate) fn core(&self) -> &VersionVault {
		&self.inner
	}
}

#[uniffi::export]
impl VersionsHandle {
	#[uniffi::constructor]
	pub fn new(vault: Arc<dyn VaultFs>) -> Arc<Self> {
		Arc::new(Self {
			inner: VersionVault::new(Arc::new(ForeignVault::new(vault))),
		})
	}

	pub fn read(&self, key: String) -> Result<Option<String>, EngineError> {
		Ok(self.inner.read(&key)?)
	}

	pub fn write(&self, key: String, json: String) -> Result<(), EngineError> {
		Ok(self.inner.write(&key, &json)?)
	}

	pub fn delete(&self, key: String) -> Result<(), EngineError> {
		Ok(self.inner.delete(&key)?)
	}

	pub fn commit(
		&self,
		key: String,
		title: String,
		content: String,
		id: String,
		created_at: i64,
		max_versions: u32,
	) -> Result<bool, EngineError> {
		Ok(self.inner.commit(
			&key,
			&title,
			&content,
			&id,
			created_at,
			max_versions as usize,
		)?)
	}

	pub fn rename(&self, old_key: String, new_key: String) -> Result<(), EngineError> {
		Ok(self.inner.rename(&old_key, &new_key)?)
	}

	pub fn rename_under(&self, old_prefix: String, new_prefix: String) -> Result<(), EngineError> {
		Ok(self.inner.rename_under(&old_prefix, &new_prefix)?)
	}

	pub fn delete_under(&self, prefix: String) -> Result<(), EngineError> {
		Ok(self.inner.delete_under(&prefix)?)
	}

	pub fn migrate_legacy(&self, folder: String, folder_path: String) -> Result<(), EngineError> {
		Ok(self.inner.migrate_legacy(&folder, &folder_path)?)
	}
}
