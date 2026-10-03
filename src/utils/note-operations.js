import { getUniqueFilename, isTitleTaken } from '@/utils/note-filename'
import { buildNotePath } from '@/utils/note-path'
import { buildNoteFileContent } from '@/utils/frontmatter'
import { renameWikiLinksForNote } from '@/utils/wiki-links'
import { buildVersionKey, getVersionLocation } from '@/utils/note-version-location'

import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'

export const getRepositoryUri = (repositories, repositoryId) => (
    repositories.find((repository) => repository.id === repositoryId)?.uri
)

export const buildFileContent = (note) => buildNoteFileContent(note, note.note)

const listNoteNames = (fileStorage, uri) => fileStorage.listMarkdownFiles(uri).map((file) => file.name)

const readFileTimes = (file) => ({
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

export const planNoteUpdate = ({ note, previous, uri }, fileStorage) => {
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

export const persistNoteUpdate = async ({ note, previous, uri, plan, repositories }, fileStorage) => {
    const { filename, renamed, existing } = plan

    if (renamed) {
        await fileStorage.renameNoteFile(uri, previous.filename, filename)
        const { rootUri, folderPath } = getVersionLocation(repositories, note.repositoryId)

        await fileStorage.renameVersions(
            rootUri,
            buildVersionKey(folderPath, previous.filename),
            buildVersionKey(folderPath, filename)
        )
    }

    return readFileTimes(
        fileStorage.writeNoteFile(
            uri,
            filename,
            buildFileContent(note),
            undefined,
            renamed ? undefined : existing
        )
    )
}

export const planWikiLinkRename = ({ targetPath, newTitle, notes, notePaths }) => {
    const renameNote = (note) => {
        if (note.path === targetPath) return note

        const renamed = renameWikiLinksForNote(note.note, targetPath, newTitle, notes, notePaths)
        return renamed === note.note ? note : { ...note, note: renamed }
    }

    const changedNotes = notes
        .map(renameNote)
        .filter((note, index) => note !== notes[index])

    return { renameNote, changedNotes }
}

export const writeChangedNotes = (changedNotes, repositories, fileStorage) => {
    changedNotes.forEach((note) => {
        const uri = getRepositoryUri(repositories, note.repositoryId)
        if (!uri) return

        fileStorage.writeNoteFile(uri, note.filename, buildFileContent(note))
    })
}
