use super::compiled::{Comparison, Compiled, Filter, Kind, Property, TextMatcher};
use super::constants::{
	FRONTMATTER_JOINER, LINE_SEPARATOR, PATH_SEPARATOR, SECTION_JOINER, TAG_PATH_SEPARATOR,
	TASK_DONE_STATUSES, TASK_TODO_STATUS,
};
use super::js::{compare_utf16, js_number, js_string, js_trim};
use super::patterns::{
	BLOCK_SEPARATOR, FILE_EMBED, FILE_LINK, HEADING_LINE, IMAGE_REFERENCE, TASK_LINE,
	WORD_CHARACTER,
};
use regex::Regex;
use serde_json::{Map, Value};
use std::borrow::Cow;
use std::cell::OnceCell;
use std::cmp::Ordering;

use super::constants::{FILE_EXTENSION_GROUP, IMAGE_EXTENSIONS};

pub struct NoteView<'a> {
	pub title: &'a str,
	pub filename: &'a str,
	pub folder: Option<&'a str>,
	pub content: &'a str,
	pub tags: &'a [String],
	pub properties: &'a Map<String, Value>,
	pub pinned: bool,
}

struct Field<'a> {
	raw: Cow<'a, str>,
	whole_word: bool,
	lower: OnceCell<String>,
}

impl<'a> Field<'a> {
	fn new(raw: impl Into<Cow<'a, str>>, whole_word: bool) -> Self {
		Self {
			raw: raw.into(),
			whole_word,
			lower: OnceCell::new(),
		}
	}

	fn lower(&self) -> &str {
		self.lower.get_or_init(|| self.raw.to_lowercase())
	}
}

struct Task<'a> {
	field: Field<'a>,
	status: char,
}

struct Info<'a> {
	text: &'a str,
	title: Field<'a>,
	filename: Field<'a>,
	full_path: Field<'a>,
	content: Field<'a>,
	lines: OnceCell<Vec<Field<'a>>>,
	blocks: OnceCell<Vec<Field<'a>>>,
	sections: OnceCell<Vec<Field<'a>>>,
	tasks: OnceCell<Vec<Task<'a>>>,
	images: OnceCell<bool>,
	files: OnceCell<bool>,
}

#[derive(Clone, Copy)]
struct Context<'a, 'b> {
	note: &'b NoteView<'a>,
	info: &'b Info<'a>,
	sensitive: bool,
}

fn info_of<'a>(note: &NoteView<'a>) -> Info<'a> {
	let filename = if note.filename.is_empty() {
		note.title
	} else {
		note.filename
	};
	let full_path = match note.folder {
		Some(folder) if !folder.is_empty() => format!("{folder}{PATH_SEPARATOR}{filename}"),
		_ => filename.to_string(),
	};

	Info {
		text: note.content,
		title: Field::new(note.title, false),
		filename: Field::new(filename, false),
		full_path: Field::new(full_path, false),
		content: Field::new(note.content, true),
		lines: OnceCell::new(),
		blocks: OnceCell::new(),
		sections: OnceCell::new(),
		tasks: OnceCell::new(),
		images: OnceCell::new(),
		files: OnceCell::new(),
	}
}

fn lines<'a, 'b>(info: &'b Info<'a>) -> &'b [Field<'a>] {
	info.lines.get_or_init(|| {
		info.text
			.split(LINE_SEPARATOR)
			.map(|line| Field::new(line, true))
			.collect()
	})
}

fn blocks<'a, 'b>(info: &'b Info<'a>) -> &'b [Field<'a>] {
	info.blocks.get_or_init(|| {
		BLOCK_SEPARATOR
			.split(info.text)
			.map(|block| Field::new(block, true))
			.collect()
	})
}

fn sections<'a, 'b>(info: &'b Info<'a>) -> &'b [Field<'a>] {
	info.sections.get_or_init(|| {
		let mut grouped: Vec<Vec<&str>> = Vec::new();

		for line in lines(info) {
			if HEADING_LINE.is_match(&line.raw) || grouped.is_empty() {
				grouped.push(Vec::new());
			}

			if let Some(section) = grouped.last_mut() {
				section.push(&line.raw);
			}
		}

		grouped
			.into_iter()
			.map(|section| Field::new(section.join(SECTION_JOINER), true))
			.collect()
	})
}

fn tasks<'a, 'b>(info: &'b Info<'a>) -> &'b [Task<'a>] {
	info.tasks.get_or_init(|| {
		info.text
			.split(LINE_SEPARATOR)
			.filter_map(|line| {
				let captures = TASK_LINE.captures(line)?;
				let whole = captures.get(0)?;
				let status = captures.get(1)?.as_str().chars().next()?;

				Some(Task {
					field: Field::new(&line[whole.end()..], true),
					status,
				})
			})
			.collect()
	})
}

fn has_images(info: &Info<'_>) -> bool {
	*info
		.images
		.get_or_init(|| IMAGE_REFERENCE.is_match(&info.content.raw))
}

fn has_files(info: &Info<'_>) -> bool {
	*info.files.get_or_init(|| {
		FILE_LINK.is_match(&info.content.raw)
			|| FILE_EMBED.captures_iter(&info.content.raw).any(|captures| {
				captures.get(FILE_EXTENSION_GROUP).is_some_and(|extension| {
					!IMAGE_EXTENSIONS.contains(&extension.as_str().to_lowercase().as_str())
				})
			})
	})
}

fn is_word_character(character: char) -> bool {
	let mut buffer = [0u8; 4];

	WORD_CHARACTER.is_match(character.encode_utf8(&mut buffer))
}

fn word_match(regex: &Regex, text: &str) -> bool {
	let mut position = 0;

	while let Some(found) = regex.find_at(text, position) {
		let before_ok = !text[..found.start()]
			.chars()
			.next_back()
			.is_some_and(is_word_character);
		let after_ok = !text[found.end()..]
			.chars()
			.next()
			.is_some_and(is_word_character);

		if before_ok && after_ok {
			return true;
		}

		match text[found.start()..].chars().next() {
			Some(first) => position = found.start() + first.len_utf8(),
			None => return false,
		}
	}

	false
}

fn matches_text(matcher: &TextMatcher, field: &Field<'_>, sensitive: bool) -> bool {
	if let Some(words) = &matcher.words
		&& field.whole_word
	{
		let regex = if sensitive {
			&words.sensitive
		} else {
			&words.insensitive
		};

		return word_match(regex, &field.raw);
	}

	if sensitive {
		field.raw.contains(matcher.value.as_str())
	} else {
		field.lower().contains(matcher.lower.as_str())
	}
}

fn compare_values(
	raw: &str,
	comparison: Comparison,
	target: &str,
	target_number: Option<f64>,
) -> bool {
	let numeric = if js_trim(raw).is_empty() || js_trim(target).is_empty() {
		None
	} else {
		js_number(raw)
			.zip(target_number)
			.filter(|(left, right)| !left.is_nan() && !right.is_nan())
	};

	let ordering = match numeric {
		Some((left, right)) => left.partial_cmp(&right),
		None => Some(compare_utf16(&raw.to_lowercase(), &target.to_lowercase())),
	};

	let Some(ordering) = ordering else {
		return false;
	};

	match comparison {
		Comparison::Greater => ordering == Ordering::Greater,
		Comparison::GreaterOrEqual => ordering != Ordering::Less,
		Comparison::Less => ordering == Ordering::Less,
		Comparison::LessOrEqual => ordering != Ordering::Greater,
	}
}

fn property_values(properties: &Map<String, Value>, key: &str) -> Option<Vec<String>> {
	let (_, value) = properties
		.iter()
		.find(|(name, _)| name.to_lowercase() == key)?;

	Some(match value {
		Value::Array(items) => items.iter().map(js_string).collect(),
		other => vec![js_string(other)],
	})
}

fn matches_tag(tag: &str, query: &str) -> bool {
	let key = tag.to_lowercase();

	key == query
		|| key
			.strip_prefix(query)
			.is_some_and(|rest| rest.starts_with(TAG_PATH_SEPARATOR))
}

fn evaluate_property(node: &Property, context: Context<'_, '_>) -> bool {
	let Some(values) = property_values(context.note.properties, &node.key) else {
		return false;
	};

	let Some(expression) = &node.expression else {
		return true;
	};

	if node.is_null {
		return values.is_empty() || values.iter().all(|value| js_trim(value).is_empty());
	}

	values.iter().any(|value| {
		let field = Field::new(value.as_str(), false);

		evaluate(expression, context, &[&field])
	})
}

fn evaluate_filter(node: &Filter, context: Context<'_, '_>, fields: &[&Field<'_>]) -> bool {
	let info = context.info;
	let argument = node.argument.as_deref();
	let with = |fields: &[&Field<'_>], sensitive: bool| {
		argument.is_none_or(|inner| {
			evaluate(
				inner,
				Context {
					sensitive,
					..context
				},
				fields,
			)
		})
	};

	match &node.kind {
		Kind::File => with(&[&info.filename], context.sensitive),
		Kind::Path => with(&[&info.full_path], context.sensitive),
		Kind::Content => with(&[&info.content], context.sensitive),
		Kind::MatchCase => with(fields, true),
		Kind::IgnoreCase => with(fields, false),
		Kind::Tag(target) => context.note.tags.iter().any(|tag| matches_tag(tag, target)),
		Kind::Pinned(is_pinned) => *is_pinned && context.note.pinned,
		Kind::HasImages(images) => {
			if *images {
				has_images(info)
			} else {
				has_files(info)
			}
		}
		Kind::Line => lines(info)
			.iter()
			.any(|unit| with(&[unit], context.sensitive)),
		Kind::Block => blocks(info)
			.iter()
			.any(|unit| with(&[unit], context.sensitive)),
		Kind::Section => sections(info)
			.iter()
			.any(|unit| with(&[unit], context.sensitive)),
		Kind::Task | Kind::TaskTodo | Kind::TaskDone => tasks(info).iter().any(|task| {
			let status_ok = match &node.kind {
				Kind::TaskTodo => task.status == TASK_TODO_STATUS,
				Kind::TaskDone => TASK_DONE_STATUSES.contains(&task.status),
				_ => true,
			};

			status_ok && with(&[&task.field], context.sensitive)
		}),
	}
}

fn evaluate(node: &Compiled, context: Context<'_, '_>, fields: &[&Field<'_>]) -> bool {
	match node {
		Compiled::And(children) => children
			.iter()
			.all(|child| evaluate(child, context, fields)),
		Compiled::Or(children) => children
			.iter()
			.any(|child| evaluate(child, context, fields)),
		Compiled::Not(child) => !evaluate(child, context, fields),
		Compiled::Text(matcher) => fields
			.iter()
			.any(|field| matches_text(matcher, field, context.sensitive)),
		Compiled::Regex(matcher) => {
			let regex = if context.sensitive {
				&matcher.sensitive
			} else {
				&matcher.insensitive
			};

			fields.iter().any(|field| regex.is_match(&field.raw))
		}
		Compiled::Compare {
			comparison,
			value,
			number,
		} => fields
			.iter()
			.any(|field| compare_values(&field.raw, *comparison, value, *number)),
		Compiled::Null => fields.iter().all(|field| js_trim(&field.raw).is_empty()),
		Compiled::Property(property) => evaluate_property(property, context),
		Compiled::Filter(filter) => evaluate_filter(filter, context, fields),
	}
}

pub fn matches(root: &Compiled, note: &NoteView<'_>, match_case: bool) -> bool {
	let info = info_of(note);
	let context = Context {
		note,
		info: &info,
		sensitive: match_case,
	};

	evaluate(
		root,
		context,
		&[&info.title, &info.filename, &info.full_path, &info.content],
	)
}

pub fn frontmatter_joined(frontmatter: &str, body: &str) -> String {
	if frontmatter.is_empty() {
		body.to_string()
	} else {
		format!("{frontmatter}{FRONTMATTER_JOINER}{body}")
	}
}
