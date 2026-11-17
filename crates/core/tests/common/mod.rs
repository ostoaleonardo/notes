#![allow(dead_code)]

use serde_json::Value;
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;

fn fixtures() -> PathBuf {
	PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../src/features/syntax/__fixtures__")
}

pub fn expected() -> Value {
	let text = fs::read_to_string(fixtures().join("expected.json")).expect("expected.json");
	serde_json::from_str(&text).expect("valid json")
}

pub fn corpus() -> Vec<(String, String)> {
	let mut entries: Vec<_> = fs::read_dir(fixtures().join("corpus"))
		.expect("corpus directory")
		.map(|entry| entry.expect("entry").path())
		.filter(|path| path.extension().is_some_and(|ext| ext == "md"))
		.map(|path| {
			let name = path
				.file_stem()
				.expect("stem")
				.to_string_lossy()
				.into_owned();
			(name, fs::read_to_string(&path).expect("readable"))
		})
		.collect();

	entries.sort();
	entries
}

pub fn dedupe_ignoring_case(names: Vec<String>) -> Vec<String> {
	let mut seen = HashSet::new();

	names
		.into_iter()
		.filter(|name| seen.insert(name.to_lowercase()))
		.collect()
}

pub fn frontmatter_of(text: &str) -> &str {
	let body = text.strip_prefix("---\n").unwrap_or("");

	body.split_once("\n---").map_or("", |(raw, _)| raw)
}

pub fn plain_numbers(value: Value) -> Value {
	match value {
		Value::Number(number) => match number.as_f64() {
			Some(float) if number.is_f64() && float.fract() == 0.0 && float.abs() < 9e15 => {
				Value::from(float as i64)
			}
			_ => Value::Number(number),
		},
		Value::Array(items) => Value::Array(items.into_iter().map(plain_numbers).collect()),
		Value::Object(map) => Value::Object(
			map.into_iter()
				.map(|(key, value)| (key, plain_numbers(value)))
				.collect(),
		),
		other => other,
	}
}

pub fn strings(value: &Value) -> Vec<String> {
	value
		.as_array()
		.expect("array")
		.iter()
		.map(|item| item.as_str().expect("string").to_string())
		.collect()
}
