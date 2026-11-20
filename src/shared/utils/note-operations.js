import { getUniqueFilenameBy, isTitleTakenBy } from '@/shared/utils/note-filename'
import { logError } from '@/shared/utils/log-error'
import { buildNotePath, buildFolderPaths } from '@/shared/utils/note-path'
import { composeNoteFile, decomposeNoteFile } from '@/shared/utils/note-file-content'
import { commitNoteVersion } from '@/shared/utils/note-versions'
import { planExternalSync, toSyncShape } from '@/shared/utils/external-note-sync'
import { renameWikiLinksForNote } from '@/shared/utils/wiki-links'
import { noteBodies } from '@/shared/utils/note-body'
import { bodyOf } from '@/shared/utils/note-body-of'
import { buildVersionKey, getVersionLocation } from '@/shared/utils/note-version-location'

import { DUPLICATE_TITLE_ERROR } from '@/shared/constants/note-errors'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export const getFolderUri = (folders, folderId) => (
    folders.find((folder) => folder.id === folderId)?.uri
)

export const buildFileContent = (note, body = note.note) => composeNoteFile(note, body)

const nameExistsIn = (fileStorage, uri) => (name) => fileStorage.fileExists(uri, name)

export const withOptimisticUpdate = async (setNotes, { apply, rollback }, persist) => {
    setNotes(apply)

    try {
        return await persist()
    } catch (error) {
        setNotes(rollback)
        throw error
    }
}

export const createNote = async ({ note, folderId, uri }, fileStorage) => {
    if (!uri) {
        return {
            record: { ...note, folderId, filename: '', path: '' },
            result: { path: '', filename: '' }
        }
    }

    const filename = getUniqueFilenameBy(nameExistsIn(fileStorage, uri), note.title, null)
    const path = buildNotePath(folderId, filename)
    const saved = await fileStorage.saveNoteFile({
        folderId,
        directoryUri: uri,
        filename,
        content: buildFileContent(note)
    })
    const times = { fileUri: saved.fileUri, createdAt: saved.updatedAt, updatedAt: saved.updatedAt }

    return {
        record: { ...note, folderId, filename, path, ...times },
        result: { path, filename, ...times }
    }
}

const planInPlaceUpdate = (previous, fileStorage) => {
    const existing = fileStorage.getExistingFile(previous.fileUri)
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

    const exists = nameExistsIn(fileStorage, uri)

    if (note.title !== previous.title && isTitleTakenBy(exists, note.title, previous.filename)) {
        const error = new Error('A note with this title already exists')
        error.code = DUPLICATE_TITLE_ERROR
        throw error
    }

    const filename = getUniqueFilenameBy(exists, note.title, previous.filename)

    return {
        filename,
        path: buildNotePath(note.folderId, filename),
        renamed: filename !== previous.filename,
        existing: fileStorage.findFile(uri, previous.filename)
    }
}

const readDiskNote = async (existing) => {
    const { body, ...fields } = decomposeNoteFile(await existing.text())
    return toSyncShape({ note: body, ...fields })
}

const keepExternalText = async ({ previous, text, folders, folderId }, fileStorage) => {
    try {
        const location = getVersionLocation(folders, folderId)
        await commitNoteVersion(fileStorage, location, previous.filename, previous.title, text)
    } catch (error) {
        logError(LOG_MESSAGES.KEEPING_EXTERNAL_TEXT_OF(previous.filename), error)
    }
}

const mergeExternalEdits = async ({ note, previous, existing, folders }, fileStorage) => {
    if (!existing || existing.lastModified === previous.updatedAt) return null

    const incoming = await readDiskNote(existing)
    const base = noteBodies.peek(previous)

    if (base === undefined) {
        await keepExternalText(
            { previous, text: incoming.note, folders, folderId: note.folderId },
            fileStorage
        )

        return null
    }

    const original = toSyncShape(previous, base)
    const plan = planExternalSync({ draft: toSyncShape(note), original, incoming })
    if (!plan) return null

    if (plan.lostExternalText) {
        await keepExternalText(
            { previous, text: incoming.note, folders, folderId: note.folderId },
            fileStorage
        )
    }

    return plan.draft
}

export const persistNoteUpdate = async ({ note, previous, uri, plan, folders }, fileStorage) => {
    const { filename, renamed, existing } = plan

    const merged = await mergeExternalEdits({ note, previous, existing, folders }, fileStorage)

    const content = buildFileContent({
        ...note,
        ...merged,
        rawFrontmatter: merged ? merged.rawFrontmatter : note.rawFrontmatter ?? previous.rawFrontmatter
    })

    const saved = renamed
        ? await fileStorage.saveRenamedNoteFile({
            folderId: note.folderId,
            directoryUri: uri,
            from: previous.filename,
            to: filename,
            content
        })
        : await fileStorage.saveNoteFile({
            folderId: note.folderId,
            directoryUri: uri,
            filename,
            content,
            expectedModified: existing.lastModified
        })

    if (renamed) {
        const { rootUri, folderPath } = getVersionLocation(folders, note.folderId)

        await fileStorage.renameVersions(
            rootUri,
            buildVersionKey(folderPath, previous.filename),
            buildVersionKey(folderPath, filename)
        )
    }

    return { ...saved, createdAt: previous.createdAt, merged }
}

export const planWikiLinkRename = ({
    targetPath,
    newTitle,
    notes,
    notePaths,
    currentNotes = notes,
    rewrite = (content) => renameWikiLinksForNote(content, targetPath, newTitle, notes, notePaths),
    bodies
}) => {
    const renameNote = (note) => {
        if (note.path === targetPath || (bodies && !bodies.has(note.path))) return note

        const body = bodyOf(note, bodies)
        const renamed = rewrite(body)
        return renamed === body ? note : { ...note, note: renamed }
    }

    const changedNotes = currentNotes
        .map(renameNote)
        .filter((note, index) => note !== currentNotes[index])

    return { renameNote, changedNotes }
}

const groupByRepository = (notes) => {
    const groups = new Map()

    notes.forEach((note) => {
        if (groups.has(note.folderId)) groups.get(note.folderId).push(note)
        else groups.set(note.folderId, [note])
    })

    return groups
}

const saveRepositoryGroup = async ({ folderId, uri, notes }, fileStorage) => {
    try {
        const stamps = await fileStorage.saveNoteFiles({
            folderId,
            directoryUri: uri,
            files: notes.map((note) => ({
                filename: note.filename,
                content: buildFileContent(note),
                expectedModified: note.updatedAt
            }))
        })

        return stamps
    } catch (error) {
        logError(LOG_MESSAGES.WRITING_RENAMED_LINKS_IN(folderId), error)
        return notes.map(() => null)
    }
}

export const writeChangedNotes = async (changedNotes, folders, fileStorage) => {
    const failed = []
    const saved = new Map()

    for (const [folderId, notes] of groupByRepository(changedNotes)) {
        const uri = getFolderUri(folders, folderId)
        if (!uri) continue

        const stamps = await saveRepositoryGroup({ folderId, uri, notes }, fileStorage)

        notes.forEach((note, index) => {
            if (stamps[index]) saved.set(note.path, stamps[index])
            else failed.push(note.path)
        })
    }

    return { failed, saved }
}

export const persistNoteMove = async ({ note, destinationId, folders }, fileStorage) => {
    const sourceUri = getFolderUri(folders, note.folderId)
    const destinationUri = getFolderUri(folders, destinationId)
    const from = getVersionLocation(folders, note.folderId)
    const to = getVersionLocation(folders, destinationId)

    if (!sourceUri || !destinationUri || !from || !to || from.rootUri !== to.rootUri) {
        throw new Error('The note cannot be moved to that folder')
    }

    if (fileStorage.fileExists(destinationUri, note.filename)) {
        const error = new Error('A note with this title already exists in that folder')
        error.code = DUPLICATE_TITLE_ERROR
        throw error
    }

    const saved = await fileStorage.moveNote({
        source: { folderId: note.folderId, uri: sourceUri },
        destination: { folderId: destinationId, uri: destinationUri },
        filename: note.filename
    })

    await fileStorage.renameVersions(
        to.rootUri,
        buildVersionKey(from.folderPath, note.filename),
        buildVersionKey(to.folderPath, note.filename)
    )

    return {
        folderId: destinationId,
        filename: note.filename,
        path: buildNotePath(destinationId, note.filename),
        fileUri: saved.fileUri,
        updatedAt: saved.updatedAt
    }
}

export const planMovedNoteLinks = ({
    note,
    destinationId,
    notes,
    notePaths,
    folders,
    currentNotes,
    bodies
}) => {
    const destinationPath = buildFolderPaths(folders).get(destinationId) || ''
    const qualifyPaths = new Map(notePaths).set(note.path, destinationPath)

    return planWikiLinkRename({
        targetPath: note.path,
        notes,
        notePaths,
        currentNotes,
        bodies,
        rewrite: (content) => renameWikiLinksForNote(content, note.path, note.title, notes, qualifyPaths, notePaths)
    })
}
