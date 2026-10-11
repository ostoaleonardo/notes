import { findOutgoingLinks } from '@/utils/outgoing-links'

export const buildLinkGraph = (notes, notePaths) => {
    const incoming = new Set()
    const outgoing = new Set()
    const unresolved = new Map()

    notes.forEach((note) => {
        findOutgoingLinks(note.note, note.path, notes, notePaths).forEach((link) => {
            if (link.path) {
                outgoing.add(note.path)
                incoming.add(link.path)
                return
            }

            const entry = unresolved.get(link.key) || { id: link.key, title: link.title, sources: new Set() }
            entry.sources.add(note.path)
            unresolved.set(link.key, entry)
        })
    })

    return { incoming, outgoing, unresolved }
}

const byTitle = (a, b) => a.title.localeCompare(b.title)

export const findOrphanNotes = (notes, graph) => notes
    .filter((note) => !graph.incoming.has(note.path) && !graph.outgoing.has(note.path))
    .sort(byTitle)

export const listUnresolvedLinks = (graph) => [...graph.unresolved.values()]
    .map(({ id, title, sources }) => ({ id, title, count: sources.size }))
    .sort(byTitle)
