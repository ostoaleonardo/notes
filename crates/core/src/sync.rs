use crate::engine::Engine;
use crate::error::Result;
use crate::model::{NoteInput, ScannedFile, SourceFile, SyncStats};
use crate::source::NoteSource;
use crate::source::constants::{INDEX_BATCH_SIZE, PIPELINE_DEPTH};
use std::sync::mpsc;
use std::thread;
use std::time::Instant;

type Batch<'a> = (&'a [&'a SourceFile], Vec<Option<String>>, u64);

impl Engine {
	pub fn sync(
		&self,
		repository_id: &str,
		source: &dyn NoteSource,
		progress: &(dyn Fn(u32, u32) + Sync),
	) -> Result<SyncStats> {
		let scan_start = Instant::now();
		let scanned = source.scan()?;
		let known: Vec<ScannedFile> = scanned.iter().map(ScannedFile::from).collect();
		let plan = self.plan(repository_id, &known)?;
		let changed: Vec<&SourceFile> = plan
			.changed
			.iter()
			.map(|&position| &scanned[position as usize])
			.collect();
		let scan_ms = elapsed_ms(scan_start);

		if !plan.removed.is_empty() {
			self.remove(repository_id, &plan.removed)?;
		}

		let total = changed.len() as u32;
		let mut stats = SyncStats {
			total: plan.unchanged + plan.added + plan.updated,
			added: plan.added,
			updated: plan.updated,
			removed: plan.removed.len() as u32,
			unchanged: plan.unchanged,
			scan_ms,
			..SyncStats::default()
		};

		progress(0, total);

		let (sender, receiver) = mpsc::sync_channel::<Result<Batch>>(PIPELINE_DEPTH);

		let pending = changed.as_slice();

		thread::scope(|scope| -> Result<()> {
			scope.spawn(move || {
				for batch in pending.chunks(INDEX_BATCH_SIZE) {
					let read_start = Instant::now();
					let message = source
						.read(batch)
						.map(|texts| (batch, texts, elapsed_ms(read_start)));
					let failed = message.is_err();

					if sender.send(message).is_err() || failed {
						break;
					}
				}
			});

			let mut done = 0;

			for message in receiver {
				let (batch, texts, read_ms) = message?;
				let inputs: Vec<NoteInput> = batch
					.iter()
					.zip(texts)
					.filter_map(|(file, text)| text.map(|text| NoteInput::from_file(file, text)))
					.collect();

				stats.unreadable += (batch.len() - inputs.len()) as u32;
				stats.read_ms += read_ms;

				let report = self.write(repository_id, inputs)?;

				stats.parse_ms += report.parse_ms;
				stats.write_ms += report.write_ms;
				done += batch.len() as u32;
				progress(done, total);
			}

			Ok(())
		})?;

		Ok(stats)
	}
}

fn elapsed_ms(start: Instant) -> u64 {
	start.elapsed().as_millis() as u64
}
