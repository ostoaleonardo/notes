use super::constants::{HEX_LETTER_BASE, HEX_RADIX, PERCENT, URI_UNRESERVED};
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

pub fn decode(text: &str) -> String {
	let bytes = text.as_bytes();
	let mut decoded = Vec::with_capacity(bytes.len());
	let mut position = 0;

	while position < bytes.len() {
		let pair = (bytes[position] == PERCENT as u8)
			.then(|| {
				let high = bytes.get(position + 1).copied().and_then(hex)?;
				let low = bytes.get(position + 2).copied().and_then(hex)?;

				Some(high * HEX_RADIX + low)
			})
			.flatten();

		match pair {
			Some(byte) => {
				decoded.push(byte);
				position += 3;
			}
			None => {
				decoded.push(bytes[position]);
				position += 1;
			}
		}
	}

	String::from_utf8_lossy(&decoded).into_owned()
}

fn hex(byte: u8) -> Option<u8> {
	match byte {
		b'0'..=b'9' => Some(byte - b'0'),
		b'a'..=b'f' => Some(byte - b'a' + HEX_LETTER_BASE),
		b'A'..=b'F' => Some(byte - b'A' + HEX_LETTER_BASE),
		_ => None,
	}
}
