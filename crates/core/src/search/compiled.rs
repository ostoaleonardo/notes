use super::constants::{
	COMPARE_GREATER, COMPARE_GREATER_OR_EQUAL, COMPARE_LESS, HAS_IMAGES, IS_PINNED, OPERATOR_BLOCK,
	OPERATOR_CONTENT, OPERATOR_FILE, OPERATOR_HAS, OPERATOR_IGNORE_CASE, OPERATOR_IS,
	OPERATOR_LINE, OPERATOR_MATCH_CASE, OPERATOR_PATH, OPERATOR_SECTION, OPERATOR_TAG,
	OPERATOR_TASK_DONE, OPERATOR_TASK_TODO, TAG_HASH_PREFIX,
};
use super::pattern::{TextPattern, compile_pattern};
use super::query::Node;
use super::regex_js;
use crate::error::Result;
use regex::Regex;

pub struct Words {
	pub sensitive: Regex,
	pub insensitive: Regex,
}

pub struct TextMatcher {
	pub value: String,
	pub lower: String,
	pub words: Option<Words>,
}

pub struct RegexMatcher {
	pub sensitive: Box<dyn TextPattern>,
	pub insensitive: Box<dyn TextPattern>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Comparison {
	Greater,
	GreaterOrEqual,
	Less,
	LessOrEqual,
}

pub enum Kind {
	File,
	Path,
	Content,
	MatchCase,
	IgnoreCase,
	Tag(String),
	Pinned(bool),
	HasImages(bool),
	Line,
	Block,
	Section,
	TaskTodo,
	TaskDone,
	Task,
}

pub struct Filter {
	pub kind: Kind,
	pub argument: Option<Box<Compiled>>,
}

pub struct Property {
	pub key: String,
	pub expression: Option<Box<Compiled>>,
	pub is_null: bool,
}

pub enum Compiled {
	And(Vec<Compiled>),
	Or(Vec<Compiled>),
	Not(Box<Compiled>),
	Text(TextMatcher),
	Regex(RegexMatcher),
	Filter(Filter),
	Property(Property),
	Compare {
		comparison: Comparison,
		value: String,
		number: Option<f64>,
	},
	Null,
}

fn word_regex(value: &str, insensitive: bool) -> Result<Regex> {
	regex_js::compile(&regex::escape(value), insensitive)
}

fn comparison_of(operator: &str) -> Comparison {
	match operator {
		COMPARE_GREATER => Comparison::Greater,
		COMPARE_GREATER_OR_EQUAL => Comparison::GreaterOrEqual,
		COMPARE_LESS => Comparison::Less,
		_ => Comparison::LessOrEqual,
	}
}

fn argument_value(argument: &Option<Box<Node>>) -> Option<&str> {
	match argument.as_deref() {
		Some(Node::Text { value, .. }) => Some(value),
		_ => None,
	}
}

fn kind_of(name: &str, argument: &Option<Box<Node>>) -> Kind {
	match name {
		OPERATOR_FILE => Kind::File,
		OPERATOR_PATH => Kind::Path,
		OPERATOR_CONTENT => Kind::Content,
		OPERATOR_MATCH_CASE => Kind::MatchCase,
		OPERATOR_IGNORE_CASE => Kind::IgnoreCase,
		OPERATOR_TAG => {
			let lower = argument_value(argument).unwrap_or_default().to_lowercase();

			Kind::Tag(
				lower
					.strip_prefix(TAG_HASH_PREFIX)
					.unwrap_or(&lower)
					.to_string(),
			)
		}
		OPERATOR_IS => Kind::Pinned(argument_value(argument) == Some(IS_PINNED)),
		OPERATOR_HAS => Kind::HasImages(argument_value(argument) == Some(HAS_IMAGES)),
		OPERATOR_LINE => Kind::Line,
		OPERATOR_BLOCK => Kind::Block,
		OPERATOR_SECTION => Kind::Section,
		OPERATOR_TASK_TODO => Kind::TaskTodo,
		OPERATOR_TASK_DONE => Kind::TaskDone,
		_ => Kind::Task,
	}
}

fn compile_all(nodes: &[Node]) -> Result<Vec<Compiled>> {
	nodes.iter().map(compile).collect()
}

fn compile_optional(node: &Option<Box<Node>>) -> Result<Option<Box<Compiled>>> {
	node.as_deref()
		.map(|inner| compile(inner).map(Box::new))
		.transpose()
}

pub fn compile(node: &Node) -> Result<Compiled> {
	Ok(match node {
		Node::And { children } => Compiled::And(compile_all(children)?),
		Node::Or { children } => Compiled::Or(compile_all(children)?),
		Node::Not { child } => Compiled::Not(Box::new(compile(child)?)),
		Node::Text { value, phrase } => Compiled::Text(TextMatcher {
			value: value.clone(),
			lower: value.to_lowercase(),
			words: if *phrase {
				Some(Words {
					sensitive: word_regex(value, false)?,
					insensitive: word_regex(value, true)?,
				})
			} else {
				None
			},
		}),
		Node::Regex { pattern } => Compiled::Regex(RegexMatcher {
			sensitive: compile_pattern(pattern, false)?,
			insensitive: compile_pattern(pattern, true)?,
		}),
		Node::Filter { name, argument } => Compiled::Filter(Filter {
			kind: kind_of(name, argument),
			argument: compile_optional(argument)?,
		}),
		Node::Property { key, expression } => {
			let is_null = matches!(
				expression.as_deref(),
				Some(Node::And { children }) if matches!(children.as_slice(), [Node::Null])
			);

			Compiled::Property(Property {
				key: key.clone(),
				expression: compile_optional(expression)?,
				is_null,
			})
		}
		Node::Compare { operator, value } => Compiled::Compare {
			comparison: comparison_of(operator),
			value: value.clone(),
			number: super::js::js_number(value),
		},
		Node::Null => Compiled::Null,
	})
}
