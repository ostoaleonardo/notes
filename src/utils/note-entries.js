import { findAllBlocks, getBlockPreview } from '@/utils/block-refs'
import { getAliases, resolveWikiLinkTarget } from '@/utils/wiki-links'

const blocksByPath = new Map()
const resolverInputsByEntries = new WeakMap()

const areEntriesEqual = (a, b) => (
    a.id === b.id &&
    a.title === b.title &&
    a.path === b.path &&
    a.aliases.length === b.aliases.length &&
    a.aliases.every((alias, index) => alias === b.aliases[index])
)

export const getNoteBlocks = (note) => {
    const body = note.note || ''
    const cached = blocksByPath.get(note.path)
    if (cached?.body === body) return cached

    const { labeled, unlabeled } = findAllBlocks(body)
    const blocks = {
        body,
        labeled: labeled.map(({ id, text }) => ({ id, preview: getBlockPreview(text) })),
        unlabeled: unlabeled.map(({ text }) => ({ preview: getBlockPreview(text) }))
    }
    blocksByPath.set(note.path, blocks)
    return blocks
}

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

export const getEntryResolverInputs = (entries) => {
    if (!resolverInputsByEntries.has(entries)) {
        resolverInputsByEntries.set(entries, {
            notes: entries.map(({ id, title, aliases }) => ({ path: id, title, properties: { aliases } })),
            notePaths: new Map(entries.map(({ id, path }) => [id, path]))
        })
    }

    return resolverInputsByEntries.get(entries)
}

export const resolveBlockTarget = (entries, linkTarget) => {
    const { notes, notePaths } = getEntryResolverInputs(entries)

    return resolveWikiLinkTarget(linkTarget, notes, notePaths)?.path || null
}

export const filterBlockSuggestions = (path, blocks, query) => {
    const normalizedQuery = query.toLowerCase()

    const labeled = blocks.labeled.filter(({ id, preview }) => (
        id.toLowerCase().includes(normalizedQuery) || preview.toLowerCase().includes(normalizedQuery)
    ))
    const unlabeled = blocks.unlabeled
        .map(({ preview }, index) => ({ preview, index, path }))
        .filter(({ preview }) => preview.toLowerCase().includes(normalizedQuery))

    return [...labeled, ...unlabeled]
}
