use super::constants::{
	ADVANCE, BACKTICK, BLANK_CHAR, FENCE_CHARS, FENCE_LENGTH, FENCE_MARKERS, MAX_FENCE_INDENT,
	NEWLINE, SPACE, TAB, TILDE,
};
use super::patterns::INLINE_CODE;
use std::ops::Range;

pub fn blank(text: &str, ranges: &[Range<usize>]) -> String {
	let mut out = String::with_capacity(text.len());
	let mut cursor = 0;

	for range in ranges {
		out.push_str(&text[cursor..range.start]);
		out.extend(text[range.clone()].chars().map(|_| BLANK_CHAR));
		cursor = range.end;
	}

	out.push_str(&text[cursor..]);
	out
}

pub fn fenced_ranges(text: &str) -> Vec<Range<usize>> {
	let mut ranges = Vec::new();
	let mut position = 0;

	while let Some(start) = find_fence(text, position) {
		let marker = &text[start..start + FENCE_LENGTH];
		let body = start + FENCE_LENGTH;
		let end = text[body..]
			.find(marker)
			.map_or(text.len(), |offset| body + offset + FENCE_LENGTH);

		ranges.push(start..end);
		position = end;
	}

	ranges
}

pub fn inline_ranges(text: &str) -> Vec<Range<usize>> {
	INLINE_CODE.find_iter(text).map(|m| m.range()).collect()
}

fn find_fence(text: &str, from: usize) -> Option<usize> {
	let mut position = from;

	while let Some(offset) = text[position..].find(FENCE_CHARS) {
		let start = position + offset;

		if FENCE_MARKERS
			.iter()
			.any(|marker| text[start..].starts_with(marker))
		{
			return Some(start);
		}

		position = start + ADVANCE;
	}

	None
}

pub fn code_segments(text: &str) -> Vec<Range<usize>> {
	let mut segments = Vec::new();
	let mut line_start = 0;

	while line_start <= text.len() {
		let line_end = text[line_start..]
			.find(NEWLINE)
			.map_or(text.len(), |i| line_start + i);

		if let Some(fence) = opening_fence(&text[line_start..line_end]) {
			let end = closing_line_end(text, line_end, fence);
			segments.push(line_start..end);
			line_start = end + ADVANCE;
			continue;
		}

		segments.extend(inline_spans(text, line_start, line_end));
		line_start = line_end + ADVANCE;
	}

	segments
}

#[derive(Clone, Copy)]
struct Fence {
	marker: u8,
	length: usize,
}

fn indent_length(line: &str) -> usize {
	line.bytes()
		.take(MAX_FENCE_INDENT)
		.take_while(|b| matches!(*b, SPACE | TAB))
		.count()
}

fn opening_fence(line: &str) -> Option<Fence> {
	let rest = &line.as_bytes()[indent_length(line)..];
	let marker = *rest.first().filter(|b| matches!(**b, BACKTICK | TILDE))?;
	let length = rest.iter().take_while(|b| **b == marker).count();

	(length >= FENCE_LENGTH).then_some(Fence { marker, length })
}

fn closes_fence(line: &str, fence: Fence) -> bool {
	let rest = &line.as_bytes()[indent_length(line)..];
	let run = rest.iter().take_while(|b| **b == fence.marker).count();

	if run < fence.length {
		return false;
	}

	rest[run..]
		.iter()
		.skip_while(|b| matches!(**b, BACKTICK | TILDE))
		.all(|b| matches!(*b, SPACE | TAB))
}

fn closing_line_end(text: &str, opening_end: usize, fence: Fence) -> usize {
	let mut start = opening_end + ADVANCE;

	while start <= text.len() {
		let end = text[start..]
			.find(NEWLINE)
			.map_or(text.len(), |i| start + i);

		if closes_fence(&text[start..end], fence) {
			return end;
		}

		start = end + ADVANCE;
	}

	text.len()
}

fn inline_spans(text: &str, line_start: usize, line_end: usize) -> Vec<Range<usize>> {
	let line = &text[line_start..line_end];
	let bytes = line.as_bytes();
	let mut spans = Vec::new();
	let mut i = 0;

	while i < bytes.len() {
		if bytes[i] != BACKTICK {
			i += ADVANCE;
			continue;
		}

		let run = bytes[i..].iter().take_while(|b| **b == BACKTICK).count();

		match closing_run(bytes, i + run, run) {
			Some(end) => {
				spans.push(line_start + i..line_start + end);
				i = end;
			}
			None => i += run,
		}
	}

	spans
}

fn closing_run(bytes: &[u8], from: usize, length: usize) -> Option<usize> {
	let mut i = from;

	while i < bytes.len() {
		if bytes[i] != BACKTICK {
			i += ADVANCE;
			continue;
		}

		let run = bytes[i..].iter().take_while(|b| **b == BACKTICK).count();

		if run == length && i > from {
			return Some(i + run);
		}

		i += run;
	}

	None
}
