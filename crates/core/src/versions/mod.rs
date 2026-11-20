mod constants;
mod delta;
mod store;

pub use delta::{Hunk, apply_line_delta, build_line_delta};
pub use store::{NewVersion, commit_version};
