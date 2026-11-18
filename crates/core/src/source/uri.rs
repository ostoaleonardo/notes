use super::constants::{PERCENT, URI_UNRESERVED};
use std::fmt::Write;

pub fn encode(text: &str) -> String {
	let mut encoded = String::with_capacity(text.len());

	for byte in text.bytes() {
		if byte.is_ascii_alphanumeric() || URI_UNRESERVED.as_bytes().contains(&byte) {
			encoded.push(byte as char);
		} else {
			let _ = write!(encoded, "{PERCENT}{byte:02X}");
		}
	}

	encoded
}
