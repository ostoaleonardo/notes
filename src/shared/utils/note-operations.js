import { getUniqueFilenameBy, isTitleTakenBy } from '@/shared/utils/note-filename'
import { logError } from '@/shared/utils/log-error'
import { buildNotePath, buildRepositoryPaths } from '@/shared/utils/note-path'
import { buildNoteFileContent, decomposeNoteFileContent } from '@/shared/utils/frontmatter'
import { commitNoteVersion } from '@/shared/utils/note-versions'
import { planExternalSync, toSyncShape } from '@/shared/utils/external-note-sync'
import { renameWikiLinksForNote } from '@/shared/utils/wiki-links'
import { noteBodies } from '@/shared/utils/note-body'
import { bodyOf } from '@/shared/utils/note-body-of'
import { buildVersionKey, getVersionLocation } from '@/shared/utils/note-version-location'

import { DUPLICATE_TITLE_ERROR } from '@/shared/constants/note-errors'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export const getRepositoryUri = (repositories, repositoryId) => (
    repositories.find((repository) => repository.id === repositoryId)?.uri
)

export const buildFileContent = (note, body = note.note) => buildNoteFileContent(note, body)

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

export const createNote = async ({ note, repositoryId, uri }, fileStorage) => {
    if (!uri) {
        return {
            record: { ...note, repositoryId, filename: '', path: '' },
            result: { path: '', filename: '' }
        }
    }

    const filename = getUniqueFilenameBy(nameExistsIn(fileStorage, uri), note.title, null)
    const path = buildNotePath(repositoryId, filename)
    const saved = await fileStorage.saveNoteFile({
        repositoryId,
        directoryUri: uri,
        filename,
        content: buildFileContent(note)
    })
    const times = { fileUri: saved.fileUri, createdAt: saved.updatedAt, updatedAt: saved.updatedAt }

    return {
        record: { ...note, repositoryId, filename, path, ...times },
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
        path: buildNotePath(note.repositoryId, filename),
        renamed: filename !== previous.filename,
        existing: fileStorage.findFile(uri, previous.filename)
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
        logError(LOG_MESSAGES.KEEPING_EXTERNAL_TEXT_OF(previous.filename), error)
    }
}

const mergeExternalEdits = async ({ note, previous, existing, repositories }, fileStorage) => {
    if (!existing || existing.lastModified === previous.updatedAt) return null

    const incoming = await readDiskNote(existing)
    const base = noteBodies.peek(previous)

    if (base === undefined) {
        await keepExternalText(
            { previous, text: incoming.note, repositories, repositoryId: note.repositoryId },
            fileStorage
        )

        return null
    }

    const original = toSyncShape(previous, base)
    const plan = planExternalSync({ draft: toSyncShape(note), original, incoming })
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

    const saved = renamed
        ? await fileStorage.saveRenamedNoteFile({
            repositoryId: note.repositoryId,
            directoryUri: uri,
            from: previous.filename,
            to: filename,
            content
        })
        : await fileStorage.saveNoteFile({
            repositoryId: note.repositoryId,
            directoryUri: uri,
            filename,
            content,
            expectedModified: existing.lastModified
        })

    if (renamed) {
        const { rootUri, folderPath } = getVersionLocation(repositories, note.repositoryId)

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
        if (groups.has(note.repositoryId)) groups.get(note.repositoryId).push(note)
        else groups.set(note.repositoryId, [note])
    })

    return groups
}

const saveRepositoryGroup = async ({ repositoryId, uri, notes }, fileStorage) => {
    try {
        const stamps = await fileStorage.saveNoteFiles({
            repositoryId,
            directoryUri: uri,
            files: notes.map((note) => ({
                filename: note.filename,
                content: buildFileContent(note),
                expectedModified: note.updatedAt
            }))
        })

        return stamps
    } catch (error) {
        logError(LOG_MESSAGES.WRITING_RENAMED_LINKS_IN(repositoryId), error)
        return notes.map(() => null)
    }
}

export const writeChangedNotes = async (changedNotes, repositories, fileStorage) => {
    const failed = []
    const saved = new Map()

    for (const [repositoryId, notes] of groupByRepository(changedNotes)) {
        const uri = getRepositoryUri(repositories, repositoryId)
        if (!uri) continue

        const stamps = await saveRepositoryGroup({ repositoryId, uri, notes }, fileStorage)

        notes.forEach((note, index) => {
            if (stamps[index]) saved.set(note.path, stamps[index])
            else failed.push(note.path)
        })
    }

    return { failed, saved }
}

export const persistNoteMove = async ({ note, destinationId, repositories }, fileStorage) => {
    const sourceUri = getRepositoryUri(repositories, note.repositoryId)
    const destinationUri = getRepositoryUri(repositories, destinationId)
    const from = getVersionLocation(repositories, note.repositoryId)
    const to = getVersionLocation(repositories, destinationId)

    if (!sourceUri || !destinationUri || !from || !to || from.rootUri !== to.rootUri) {
        throw new Error('The note cannot be moved to that folder')
    }

    if (fileStorage.fileExists(destinationUri, note.filename)) {
        const error = new Error('A note with this title already exists in that folder')
        error.code = DUPLICATE_TITLE_ERROR
        throw error
    }

    const saved = await fileStorage.moveNote({
        source: { repositoryId: note.repositoryId, uri: sourceUri },
        destination: { repositoryId: destinationId, uri: destinationUri },
        filename: note.filename
    })

    await fileStorage.renameVersions(
        to.rootUri,
        buildVersionKey(from.folderPath, note.filename),
        buildVersionKey(to.folderPath, note.filename)
    )

    return {
        repositoryId: destinationId,
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
    repositories,
    currentNotes,
    bodies
}) => {
    const destinationPath = buildRepositoryPaths(repositories).get(destinationId) || ''
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
