import { mergeNoteChanges } from './merge-note-changes'

const sameContent = (a, b) => (a ?? '').trim() === (b ?? '').trim()

const sameList = (a, b) => a.length === b.length && a.every((item, index) => item === b[index])

const matches = (left, right) => (
    sameContent(left.note, right.note) &&
    sameList(left.tags, right.tags) &&
    JSON.stringify(left.properties) === JSON.stringify(right.properties) &&
    left.invalidFrontmatter === right.invalidFrontmatter
)

export const toSyncShape = (note) => ({
    note: note.note,
    tags: note.tags ?? [],
    properties: note.properties ?? {},
    invalidFrontmatter: note.invalidFrontmatter ?? null,
    rawFrontmatter: note.rawFrontmatter ?? null
})

export const planExternalSync = ({ draft, original, incoming }) => {
    if (!incoming || matches(incoming, original)) return null
    if (matches(draft, original)) return { draft: incoming, original: incoming, lostExternalText: false }

    const { merged, lostExternalText } = mergeNoteChanges({ base: original, mine: draft, theirs: incoming })
    return { draft: merged, original: incoming, lostExternalText }
}
