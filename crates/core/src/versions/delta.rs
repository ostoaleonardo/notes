use super::constants::{LINE_SEPARATOR, MAX_DIFF_CELLS};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Hunk {
	pub at: usize,
	pub remove: usize,
	pub insert: Vec<String>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Op {
	Keep,
	Remove,
	Add,
}

fn shared_prefix(a: &[&str], b: &[&str]) -> usize {
	a.iter()
		.zip(b)
		.take_while(|(left, right)| left == right)
		.count()
}

fn shared_suffix(a: &[&str], b: &[&str], prefix: usize) -> usize {
	a[prefix..]
		.iter()
		.rev()
		.zip(b[prefix..].iter().rev())
		.take_while(|(left, right)| left == right)
		.count()
}

fn diff_ops(old: &[&str], new: &[&str]) -> Vec<Op> {
	let (m, n) = (old.len(), new.len());
	let width = n + 1;
	let mut lcs = vec![0u32; (m + 1) * width];

	for i in (0..m).rev() {
		for j in (0..n).rev() {
			lcs[i * width + j] = if old[i] == new[j] {
				lcs[(i + 1) * width + j + 1] + 1
			} else {
				lcs[(i + 1) * width + j].max(lcs[i * width + j + 1])
			};
		}
	}

	let mut ops = Vec::with_capacity(m + n);
	let (mut i, mut j) = (0, 0);

	while i < m && j < n {
		if old[i] == new[j] {
			ops.push(Op::Keep);
			i += 1;
			j += 1;
		} else if lcs[(i + 1) * width + j] >= lcs[i * width + j + 1] {
			ops.push(Op::Remove);
			i += 1;
		} else {
			ops.push(Op::Add);
			j += 1;
		}
	}

	ops.extend(std::iter::repeat_n(Op::Remove, m - i));
	ops.extend(std::iter::repeat_n(Op::Add, n - j));

	ops
}

pub fn build_line_delta(from: &str, to: &str) -> Vec<Hunk> {
	let a: Vec<&str> = from.split(LINE_SEPARATOR).collect();
	let b: Vec<&str> = to.split(LINE_SEPARATOR).collect();
	let prefix = shared_prefix(&a, &b);
	let suffix = shared_suffix(&a, &b, prefix);
	let middle_a = &a[prefix..a.len() - suffix];
	let middle_b = &b[prefix..b.len() - suffix];

	if middle_a.is_empty() && middle_b.is_empty() {
		return Vec::new();
	}

	if middle_a.len() * middle_b.len() > MAX_DIFF_CELLS {
		return vec![Hunk {
			at: prefix,
			remove: middle_a.len(),
			insert: middle_b.iter().map(|line| line.to_string()).collect(),
		}];
	}

	let mut hunks: Vec<Hunk> = Vec::new();
	let mut position = prefix;
	let mut next_new = 0;
	let mut open = false;

	for op in diff_ops(middle_a, middle_b) {
		match op {
			Op::Keep => {
				open = false;
				position += 1;
				next_new += 1;
			}
			Op::Remove | Op::Add => {
				if !open {
					hunks.push(Hunk {
						at: position,
						remove: 0,
						insert: Vec::new(),
					});
					open = true;
				}

				let hunk = hunks.last_mut().expect("an open hunk");

				if op == Op::Remove {
					hunk.remove += 1;
					position += 1;
				} else {
					hunk.insert.push(middle_b[next_new].to_string());
					next_new += 1;
				}
			}
		}
	}

	hunks
}

pub fn apply_line_delta(text: &str, delta: &[Hunk]) -> String {
	let lines: Vec<&str> = text.split(LINE_SEPARATOR).collect();
	let mut output: Vec<&str> = Vec::with_capacity(lines.len());
	let mut position = 0;

	for hunk in delta {
		let at = hunk.at.min(lines.len());

		output.extend(&lines[position.min(at)..at]);
		output.extend(hunk.insert.iter().map(String::as_str));
		position = hunk.at + hunk.remove;
	}

	output.extend(&lines[position.min(lines.len())..]);

	output.join(&LINE_SEPARATOR.to_string())
}
