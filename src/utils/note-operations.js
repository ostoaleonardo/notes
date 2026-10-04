import { getUniqueFilename, isTitleTaken } from '@/utils/note-filename'
import { logError } from '@/utils/log-error'
import { buildNotePath } from '@/utils/note-path'
import { buildNoteFileContent, decomposeNoteFileContent } from '@/utils/frontmatter'
import { commitNoteVersion } from '@/utils/note-versions'
import { planExternalSync, toSyncShape } from '@/utils/external-note-sync'
import { renameWikiLinksForNote } from '@/utils/wiki-links'
import { buildVersionKey, getVersionLocation } from '@/utils/note-version-location'

import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'

export const getRepositoryUri = (repositories, repositoryId) => (
    repositories.find((repository) => repository.id === repositoryId)?.uri
)

export const buildFileContent = (note) => buildNoteFileContent(note, note.note)

const listNoteNames = (fileStorage, uri) => fileStorage.listMarkdownFiles(uri).map((file) => file.name)

const readFileTimes = (file) => ({
    fileUri: file.uri,
    createdAt: file.creationTime ?? file.lastModified,
    updatedAt: file.lastModified
})

export const withOptimisticUpdate = async (setNotes, { apply, rollback }, persist) => {
    setNotes(apply)

    try {
        return await persist()
    } catch (error) {
        setNotes(rollback)
        throw error
    }
}

export const createNote = ({ note, repositoryId, uri }, fileStorage) => {
    if (!uri) {
        return {
            record: { ...note, repositoryId, filename: '', path: '' },
            result: { path: '', filename: '' }
        }
    }

    const filename = getUniqueFilename(listNoteNames(fileStorage, uri), note.title, null)
    const path = buildNotePath(repositoryId, filename)
    const times = readFileTimes(
        fileStorage.writeNoteFile(uri, filename, buildFileContent(note), undefined, null)
    )

    return {
        record: { ...note, repositoryId, filename, path, ...times },
        result: { path, filename, ...times }
    }
}

const planInPlaceUpdate = (previous, fileStorage) => {
    const existing = previous.fileUri && fileStorage.getExistingFile(previous.fileUri)
    if (!existing) return null

    return {
        filename: previous.filename,
        path: previous.path,
        renamed: false,
        existing
    }
}

export const planNoteUpdate = ({ note, previous, uri }, fileStorage) => {
    if (note.title === previous.title) {
        const inPlace = planInPlaceUpdate(previous, fileStorage)
        if (inPlace) return inPlace
    }

    const files = fileStorage.listMarkdownFiles(uri)
    const names = files.map((file) => file.name)

    if (note.title !== previous.title && isTitleTaken(names, note.title, previous.filename)) {
        const error = new Error('A note with this title already exists')
        error.code = DUPLICATE_TITLE_ERROR
        throw error
    }

    const filename = getUniqueFilename(names, note.title, previous.filename)

    return {
        filename,
        path: buildNotePath(note.repositoryId, filename),
        renamed: filename !== previous.filename,
        existing: files.find((file) => file.name === previous.filename)
    }
}

const readDiskNote = async (existing) => {
    const { body, ...fields } = decomposeNoteFileContent(await existing.text())
    return toSyncShape({ note: body, ...fields })
}

const keepExternalText = async ({ previous, text, repositories, repositoryId }, fileStorage) => {
    try {
        const location = getVersionLocation(repositories, repositoryId)
        await commitNoteVersion(fileStorage, location, previous.filename, previous.title, text)
    } catch (error) {
        logError(`error keeping external text of ${previous.filename}`, error)
    }
}

const mergeExternalEdits = async ({ note, previous, existing, repositories }, fileStorage) => {
    if (!existing || existing.lastModified === previous.updatedAt) return null

    const incoming = await readDiskNote(existing)
    const plan = planExternalSync({ draft: toSyncShape(note), original: toSyncShape(previous), incoming })
    if (!plan) return null

    if (plan.lostExternalText) {
        await keepExternalText(
            { previous, text: incoming.note, repositories, repositoryId: note.repositoryId },
            fileStorage
        )
    }

    return plan.draft
}

export const persistNoteUpdate = async ({ note, previous, uri, plan, repositories }, fileStorage) => {
    const { filename, renamed, existing } = plan

    const merged = await mergeExternalEdits({ note, previous, existing, repositories }, fileStorage)

    const content = buildFileContent({
        ...note,
        ...merged,
        rawFrontmatter: merged ? merged.rawFrontmatter : note.rawFrontmatter ?? previous.rawFrontmatter
    })

    if (!renamed) {
        return { ...readFileTimes(fileStorage.writeNoteFile(uri, filename, content, undefined, existing)), merged }
    }

    const times = readFileTimes(fileStorage.writeNoteFile(uri, filename, content, undefined, null))
    existing.delete()

    const { rootUri, folderPath } = getVersionLocation(repositories, note.repositoryId)

    await fileStorage.renameVersions(
        rootUri,
        buildVersionKey(folderPath, previous.filename),
        buildVersionKey(folderPath, filename)
    )

    return { ...times, merged }
}

export const planWikiLinkRename = ({
    targetPath,
    newTitle,
    notes,
    notePaths,
    currentNotes = notes,
    rewrite = (content) => renameWikiLinksForNote(content, targetPath, newTitle, notes, notePaths)
}) => {
    const renameNote = (note) => {
        if (note.path === targetPath) return note

        const renamed = rewrite(note.note)
        return renamed === note.note ? note : { ...note, note: renamed }
    }

    const changedNotes = currentNotes
        .map(renameNote)
        .filter((note, index) => note !== currentNotes[index])

    return { renameNote, changedNotes }
}

export const writeChangedNotes = (changedNotes, repositories, fileStorage) => {
    const failed = []

    changedNotes.forEach((note) => {
        const uri = getRepositoryUri(repositories, note.repositoryId)
        if (!uri) return

        try {
            const existing = note.fileUri ? fileStorage.getExistingFile(note.fileUri) : undefined

            if (existing && existing.lastModified !== note.updatedAt) {
                failed.push(note.path)
                return
            }

            fileStorage.writeNoteFile(uri, note.filename, buildFileContent(note), undefined, existing)
        } catch (error) {
            logError(`error writing renamed links in ${note.filename}`, error)
            failed.push(note.path)
        }
    })

    return failed
}
