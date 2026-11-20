use crate::records::EngineError;
use engine::error::Result as CoreResult;
use engine::vault::VaultFs as CoreVaultFs;
use engine::versions::VersionVault;
use std::sync::Arc;

#[uniffi::export(with_foreign)]
pub trait VaultFs: Send + Sync {
	fn read_text(&self, path: String) -> Result<Option<String>, EngineError>;
	fn write_text(&self, path: String, text: String) -> Result<(), EngineError>;
	fn delete_file(&self, path: String) -> Result<(), EngineError>;
	fn list_files(&self, directory: String) -> Result<Vec<String>, EngineError>;
}

struct ForeignVault {
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
}

#[derive(uniffi::Object)]
pub struct VersionsHandle {
	inner: VersionVault,
}

#[uniffi::export]
impl VersionsHandle {
	#[uniffi::constructor]
	pub fn new(vault: Arc<dyn VaultFs>) -> Arc<Self> {
		Arc::new(Self {
			inner: VersionVault::new(Arc::new(ForeignVault { inner: vault })),
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
