mod cache;
mod compiled;
mod constants;
mod evaluate;
mod js;
mod patterns;
mod prefilter;
mod query;
mod regex_js;
mod session;
mod sql;
mod warm;

pub use cache::BodyCache;
pub use evaluate::{NoteView, frontmatter_joined};
pub use prefilter::{
	MatchIds, Requirement, Sort, candidates_sql, compile_match_ids, requirement_of,
};
pub use query::Node;
pub use session::{SearchRequest, SearchSession, SearchStep, plan};
pub use warm::{Warmup, statement as warm_statement};

use crate::error::Result;

pub struct Query {
	root: compiled::Compiled,
}

impl Query {
	pub fn compile(node: &Node) -> Result<Self> {
		Ok(Self {
			root: compiled::compile(node)?,
		})
	}

	pub fn matches(&self, note: &NoteView<'_>, match_case: bool) -> bool {
		evaluate::matches(&self.root, note, match_case)
	}
}
