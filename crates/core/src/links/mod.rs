mod constants;
mod index;
mod rename;

pub use index::{FolderPaths, LinkNote, NoteIndex, Resolution, parse_link_text};
pub use rename::rename_links;
