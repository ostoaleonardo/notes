import { renameHeadingLinks } from '@/shared/utils/headings'
import { linkIndex } from '@/shared/utils/link-index'
import { noteBodies } from '@/shared/utils/note-body'
import { planMovedNoteLinks, planWikiLinkRename, writeChangedNotes } from '@/shared/utils/note-operations'

export const createLinkPropagation = ({ latest, setNotes, fileStorage }) => {
    const applyLinkRewrite = async ({ renameNote, changedNotes }) => {
        const originals = new Map(latest().notes.map((note) => [note.path, note]))

        setNotes((prev) => prev.map(renameNote))

        const { failed, saved } = await writeChangedNotes(changedNotes, latest().folders, fileStorage)

        setNotes((prev) => prev.map((note) => {
            if (failed.includes(note.path)) return originals.get(note.path)

            return saved.has(note.path) ? { ...note, ...saved.get(note.path) } : note
        }))
    }

    const loadLinkingBodies = async (targetPath, notes, folderPathByNote) => {
        const target = notes.find((note) => note.path === targetPath)
        const linking = target
            ? await linkIndex.findBacklinks(target, notes, folderPathByNote)
            : notes

        return noteBodies.load(linking)
    }

    const propagateWikiLinkRename = async (targetPath, newTitle, notes, folderPathByNote) => (
        applyLinkRewrite(await planWikiLinkRename({
            targetPath,
            newTitle,
            notes,
            folderPathByNote,
            currentNotes: latest().notes,
            bodies: await loadLinkingBodies(targetPath, notes, folderPathByNote)
        }))
    )

    const propagateHeadingRename = async (targetPath, renames, notes, folderPathByNote) => (
        applyLinkRewrite(await planWikiLinkRename({
            targetPath,
            notes,
            folderPathByNote,
            currentNotes: latest().notes,
            bodies: await loadLinkingBodies(targetPath, notes, folderPathByNote),
            rewriteBodies: async (texts) => texts.map((content) => (
                renameHeadingLinks(content, targetPath, renames, notes, folderPathByNote)
            ))
        }))
    )

    const propagateNoteMove = async (note, destinationId) => {
        const { notes, folderPathByNote, folders } = latest()

        return applyLinkRewrite(await planMovedNoteLinks({
            note,
            destinationId,
            notes,
            folderPathByNote,
            folders,
            currentNotes: notes,
            bodies: await loadLinkingBodies(note.path, notes, folderPathByNote)
        }))
    }

    return { propagateWikiLinkRename, propagateHeadingRename, propagateNoteMove }
}
