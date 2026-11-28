import { getUniqueFilename, isTitleTaken } from '@/shared/utils/note-filename'
import { logError } from '@/shared/utils/log-error'
import { buildNotePath, buildFolderPaths } from '@/shared/utils/note-path'
import { composeNoteFile, decomposeNoteFile } from '@/shared/utils/note-file-content'
import { commitNoteVersion } from '@/shared/utils/note-versions'
import { planExternalSync, toSyncShape } from '@/shared/utils/external-note-sync'
import { renameLinksInBodies } from '@/shared/utils/link-rewrite'
import { noteBodies } from '@/shared/utils/note-body'
import { bodyOf } from '@/shared/utils/note-body-of'
import { buildVersionKey, getVersionLocation } from '@/shared/utils/note-version-location'

import { DUPLICATE_TITLE_ERROR, MOVE_STATUS } from '@/shared/constants/note-errors'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export const getFolderUri = (folders, folderId) => (
    folders.find((folder) => folder.id === folderId)?.uri
)

export const buildFileContent = (note, body = note.note) => composeNoteFile(note, body)

const noteNamesIn = (fileStorage, uri) => (
    fileStorage.listMarkdownFiles(uri).map((entry) => entry.name)
)

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

    const filename = getUniqueFilename(noteNamesIn(fileStorage, uri), note.title, null)
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

    const names = noteNamesIn(fileStorage, uri)

    if (note.title !== previous.title && isTitleTaken(names, note.title, previous.filename)) {
        const error = new Error('A note with this title already exists')
        error.code = DUPLICATE_TITLE_ERROR
        throw error
    }

    const filename = getUniqueFilename(names, note.title, previous.filename)

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

const getHistoryMove = (folders, folderId, from, to) => {
    const { rootUri, folderPath } = getVersionLocation(folders, folderId)

    return {
        rootUri,
        fromKey: buildVersionKey(folderPath, from),
        toKey: buildVersionKey(folderPath, to)
    }
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
            content,
            history: getHistoryMove(folders, note.folderId, previous.filename, filename)
        })
        : await fileStorage.saveNoteFile({
            folderId: note.folderId,
            directoryUri: uri,
            filename,
            content,
            expectedModified: existing.lastModified
        })

    return { ...saved, createdAt: previous.createdAt, merged }
}

export const planWikiLinkRename = async ({
    targetPath,
    newTitle,
    notes,
    notePaths,
    currentNotes = notes,
    rewriteBodies = (texts) => renameLinksInBodies({ notes, notePaths, targetPath, newTitle, bodies: texts }),
    bodies
}) => {
    const candidates = currentNotes.filter((note) => (
        note.path !== targetPath && (!bodies || bodies.has(note.path))
    ))
    const originals = candidates.map((note) => bodyOf(note, bodies))
    const rewritten = candidates.length ? await rewriteBodies(originals) : []
    const renamed = new Map()

    candidates.forEach((note, index) => {
        if (rewritten[index] !== originals[index]) renamed.set(note.path, rewritten[index])
    })

    const renameNote = (note) => (
        renamed.has(note.path) ? { ...note, note: renamed.get(note.path) } : note
    )

    return {
        renameNote,
        changedNotes: candidates.filter((note) => renamed.has(note.path)).map(renameNote)
    }
}

const groupByFolder = (notes) => {
    const groups = new Map()

    notes.forEach((note) => {
        if (groups.has(note.folderId)) groups.get(note.folderId).push(note)
        else groups.set(note.folderId, [note])
    })

    return groups
}

const saveFolderGroup = async ({ folderId, uri, notes }, fileStorage) => {
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

    for (const [folderId, notes] of groupByFolder(changedNotes)) {
        const uri = getFolderUri(folders, folderId)
        if (!uri) continue

        const stamps = await saveFolderGroup({ folderId, uri, notes }, fileStorage)

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

    const moved = await fileStorage.moveNote({
        rootUri: to.rootUri,
        filename: note.filename,
        from: { folderId: note.folderId, path: from.folderPath },
        to: { folderId: destinationId, path: to.folderPath, uri: destinationUri }
    })

    if (moved.status === MOVE_STATUS.TARGET_EXISTS) {
        const error = new Error('A note with this title already exists in that folder')
        error.code = DUPLICATE_TITLE_ERROR
        throw error
    }

    if (moved.status !== MOVE_STATUS.MOVED) throw new Error('The note no longer exists')

    return {
        folderId: destinationId,
        filename: note.filename,
        path: buildNotePath(destinationId, note.filename),
        fileUri: moved.fileUri,
        updatedAt: moved.updatedAt
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
        rewriteBodies: (texts) => renameLinksInBodies({
            notes,
            notePaths: qualifyPaths,
            resolvePaths: notePaths,
            targetPath: note.path,
            newTitle: note.title,
            bodies: texts
        })
    })
}
