import { getAliases } from '@/utils/wiki-links'

const areEntriesEqual = (a, b) => (
    a.id === b.id &&
    a.title === b.title &&
    a.path === b.path &&
    a.aliases.length === b.aliases.length &&
    a.aliases.every((alias, index) => alias === b.aliases[index])
)

export const areNoteEntriesEqual = (previous, next) => (
    previous.length === next.length &&
    previous.every((entry, index) => areEntriesEqual(entry, next[index]))
)

export const buildNoteEntries = (notes, notePaths) => (
    notes
        .filter((note) => note.title)
        .map((note) => ({
            id: note.path,
            title: note.title,
            aliases: getAliases(note),
            path: notePaths.get(note.path) || ''
        }))
)
