uniffi::setup_scaffolding!("engine");

mod constants;
mod index;
mod links;
mod names;
mod notes;
mod ops;
mod records;
mod repository;
mod search;
mod source;
mod sync;

use records::EngineError;

#[derive(uniffi::Object)]
pub struct Engine {
	pub(crate) inner: engine::engine::Engine,
}

#[uniffi::export]
impl Engine {
	#[uniffi::constructor]
	pub fn new(database_path: String, locale_tag: String) -> Result<Self, EngineError> {
		Ok(Self {
			inner: engine::engine::Engine::new(database_path, &locale_tag)?,
		})
	}
}
