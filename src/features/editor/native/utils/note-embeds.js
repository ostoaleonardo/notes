import { extractEmbedSource } from './embed-source'
import { resolveWikiLink } from '../../../../utils/wiki-links'

export const loadEmbedNotes = (targets, { notes, notePaths, selfPath }) => Object.fromEntries(
    targets.map((target) => {
        const { note, anchor } = resolveWikiLink(target, notes, notePaths, selfPath)
        if (!note || note.path === selfPath) return [target, null]

        const text = extractEmbedSource(note.note || '', anchor)

        return [target, text === null ? null : { path: note.path, title: note.title || '', anchor, text }]
    })
)
