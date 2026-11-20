use super::constants::{ALIAS_SEPARATOR, LINK_CLOSE, LINK_OPEN};

pub fn wiki_targets(body: &str) -> Vec<&str> {
	let bytes = body.as_bytes();
	let mut targets = Vec::new();
	let mut from = 0;

	while let Some(offset) = body[from..].find(LINK_OPEN) {
		let start = from + offset + LINK_OPEN.len();

		match match_target(body, bytes, start) {
			Some((target, end)) => {
				targets.push(target);
				from = end;
			}
			None => from += offset + 1,
		}
	}

	targets
}

fn match_target<'a>(body: &'a str, bytes: &[u8], start: usize) -> Option<(&'a str, usize)> {
	let mut cursor = start;

	while cursor < bytes.len() && bytes[cursor] != b']' && bytes[cursor] != ALIAS_SEPARATOR as u8 {
		cursor += 1;
	}

	if cursor == start || cursor >= bytes.len() {
		return None;
	}

	let target = &body[start..cursor];

	if bytes[cursor] == ALIAS_SEPARATOR as u8 {
		let label_start = cursor + 1;
		cursor = label_start;

		while cursor < bytes.len() && bytes[cursor] != b']' {
			cursor += 1;
		}

		if cursor == label_start || cursor >= bytes.len() {
			return None;
		}
	}

	body[cursor..]
		.starts_with(LINK_CLOSE)
		.then_some((target, cursor + LINK_CLOSE.len()))
}
