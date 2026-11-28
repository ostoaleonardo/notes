use super::constants::{
	ARRAY_JOINER, EXPONENT_MARKER, EXPONENT_WITH_SIGN, JS_WHITESPACE, JS_WHITESPACE_RANGE,
	MAX_PLAIN_NUMBER, MIN_PLAIN_NUMBER, NEGATIVE_EXPONENT, NEGATIVE_INFINITY, NOT_A_NUMBER,
	OBJECT_STRING, POSITIVE_INFINITY, RADIX_PREFIXES, SIGNED_POSITIVE_INFINITY,
};
use super::patterns::NUMBER_LITERAL;
use serde_json::Value;
use std::cmp::Ordering;

pub fn is_js_whitespace(character: char) -> bool {
	matches!(character, '\t' | '\n' | '\r' | ' ' | '\u{000c}')
		|| JS_WHITESPACE.contains(&character)
		|| (JS_WHITESPACE_RANGE.0..=JS_WHITESPACE_RANGE.1).contains(&character)
}

pub fn js_trim(text: &str) -> &str {
	text.trim_matches(is_js_whitespace)
}

pub fn js_number(text: &str) -> Option<f64> {
	let trimmed = js_trim(text);

	if trimmed.is_empty() {
		return Some(0.0);
	}

	match trimmed {
		POSITIVE_INFINITY | SIGNED_POSITIVE_INFINITY => return Some(f64::INFINITY),
		NEGATIVE_INFINITY => return Some(f64::NEG_INFINITY),
		_ => {}
	}

	for (prefix, radix) in RADIX_PREFIXES {
		if let Some(digits) = trimmed.strip_prefix(prefix) {
			return u128::from_str_radix(digits, radix)
				.ok()
				.filter(|_| !digits.is_empty())
				.map(|value| value as f64);
		}
	}

	if NUMBER_LITERAL.is_match(trimmed) {
		return trimmed.parse().ok();
	}

	None
}

pub fn compare_utf16(left: &str, right: &str) -> Ordering {
	left.encode_utf16().cmp(right.encode_utf16())
}

fn number_text(value: f64) -> String {
	if value.is_nan() {
		return NOT_A_NUMBER.to_string();
	}

	if value.is_infinite() {
		return if value > 0.0 {
			POSITIVE_INFINITY
		} else {
			NEGATIVE_INFINITY
		}
		.to_string();
	}

	let magnitude = value.abs();

	if magnitude >= MAX_PLAIN_NUMBER || (magnitude != 0.0 && magnitude < MIN_PLAIN_NUMBER) {
		let scientific = format!("{value:e}");

		return if scientific.contains(NEGATIVE_EXPONENT) {
			scientific
		} else {
			scientific.replace(EXPONENT_MARKER, EXPONENT_WITH_SIGN)
		};
	}

	format!("{value}")
}

pub fn js_string(value: &Value) -> String {
	match value {
		Value::Null => String::new(),
		Value::Bool(flag) => flag.to_string(),
		Value::Number(number) => number_text(number.as_f64().unwrap_or(f64::NAN)),
		Value::String(text) => text.clone(),
		Value::Array(items) => items
			.iter()
			.map(js_string)
			.collect::<Vec<_>>()
			.join(ARRAY_JOINER),
		Value::Object(_) => OBJECT_STRING.to_string(),
	}
}
