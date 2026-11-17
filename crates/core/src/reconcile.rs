use crate::model::{FileMeta, ReconcilePlan, ScannedFile};
use std::collections::{HashMap, HashSet};

pub fn plan(existing: &HashMap<String, FileMeta>, scanned: &[ScannedFile]) -> ReconcilePlan {
	let mut plan = ReconcilePlan::default();

	for (position, file) in scanned.iter().enumerate() {
		match existing.get(&file.filename) {
			None => {
				plan.added += 1;
				plan.changed.push(position as u32);
			}
			Some(known) if known.modified != file.modified || known.size != file.size => {
				plan.updated += 1;
				plan.changed.push(position as u32);
			}
			Some(_) => {}
		}
	}

	let present: HashSet<&str> = scanned.iter().map(|file| file.filename.as_str()).collect();

	plan.removed = existing
		.keys()
		.filter(|filename| !present.contains(filename.as_str()))
		.cloned()
		.collect();
	plan.unchanged = (scanned.len() - plan.changed.len()) as u32;

	plan
}
