use super::constants::{
	LINE_END, YAML_COMMENT_MARKER, YAML_EMPTY_MAPPING, YAML_EMPTY_SEQUENCE, YAML_ESCAPED_QUOTE,
	YAML_INDENT, YAML_INDICATORS, YAML_KEY_SEPARATOR, YAML_LITERAL_HEADER, YAML_MAPPING_SUFFIX,
	YAML_NULL, YAML_SEQUENCE_MARKER, YAML_SINGLE_QUOTE, YAML_SPACED_INDICATORS, YAML_TAB,
};
use super::patterns::YAML_NON_STRING;
use serde_json::{Map, Value};

pub fn emit(mapping: &Map<String, Value>) -> String {
	if mapping.is_empty() {
		return format!("{YAML_EMPTY_MAPPING}{LINE_END}");
	}

	let mut out = String::new();
	write_mapping(&mut out, mapping, 0);
	out
}

fn write_mapping(out: &mut String, mapping: &Map<String, Value>, indent: usize) {
	for (key, value) in mapping {
		pad(out, indent);
		out.push_str(&string_scalar(key));
		out.push(':');
		write_entry(out, value, indent + YAML_INDENT);
	}
}

fn write_literal(out: &mut String, text: &str, indent: usize) {
	out.push_str(YAML_LITERAL_HEADER);
	out.push(LINE_END);

	for line in text.split(LINE_END) {
		if !line.is_empty() {
			pad(out, indent);
			out.push_str(line);
		}

		out.push(LINE_END);
	}
}

fn is_literal(value: &Value) -> Option<&str> {
	let Value::String(text) = value else {
		return None;
	};

	let simple = text.contains(LINE_END)
		&& !text.ends_with(LINE_END)
		&& !text.starts_with(char::is_whitespace)
		&& !text
			.chars()
			.any(|c| c.is_control() && c != LINE_END && c != '\t');

	simple.then_some(text.as_str())
}

fn write_entry(out: &mut String, value: &Value, indent: usize) {
	if let Some(text) = is_literal(value) {
		out.push(' ');
		write_literal(out, text, indent);
		return;
	}

	match inline(value) {
		Some(scalar) => {
			out.push(' ');
			out.push_str(&scalar);
			out.push(LINE_END);
		}
		None => {
			out.push(LINE_END);
			write_block(out, value, indent);
		}
	}
}

fn write_block(out: &mut String, value: &Value, indent: usize) {
	match value {
		Value::Object(mapping) => write_mapping(out, mapping, indent),
		Value::Array(items) => write_sequence(out, items, indent),
		_ => {}
	}
}

fn write_sequence(out: &mut String, items: &[Value], indent: usize) {
	for item in items {
		pad(out, indent);
		out.push_str(YAML_SEQUENCE_MARKER.trim_end());

		if let Some(text) = is_literal(item) {
			out.push(' ');
			write_literal(out, text, indent + YAML_INDENT);
			continue;
		}

		match inline(item) {
			Some(scalar) => {
				out.push(' ');
				out.push_str(&scalar);
				out.push(LINE_END);
			}
			None => {
				let mut nested = String::new();
				write_block(&mut nested, item, indent + YAML_INDENT);
				let rest = &nested[indent + YAML_INDENT..];
				out.push(' ');
				out.push_str(rest);
			}
		}
	}
}

fn inline(value: &Value) -> Option<String> {
	match value {
		Value::Null => Some(YAML_NULL.to_string()),
		Value::Bool(flag) => Some(flag.to_string()),
		Value::Number(number) => Some(number.to_string()),
		Value::String(text) => Some(string_scalar(text)),
		Value::Array(items) if items.is_empty() => Some(YAML_EMPTY_SEQUENCE.to_string()),
		Value::Object(mapping) if mapping.is_empty() => Some(YAML_EMPTY_MAPPING.to_string()),
		_ => None,
	}
}

fn string_scalar(text: &str) -> String {
	if needs_double_quotes(text) {
		return serde_json::to_string(text).unwrap_or_default();
	}

	if is_plain(text) {
		return text.to_string();
	}

	let escaped = text.replace(YAML_SINGLE_QUOTE, YAML_ESCAPED_QUOTE);

	format!("{YAML_SINGLE_QUOTE}{escaped}{YAML_SINGLE_QUOTE}")
}

fn needs_double_quotes(text: &str) -> bool {
	text.chars().any(|c| c.is_control() && c != '\t')
}

fn is_plain(text: &str) -> bool {
	let Some(first) = text.chars().next() else {
		return false;
	};

	let mut rest = text.chars().skip(1);
	let spaced_indicator =
		YAML_SPACED_INDICATORS.contains(first) && rest.next().is_none_or(char::is_whitespace);

	!YAML_INDICATORS.contains(first)
		&& !spaced_indicator
		&& !text.starts_with(char::is_whitespace)
		&& !text.ends_with(char::is_whitespace)
		&& !text.ends_with(YAML_MAPPING_SUFFIX)
		&& !text.contains(YAML_KEY_SEPARATOR)
		&& !text.contains(YAML_COMMENT_MARKER)
		&& !text.contains(YAML_TAB)
		&& !YAML_NON_STRING.is_match(text)
}

fn pad(out: &mut String, indent: usize) {
	out.extend(std::iter::repeat_n(' ', indent));
}
