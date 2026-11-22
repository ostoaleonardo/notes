use super::constants::{
	COLUMN_CONTENT, COLUMN_TITLE, FORBIDDEN_TERM_CHARACTERS, MIN_TERM_CHARACTERS, OPERATOR_BLOCK,
	OPERATOR_CONTENT, OPERATOR_FILE, OPERATOR_IGNORE_CASE, OPERATOR_LINE, OPERATOR_MATCH_CASE,
	OPERATOR_SECTION, OPERATOR_TAG, OPERATOR_TASK_DONE, OPERATOR_TASK_TODO, PRINTABLE_ASCII,
	TAG_HASH_PREFIX,
};
use super::query::Node;
use super::sql;
use crate::names::nfc;
use serde::{Deserialize, Serialize};

const OPERATOR_TASK: &str = "task";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Field {
	Title,
	Filename,
	Path,
	Content,
}

const ALL_FIELDS: [Field; 4] = [Field::Title, Field::Filename, Field::Path, Field::Content];

fn column_of(field: Field) -> Option<&'static str> {
	match field {
		Field::Title | Field::Filename => Some(COLUMN_TITLE),
		Field::Content => Some(COLUMN_CONTENT),
		Field::Path => None,
	}
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Requirement {
	Fts {
		columns: Vec<&'static str>,
		term: String,
	},
	Tag(String),
	And(Vec<Requirement>),
	Or(Vec<Requirement>),
}

fn utf16_length(text: &str) -> usize {
	text.encode_utf16().count()
}

fn is_stable_term(value: &str) -> bool {
	value.chars().count() >= MIN_TERM_CHARACTERS
		&& !value.contains(FORBIDDEN_TERM_CHARACTERS)
		&& utf16_length(&value.to_lowercase()) == utf16_length(value)
		&& nfc(value) == value
}

fn may_match_folder(value: &str, folders: &[String]) -> bool {
	let lower = value.to_lowercase();

	folders
		.iter()
		.any(|folder| folder.to_lowercase().contains(&lower))
}

fn text_requirement(value: &str, fields: &[Field], folders: &[String]) -> Option<Requirement> {
	if !is_stable_term(value) {
		return None;
	}

	if fields.contains(&Field::Path) && may_match_folder(value, folders) {
		return None;
	}

	let mut columns: Vec<&'static str> = Vec::new();

	for column in fields.iter().filter_map(|field| column_of(*field)) {
		if !columns.contains(&column) {
			columns.push(column);
		}
	}

	if columns.is_empty() {
		return None;
	}

	Some(Requirement::Fts {
		columns,
		term: value.to_string(),
	})
}

fn tag_requirement(argument: &Node) -> Option<Requirement> {
	let Node::Text { value, .. } = argument else {
		return None;
	};

	let lower = value.to_lowercase();
	let name = lower.strip_prefix(TAG_HASH_PREFIX).unwrap_or(&lower);

	if name.is_empty()
		|| !name
			.chars()
			.all(|character| PRINTABLE_ASCII.contains(&character))
	{
		return None;
	}

	Some(Requirement::Tag(name.to_string()))
}

fn combine(
	parts: Vec<Requirement>,
	make: fn(Vec<Requirement>) -> Requirement,
) -> Option<Requirement> {
	match parts.len() {
		0 => None,
		1 => parts.into_iter().next(),
		_ => Some(make(parts)),
	}
}

fn filter_requirement(
	name: &str,
	argument: Option<&Node>,
	fields: &[Field],
	folders: &[String],
) -> Option<Requirement> {
	let nested = |node: Option<&Node>, scope: &[Field]| {
		node.and_then(|inner| requirement(inner, scope, folders))
	};

	match name {
		OPERATOR_FILE => nested(argument, &[Field::Filename]),
		OPERATOR_CONTENT => nested(argument, &[Field::Content]),
		OPERATOR_MATCH_CASE | OPERATOR_IGNORE_CASE => nested(argument, fields),
		OPERATOR_TAG => argument.and_then(tag_requirement),
		OPERATOR_LINE | OPERATOR_BLOCK | OPERATOR_SECTION | OPERATOR_TASK | OPERATOR_TASK_TODO
		| OPERATOR_TASK_DONE => nested(argument, &[Field::Content]),
		_ => None,
	}
}

fn requirement(node: &Node, fields: &[Field], folders: &[String]) -> Option<Requirement> {
	match node {
		Node::And { children } => combine(
			children
				.iter()
				.filter_map(|child| requirement(child, fields, folders))
				.collect(),
			Requirement::And,
		),
		Node::Or { children } => {
			let parts: Option<Vec<Requirement>> = children
				.iter()
				.map(|child| requirement(child, fields, folders))
				.collect();

			parts.and_then(|parts| combine(parts, Requirement::Or))
		}
		Node::Text { value, .. } => text_requirement(value, fields, folders),
		Node::Filter { name, argument } => {
			filter_requirement(name, argument.as_deref(), fields, folders)
		}
		_ => None,
	}
}

pub fn requirement_of(query: &Node, folders: &[String]) -> Option<Requirement> {
	requirement(query, &ALL_FIELDS, folders)
}

fn escape_like(value: &str) -> String {
	let mut escaped = String::with_capacity(value.len());

	for character in value.chars() {
		if sql::LIKE_WILDCARDS.contains(&character) {
			escaped.push(sql::LIKE_ESCAPE);
		}

		escaped.push(character);
	}

	escaped
}

fn quote(term: &str) -> String {
	format!(
		"{}{}{}",
		sql::QUOTE,
		term.replace(sql::QUOTE, sql::ESCAPED_QUOTE),
		sql::QUOTE
	)
}

fn to_match(node: &Requirement) -> Option<String> {
	match node {
		Requirement::Fts { columns, term } => Some(format!(
			"{{{}}} : {}",
			columns.join(sql::FTS_COLUMN_SEPARATOR),
			quote(term)
		)),
		Requirement::Tag(_) => None,
		Requirement::And(children) | Requirement::Or(children) => {
			let parts: Option<Vec<String>> = children.iter().map(to_match).collect();
			let joiner = if matches!(node, Requirement::And(_)) {
				sql::MATCH_AND
			} else {
				sql::MATCH_OR
			};

			parts.map(|parts| format!("({})", parts.join(joiner)))
		}
	}
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MatchIds {
	pub sql: String,
	pub params: Vec<String>,
}

fn build_ids(node: &Requirement, params: &mut Vec<String>) -> String {
	if let Some(found) = to_match(node) {
		params.push(found);

		return sql::FTS_LEAF.to_string();
	}

	match node {
		Requirement::Tag(name) => {
			params.push(name.clone());
			params.push(format!("{}{}", escape_like(name), sql::TAG_CHILD_SUFFIX));

			sql::TAG_LEAF.to_string()
		}
		Requirement::And(children) | Requirement::Or(children) => {
			let joiner = if matches!(node, Requirement::And(_)) {
				sql::INTERSECT
			} else {
				sql::UNION
			};
			let parts: Vec<String> = children
				.iter()
				.map(|child| build_ids(child, params))
				.collect();

			format!(
				"{}{}{}",
				sql::SELECT_IDS_HEAD,
				parts.join(joiner),
				sql::SELECT_IDS_TAIL
			)
		}
		Requirement::Fts { .. } => unreachable!("an FTS requirement always has a match"),
	}
}

pub fn compile_match_ids(tree: &Requirement) -> MatchIds {
	let mut params = Vec::new();
	let body = build_ids(tree, &mut params);

	MatchIds {
		sql: format!("({body})"),
		params,
	}
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Sort {
	NameAsc,
	NameDesc,
	ModifiedDesc,
	ModifiedAsc,
	CreatedDesc,
	CreatedAsc,
}

fn order_of(sort: Sort) -> Vec<(&'static str, &'static str)> {
	match sort {
		Sort::NameAsc => vec![
			(sql::BY_SORT_KEY, sql::ASCENDING),
			(sql::BY_ID, sql::ASCENDING),
		],
		Sort::NameDesc => vec![
			(sql::BY_SORT_KEY, sql::DESCENDING),
			(sql::BY_ID, sql::DESCENDING),
		],
		Sort::ModifiedDesc | Sort::CreatedDesc => vec![
			(sql::BY_MODIFIED, sql::DESCENDING),
			(sql::BY_SORT_KEY, sql::ASCENDING),
			(sql::BY_ID, sql::ASCENDING),
		],
		Sort::ModifiedAsc | Sort::CreatedAsc => vec![
			(sql::BY_MODIFIED, sql::ASCENDING),
			(sql::BY_SORT_KEY, sql::ASCENDING),
			(sql::BY_ID, sql::ASCENDING),
		],
	}
}

pub fn candidates_sql(tree: Option<&Requirement>, folder_ids: &[String], sort: Sort) -> MatchIds {
	let placeholders = vec![sql::PLACEHOLDER; folder_ids.len()].join(sql::PLACEHOLDER_SEPARATOR);
	let mut statement = format!(
		"{}{placeholders}{}",
		sql::CANDIDATES_HEAD,
		sql::CANDIDATES_FOLDERS_TAIL
	);
	let mut params: Vec<String> = folder_ids.to_vec();

	if let Some(tree) = tree {
		let ids = compile_match_ids(tree);

		statement.push_str(sql::CANDIDATES_IDS_HEAD);
		statement.push_str(&ids.sql);
		params.extend(ids.params);
	}

	let order: Vec<String> = order_of(sort)
		.into_iter()
		.map(|(column, direction)| format!("{column}{direction}"))
		.collect();

	statement.push_str(sql::CANDIDATES_ORDER);
	statement.push_str(&order.join(sql::ORDER_SEPARATOR));

	MatchIds {
		sql: statement,
		params,
	}
}
