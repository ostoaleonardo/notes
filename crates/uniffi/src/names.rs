use crate::records::{DecomposeReport, EngineError, NoteFieldsRequest};

#[uniffi::export]
pub fn compose_note(fields: NoteFieldsRequest, body: String) -> Result<String, EngineError> {
	Ok(engine::syntax::compose(&fields.try_into()?, &body))
}

#[uniffi::export]
pub fn decompose_note(content: String) -> DecomposeReport {
	engine::syntax::decompose(&content).into()
}

#[uniffi::export]
pub fn sanitize_filename(title: String, extension: String) -> String {
	engine::names::sanitize_filename(&title, &extension)
}

#[uniffi::export]
pub fn unique_filename(
	existing: Vec<String>,
	stem: String,
	extension: String,
	current: Option<String>,
) -> String {
	engine::names::unique_name(&existing, &stem, &extension, current.as_deref())
}
