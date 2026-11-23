use super::constants::{
	KEY_AT, KEY_CREATED_AT, KEY_DELTA, KEY_ENTRIES, KEY_HEAD, KEY_HEAD_CONTENT, KEY_ID, KEY_INSERT,
	KEY_REMOVE, KEY_TITLE,
};
use super::delta::{Hunk, build_line_delta};
use serde_json::{Map, Value, json};

fn delta_value(delta: &[Hunk]) -> Value {
	Value::Array(
		delta
			.iter()
			.map(|hunk| {
				json!({
					KEY_AT: hunk.at,
					KEY_REMOVE: hunk.remove,
					KEY_INSERT: hunk.insert,
				})
			})
			.collect(),
	)
}

fn pack(versions: &[Value]) -> Value {
	let Some(last) = versions.last() else {
		return json!({ KEY_HEAD: "", KEY_ENTRIES: [] });
	};

	let text = |version: &Value| version[KEY_HEAD_CONTENT].as_str().unwrap_or("").to_string();
	let last_index = versions.len() - 1;

	let entries: Vec<Value> = versions
		.iter()
		.enumerate()
		.map(|(index, version)| {
			let delta = if index == last_index {
				Value::Null
			} else {
				delta_value(&build_line_delta(
					&text(&versions[index + 1]),
					&text(version),
				))
			};

			json!({
				KEY_ID: version[KEY_ID],
				KEY_TITLE: version[KEY_TITLE],
				KEY_CREATED_AT: version[KEY_CREATED_AT],
				KEY_DELTA: delta,
			})
		})
		.collect();

	json!({ KEY_HEAD: text(last), KEY_ENTRIES: entries })
}

pub struct NewVersion<'a> {
	pub id: &'a str,
	pub title: &'a str,
	pub created_at: i64,
	pub content: &'a str,
	pub max_versions: usize,
	pub max_age_ms: i64,
}

fn expired_prefix(entries: &[Value], version: &NewVersion<'_>) -> usize {
	if version.max_age_ms <= 0 {
		return 0;
	}

	let cutoff = version.created_at.saturating_sub(version.max_age_ms);

	entries[..entries.len() - 1]
		.iter()
		.take_while(|entry| entry[KEY_CREATED_AT].as_i64().is_some_and(|at| at < cutoff))
		.count()
}

pub fn commit_version(
	raw: Option<&str>,
	version: &NewVersion<'_>,
) -> Result<Option<String>, String> {
	let parsed: Value = match raw {
		Some(text) if !text.is_empty() => {
			serde_json::from_str(text).map_err(|error| error.to_string())?
		}
		_ => json!([]),
	};

	let store = if parsed.is_array() {
		pack(parsed.as_array().map(Vec::as_slice).unwrap_or(&[]))
	} else {
		parsed
	};

	let head = store[KEY_HEAD].as_str().unwrap_or("");
	let entries = store[KEY_ENTRIES].as_array().cloned().unwrap_or_default();
	let last = entries.last();

	if let Some(last) = last
		&& last[KEY_TITLE].as_str() == Some(version.title)
		&& head == version.content
	{
		return Ok(None);
	}

	let mut next: Vec<Value> = Vec::with_capacity(entries.len() + 1);

	if let Some(last) = last {
		next.extend(entries[..entries.len() - 1].iter().cloned());

		let mut updated: Map<String, Value> = last.as_object().cloned().unwrap_or_default();
		updated.insert(
			KEY_DELTA.to_string(),
			delta_value(&build_line_delta(version.content, head)),
		);
		next.push(Value::Object(updated));
	}

	next.push(json!({
		KEY_ID: version.id,
		KEY_TITLE: version.title,
		KEY_CREATED_AT: version.created_at,
		KEY_DELTA: Value::Null,
	}));

	let by_count = next.len().saturating_sub(version.max_versions);
	let by_age = expired_prefix(&next, version);
	let kept: Vec<Value> = next.into_iter().skip(by_count.max(by_age)).collect();

	Ok(Some(
		json!({ KEY_HEAD: version.content, KEY_ENTRIES: kept }).to_string(),
	))
}
