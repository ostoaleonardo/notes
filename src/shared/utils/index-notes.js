import RepositoryFs from 'repository-fs'

import { bootMark } from '@/shared/utils/boot-mark'
import { queryIndex } from '@/shared/utils/index-query'
import { buildNotePath } from '@/shared/utils/note-path'
import { seedNoteLinkTexts } from '@/shared/utils/note-links'
import { seedNoteTags } from '@/shared/utils/note-tags'
import { dedupeTags } from '@/shared/utils/tag-names'

import { BOOT_MARKS } from '@/shared/constants/boot-marks'
import {
    COUNT_INDEXED_NOTES_HEAD,
    COUNT_INDEXED_NOTES_TAIL,
    COUNT_PLACEHOLDER,
    COUNT_PLACEHOLDER_SEPARATOR
} from '@/shared/constants/index-notes'

export const buildNoteFromMetadata = (metadata) => {
    const note = {
        filename: metadata.filename,
        folderId: metadata.folderId,
        path: buildNotePath(metadata.folderId, metadata.filename),
        fileUri: metadata.fileUri,
        title: metadata.title,
        tags: metadata.tags,
        properties: metadata.properties,
        invalidFrontmatter: metadata.invalidFrontmatter,
        rawFrontmatter: metadata.rawFrontmatter,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt
    }

    seedNoteTags(note, dedupeTags([...metadata.tags, ...metadata.inlineTags]))
    seedNoteLinkTexts(note, metadata.linkTexts)

    return note
}

export const createIndexedNotesLoader = (fs) => async (folderIds) => {
    const nativeStart = Date.now()
    const json = await fs.listNoteMetadata(folderIds)
    const parseStart = Date.now()
    const metadata = JSON.parse(json)
    const buildStart = Date.now()
    const notes = metadata.map(buildNoteFromMetadata)

    bootMark(BOOT_MARKS.INDEX_LIST, {
        bytes: json.length,
        notes: notes.length,
        nativeMs: parseStart - nativeStart,
        parseMs: buildStart - parseStart,
        buildMs: Date.now() - buildStart
    })

    return notes
}

export const loadNotesFromIndex = createIndexedNotesLoader(RepositoryFs)

export const createIndexedNotesCounter = (query) => async (folderIds) => {
    if (!folderIds.length) return 0

    const placeholders = folderIds.map(() => COUNT_PLACEHOLDER).join(COUNT_PLACEHOLDER_SEPARATOR)
    const [row] = await query(
        `${COUNT_INDEXED_NOTES_HEAD}${placeholders}${COUNT_INDEXED_NOTES_TAIL}`,
        ...folderIds
    )

    return row?.count ?? 0
}

export const countIndexedNotes = createIndexedNotesCounter(queryIndex)
