import { findBlocks } from '@/utils/block-refs'
import { getAliases, resolveWikiLinkTarget } from '@/utils/wiki-links'

import { BLOCK_PREVIEW_MAX_LENGTH } from '@/constants/block-refs'

const blocksByPath = new Map()
const resolverInputsByEntries = new WeakMap()

const areBlocksEqual = (a, b) => (
    a.length === b.length &&
    a.every((block, index) => block.id === b[index].id && block.preview === b[index].preview)
)

const areEntriesEqual = (a, b) => (
    a.id === b.id &&
    a.title === b.title &&
    a.path === b.path &&
    a.aliases.length === b.aliases.length &&
    a.aliases.every((alias, index) => alias === b.aliases[index]) &&
    areBlocksEqual(a.blocks, b.blocks)
)

const toPreview = (text) => text.split('\n')[0].trim().slice(0, BLOCK_PREVIEW_MAX_LENGTH)

const getBlocks = (note) => {
    const body = note.note || ''
    const cached = blocksByPath.get(note.path)
    if (cached?.body === body) return cached.blocks

    const blocks = findBlocks(body).map(({ id, text }) => ({ id, preview: toPreview(text) }))
    blocksByPath.set(note.path, { body, blocks })
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
            path: notePaths.get(note.path) || '',
            blocks: getBlocks(note)
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

export const getBlockSuggestions = (entries, linkTarget, query) => {
    const { notes, notePaths } = getEntryResolverInputs(entries)
    const note = resolveWikiLinkTarget(linkTarget, notes, notePaths)
    if (!note) return []

    const normalizedQuery = query.toLowerCase()
    const entry = entries.find(({ id }) => id === note.path)

    return (entry?.blocks || []).filter(({ id, preview }) => (
        id.toLowerCase().includes(normalizedQuery) || preview.toLowerCase().includes(normalizedQuery)
    ))
}
