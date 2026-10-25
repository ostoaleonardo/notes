import { findFileByTarget } from '@/utils/attachments'
import { isFileLinkTarget } from '@/utils/file-links'
import { stripNoteExtension } from '@/utils/note-filename'
import { findOutgoingLinks } from '@/utils/outgoing-links'
import { mapOutsideCode } from '@/utils/outside-code'

import {
    CONNECTION_LIMITS,
    CONNECTION_SECTIONS,
    CONNECTION_TYPES,
    FOLDER_SEPARATOR,
    ROOT_ENTITY_ID
} from '@/constants/connections'
import { WIKI_LINK_ANCHOR_SEPARATOR, WIKI_LINK_PATTERN } from '@/constants/wiki-links'

const { ROOT, NOTE, FOLDER, FILE, TAG, MISSING } = CONNECTION_TYPES
const { LINKS_OUT, LINKS_IN, TAGS, FILES, NOTES, FOLDERS, RELATED_TAGS } = CONNECTION_SECTIONS

export const makeEntity = (type, id) => ({ type, id })

export const entityKey = (entity) => `${entity.type}:${entity.id}`

export const parseEntityKey = (key) => {
    const index = key.indexOf(':')

    return index < 0 ? null : makeEntity(key.slice(0, index), key.slice(index + 1))
}

export const ROOT_ENTITY = makeEntity(ROOT, ROOT_ENTITY_ID)

export const splitFolder = (folder) => folder.split(FOLDER_SEPARATOR).filter(Boolean)

const pushTo = (map, key, value) => {
    const list = map.get(key)

    if (list) list.push(value)
    else map.set(key, [value])
}

const unique = (values) => [...new Set(values)]

const uniqueEntities = (entities) => {
    const seen = new Set()

    return entities.filter((entity) => {
        const key = entityKey(entity)
        if (seen.has(key)) return false

        seen.add(key)
        return true
    })
}

const getNoteTitle = (note) => note.title || stripNoteExtension(note.filename)

export const findFileReferences = (content, files) => {
    const found = new Map()

    mapOutsideCode(content || '', (segment) => {
        for (const match of segment.matchAll(WIKI_LINK_PATTERN)) {
            const target = match[1].split(WIKI_LINK_ANCHOR_SEPARATOR)[0]
            if (!isFileLinkTarget(target)) continue

            const file = findFileByTarget(files, target)
            if (file) found.set(file.id, file)
        }

        return segment
    })

    return [...found.values()]
}

export const buildConnectionModel = ({ notes, notePaths, files, rootName = '' }) => {
    const noteByPath = new Map(notes.map((note) => [note.path, note]))
    const folderByNote = new Map(notes.map((note) => [note.path, notePaths.get(note.path) || '']))
    const fileById = new Map(files.map((file) => [file.id, file]))
    const outgoing = new Map()
    const incoming = new Map()
    const unresolved = new Map()
    const noteFiles = new Map()
    const fileNotes = new Map()
    const tagNotes = new Map()

    notes.forEach((note) => {
        const links = findOutgoingLinks(note.note, note.path, notes, notePaths)
        outgoing.set(note.path, links)

        links.forEach((link) => {
            if (link.path) {
                pushTo(incoming, link.path, note.path)
                return
            }

            const entry = unresolved.get(link.key) ||
                { id: link.key, title: link.title, sources: [] }
            entry.sources.push(note.path)
            unresolved.set(link.key, entry)
        })

        findFileReferences(note.note, files).forEach((file) => {
            pushTo(noteFiles, note.path, file.id)
            pushTo(fileNotes, file.id, note.path)
        })

        unique(note.tags || []).forEach((tag) => pushTo(tagNotes, tag, note.path))
    })

    return {
        rootName,
        notes,
        files,
        noteByPath,
        folderByNote,
        fileById,
        outgoing,
        incoming,
        unresolved,
        noteFiles,
        fileNotes,
        tagNotes
    }
}

export const entityExists = (entity, model) => {
    switch (entity.type) {
        case ROOT:
            return true
        case NOTE:
            return model.noteByPath.has(entity.id)
        case FILE:
            return model.fileById.has(entity.id)
        case TAG:
            return model.tagNotes.has(entity.id)
        case MISSING:
            return model.unresolved.has(entity.id)
        case FOLDER:
            return folderExists(entity.id, model)
        default:
            return false
    }
}

const isInsideFolder = (folder, id) => folder === id || folder.startsWith(id + FOLDER_SEPARATOR)

const folderExists = (id, model) => (
    model.notes.some((note) => isInsideFolder(model.folderByNote.get(note.path), id)) ||
        model.files.some((file) => isInsideFolder(file.folder, id))
)

export const entityTitle = (entity, model) => {
    switch (entity.type) {
        case ROOT:
            return model.rootName
        case NOTE: {
            const note = model.noteByPath.get(entity.id)
            return note ? getNoteTitle(note) : ''
        }
        case FILE:
            return model.fileById.get(entity.id)?.filename || ''
        case MISSING:
            return model.unresolved.get(entity.id)?.title || ''
        case FOLDER:
            return splitFolder(entity.id).pop() || ''
        default:
            return entity.id
    }
}

const sortByTitle = (entities, model) => [...entities].sort((a, b) => (
    entityTitle(a, model).localeCompare(entityTitle(b, model))
))

const noteEntities = (paths, model) => sortByTitle(
    uniqueEntities(paths.map((path) => makeEntity(NOTE, path))),
    model
)

const fileEntities = (ids, model) => sortByTitle(
    uniqueEntities(ids.map((id) => makeEntity(FILE, id))),
    model
)

const rankTags = (tags, limit) => {
    const counts = new Map()
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1))

    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, limit)
        .map(([tag]) => makeEntity(TAG, tag))
}

const tagsOfNotes = (paths, model) => paths.flatMap((path) => (
    unique(model.noteByPath.get(path)?.tags || [])
))

const filesOfNotes = (paths, model) => unique(
    paths.flatMap((path) => model.noteFiles.get(path) || [])
)

const childFolders = (parent, model) => {
    const prefix = parent ? parent + FOLDER_SEPARATOR : ''
    const folders = [
        ...model.notes.map((note) => model.folderByNote.get(note.path)),
        ...model.files.map((file) => file.folder)
    ]

    return unique(
        folders
            .filter((folder) => folder.startsWith(prefix) && folder.length > prefix.length)
            .map((folder) => prefix + folder.slice(prefix.length).split(FOLDER_SEPARATOR)[0])
    ).map((id) => makeEntity(FOLDER, id))
}

const notesInside = (folder, model) => model.notes
    .filter((note) => isInsideFolder(model.folderByNote.get(note.path), folder))
    .map((note) => note.path)

const noteRelations = (entity, model) => {
    const note = model.noteByPath.get(entity.id)
    if (!note) return []

    const targets = (model.outgoing.get(entity.id) || []).map((link) => (
        link.path ? makeEntity(NOTE, link.path) : makeEntity(MISSING, link.key)
    ))

    return [
        { key: LINKS_OUT, entities: sortByTitle(uniqueEntities(targets), model) },
        { key: LINKS_IN, entities: noteEntities(model.incoming.get(entity.id) || [], model) },
        { key: TAGS, entities: unique(note.tags || []).map((tag) => makeEntity(TAG, tag)) },
        { key: FILES, entities: fileEntities(model.noteFiles.get(entity.id) || [], model) }
    ]
}

const tagRelations = (entity, model) => {
    const paths = model.tagNotes.get(entity.id) || []
    const related = unique(tagsOfNotes(paths, model)).filter((tag) => tag !== entity.id)

    return [
        { key: NOTES, entities: noteEntities(paths, model) },
        { key: RELATED_TAGS, entities: related.sort().map((tag) => makeEntity(TAG, tag)) },
        { key: FILES, entities: fileEntities(filesOfNotes(paths, model), model) }
    ]
}

const fileRelations = (entity, model) => {
    const paths = model.fileNotes.get(entity.id) || []

    return [
        { key: NOTES, entities: noteEntities(paths, model) },
        {
            key: TAGS,
            entities: unique(tagsOfNotes(paths, model)).sort().map((tag) => makeEntity(TAG, tag))
        }
    ]
}

const folderRelations = (entity, model) => {
    const inside = notesInside(entity.id, model)
    const direct = model.notes
        .filter((note) => model.folderByNote.get(note.path) === entity.id)
        .map((note) => note.path)
    const directFiles = model.files
        .filter((file) => file.folder === entity.id)
        .map((file) => file.id)

    return [
        { key: FOLDERS, entities: sortByTitle(childFolders(entity.id, model), model) },
        { key: NOTES, entities: noteEntities(direct, model) },
        { key: FILES, entities: fileEntities(directFiles, model) },
        { key: TAGS, entities: rankTags(tagsOfNotes(inside, model), CONNECTION_LIMITS.topTags) }
    ]
}

const rootRelations = (model) => [
    { key: FOLDERS, entities: sortByTitle(childFolders('', model), model) },
    {
        key: TAGS,
        entities: rankTags(
            model.notes.flatMap((note) => unique(note.tags || [])),
            CONNECTION_LIMITS.topTags
        )
    }
]

export const listRelations = (entity, model) => {
    let sections

    switch (entity.type) {
        case NOTE:
            sections = noteRelations(entity, model)
            break
        case MISSING:
            sections = [{
                key: LINKS_IN,
                entities: noteEntities(model.unresolved.get(entity.id)?.sources || [], model)
            }]
            break
        case TAG:
            sections = tagRelations(entity, model)
            break
        case FILE:
            sections = fileRelations(entity, model)
            break
        case FOLDER:
            sections = folderRelations(entity, model)
            break
        default:
            sections = rootRelations(model)
    }

    return sections.filter((section) => section.entities.length > 0)
}

export const listOriginOptions = (type, model) => {
    switch (type) {
        case NOTE:
            return noteEntities(model.notes.map((note) => note.path), model)
        case TAG:
            return [...model.tagNotes.keys()].sort().map((tag) => makeEntity(TAG, tag))
        case FILE:
            return fileEntities(model.files.map((file) => file.id), model)
        default: {
            const folders = model.notes.flatMap((note) => (
                foldersAlong(model.folderByNote.get(note.path))
            ))
            const fileFolders = model.files.flatMap((file) => foldersAlong(file.folder))

            return sortByTitle(
                unique([...folders, ...fileFolders]).map((id) => makeEntity(FOLDER, id)),
                model
            )
        }
    }
}

const foldersAlong = (folder) => splitFolder(folder).map((_, index, parts) => (
    parts.slice(0, index + 1).join(FOLDER_SEPARATOR)
))

export const summarizeConnections = (model) => {
    const orphans = model.notes
        .filter((note) => {
            const hasOutgoing = (model.outgoing.get(note.path) || []).some((link) => link.path)
            return !hasOutgoing && !model.incoming.has(note.path)
        })
        .sort((a, b) => getNoteTitle(a).localeCompare(getNoteTitle(b)))

    const total = model.notes.length
    const connected = total - orphans.length
    const brokenNotes = new Set([...model.unresolved.values()].flatMap((entry) => entry.sources))

    return {
        total,
        brokenNotes: brokenNotes.size,
        connected,
        percent: total ? Math.round((connected / total) * 100) : 100,
        orphans,
        unresolved: [...model.unresolved.values()].sort((a, b) => a.title.localeCompare(b.title))
    }
}
