use crate::constants::MAX_IDLE_CONNECTIONS;
use crate::error::Result;
use crate::index::Index;
use std::ops::{Deref, DerefMut};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Pool {
	database_path: PathBuf,
	locale_tag: String,
	idle: Mutex<Vec<Index>>,
}

pub struct Lease<'a> {
	index: Option<Index>,
	pool: &'a Pool,
}

impl Pool {
	pub fn new(database_path: PathBuf, locale_tag: String) -> Self {
		Self {
			database_path,
			locale_tag,
			idle: Mutex::new(Vec::new()),
		}
	}

	pub fn lease(&self) -> Result<Lease<'_>> {
		let reused = self.idle.lock().ok().and_then(|mut idle| idle.pop());
		let index = match reused {
			Some(index) => index,
			None => Index::open(&self.database_path, &self.locale_tag)?,
		};

		Ok(Lease {
			index: Some(index),
			pool: self,
		})
	}

	fn give_back(&self, index: Index) {
		if let Ok(mut idle) = self.idle.lock()
			&& idle.len() < MAX_IDLE_CONNECTIONS
		{
			idle.push(index);
		}
	}
}

impl Deref for Lease<'_> {
	type Target = Index;

	fn deref(&self) -> &Index {
		self.index.as_ref().expect("lease holds a connection")
	}
}

impl DerefMut for Lease<'_> {
	fn deref_mut(&mut self) -> &mut Index {
		self.index.as_mut().expect("lease holds a connection")
	}
}

impl Drop for Lease<'_> {
	fn drop(&mut self) {
		if let Some(index) = self.index.take() {
			self.pool.give_back(index);
		}
	}
}
