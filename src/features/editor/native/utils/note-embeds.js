import { extractEmbedSource } from './embed-source'
import { resolveWikiLink } from '@/shared/utils/wiki-links'
import { bodyOf } from '@/shared/utils/note-body-of'

export const loadEmbedNotes = async (
    targets,
    { notes, folderPathByNote, selfPath, loadBodies = async () => undefined }
) => {
    const resolved = targets.map((request) => ({
        request,
        ...resolveWikiLink(request, notes, folderPathByNote, selfPath)
    }))
    const embedded = resolved.filter(({ note }) => note && note.path !== selfPath)
    const bodies = await loadBodies(embedded.map(({ note }) => note))

    return Object.fromEntries(resolved.map(({ request, note, anchor }) => {
        if (!note || note.path === selfPath) return [request, null]

        const text = extractEmbedSource(bodyOf(note, bodies), anchor)

        return [request, text === null ? null : { path: note.path, title: note.title || '', anchor, text }]
    }))
}
