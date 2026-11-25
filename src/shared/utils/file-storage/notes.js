import { Directory, FileMode } from 'expo-file-system'

import { repositoryEngine } from '@/shared/utils/repository-engine'
import { findFile } from './entries'

import { REPOSITORY_TRASH_FOLDER_NAME, WRITE_ATTEMPTS } from '@/shared/constants/file-storage'
import { MIME_TYPES } from '@/shared/constants/mime-types'
import { SAVE_CONFLICT_ERROR, SAVE_STATUS } from '@/shared/constants/note-errors'

const writeVerified = (file, content) => {
    const bytes = new TextEncoder().encode(content)

    for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt++) {
        const handle = file.open(FileMode.Truncate)
        try {
            handle.writeBytesSync(bytes)
        } finally {
            handle.close()
        }

        const size = file.size
        if (size == null || size === bytes.length) return
    }

    throw new Error(`write verification failed for ${file.name}`)
}

export const writeNoteFile = (
    directoryUri,
    filename,
    content,
    mimeType = MIME_TYPES.MARKDOWN,
    existing = findFile(directoryUri, filename)
) => {
    const file = existing || new Directory(directoryUri).createFile(filename, mimeType)
    writeVerified(file, content)
    return file
}

const toSavedFile = (result, filename) => {
    if (result.status === SAVE_STATUS.SAVED) {
        return { fileUri: result.uri, updatedAt: result.modified }
    }

    const error = new Error(`saving ${filename} failed: ${result.status}`)
    error.code = SAVE_CONFLICT_ERROR
    throw error
}

export const saveNoteFile = async ({ folderId, directoryUri, filename, content, expectedModified }) => (
    toSavedFile(
        await repositoryEngine.saveNote(folderId, directoryUri, filename, content, expectedModified),
        filename
    )
)

export const saveNoteFiles = async ({ folderId, directoryUri, files }) => {
    const results = await repositoryEngine.saveNotes(
        folderId,
        directoryUri,
        files.map((file) => file.filename),
        files.map((file) => file.content),
        files.map((file) => file.expectedModified ?? null)
    )

    return results.map((result) => (
        result.status === SAVE_STATUS.SAVED ? { fileUri: result.uri, updatedAt: result.modified } : null
    ))
}

export const saveRenamedNoteFile = async ({ folderId, directoryUri, from, to, content, history }) => (
    toSavedFile(
        await repositoryEngine.renameNote(
            folderId,
            directoryUri,
            from,
            to,
            content,
            history.rootUri,
            history.fromKey,
            history.toKey
        ),
        to
    )
)

export const renameNoteFile = async (directoryUri, oldFilename, newFilename) => {
    const file = findFile(directoryUri, oldFilename)
    if (!file) return

    const content = await file.text()
    writeNoteFile(directoryUri, newFilename, content)
    file.delete()
}

export const deleteNoteFile = (directoryUri, filename) => {
    const file = findFile(directoryUri, filename)
    if (file) file.delete()
}

export const trashNote = ({ rootUri, folderId, folderPath, filename }) => (
    repositoryEngine.trashNote(rootUri, folderId, folderPath, filename, REPOSITORY_TRASH_FOLDER_NAME)
)

export const moveNote = async ({ rootUri, filename, from, to }) => {
    const moved = await repositoryEngine.moveNote(
        rootUri,
        filename,
        from.folderId,
        from.path,
        to.folderId,
        to.path,
        to.uri
    )

    return { status: moved.status, fileUri: moved.uri, updatedAt: moved.modified }
}
