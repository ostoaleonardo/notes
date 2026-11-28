use engine::links::{Candidate, FolderPathByNote, LinkNote, NoteIndex, find_backlinks};
use std::time::Instant;

#[test]
#[ignore]
fn times_backlink_verification_over_five_thousand_notes() {
	let notes: Vec<LinkNote> = (0..5000)
		.map(|number| LinkNote {
			path: format!("r::Stress {number}.md"),
			title: format!("Stress {number}"),
			aliases: Vec::new(),
		})
		.collect();

	let bodies: Vec<String> = (0..5000)
		.map(|number| {
			(1..=12)
				.map(|step| format!("[[Stress {}]]", (number * 7 + step * 131) % 5000))
				.collect::<Vec<_>>()
				.join(" ")
		})
		.collect();

	let folders: FolderPathByNote = FolderPathByNote::new();
	let candidates: Vec<Candidate<'_>> = notes
		.iter()
		.zip(&bodies)
		.map(|(note, body)| Candidate {
			path: &note.path,
			body,
		})
		.collect();

	let start = Instant::now();
	let index = NoteIndex::new(&notes);
	let built = start.elapsed();

	let start = Instant::now();
	let found = find_backlinks("r::Stress 42.md", &index, &folders, &candidates);
	let verified = start.elapsed();

	println!("index {built:?} verify {verified:?} found {}", found.len());

	let start = Instant::now();
	let mut matches = 0;
	for body in &bodies {
		matches += body.matches("[[").count();
	}
	println!("substring scan {:?} {matches}", start.elapsed());

	let start = Instant::now();
	let mut hits = 0;
	for note in &notes {
		hits += usize::from(index.locate(&note.title, &folders).is_some());
	}
	println!("5000 locates {:?} {hits}", start.elapsed());
}
