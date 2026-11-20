import { getUniqueTitle } from '@/shared/utils/note-filename'

const sameList = (a, b) => a.length === b.length && a.every((item, index) => item === b[index])

export const toDraft = (stored, untitled, body) => {
    const {
        title = '',
        note = '',
        tags = [],
        properties = {},
        folderId = '',
        filename = '',
        invalidFrontmatter = null,
        rawFrontmatter = null
    } = stored

    return {
        title: title || untitled,
        note: body ?? note,
        tags,
        properties,
        folderId,
        filename,
        invalidFrontmatter,
        rawFrontmatter
    }
}

export const toSavedSnapshot = ({ note, tags, properties, invalidFrontmatter, rawFrontmatter }) => ({
    note,
    tags,
    properties: JSON.stringify(properties),
    invalidFrontmatter,
    rawFrontmatter
})

export const fromSavedSnapshot = (saved) => ({
    ...saved,
    properties: JSON.parse(saved.properties)
})

export const isDraftSaved = (draft, saved) => (
    draft.note === saved.note &&
    sameList(draft.tags, saved.tags) &&
    JSON.stringify(draft.properties) === saved.properties &&
    draft.invalidFrontmatter === saved.invalidFrontmatter &&
    draft.rawFrontmatter === saved.rawFrontmatter
)

export const resolveNewNoteFolderId = ({ targetFolderId, defaultFolderId, activeFolderId }) => (
    targetFolderId || defaultFolderId || activeFolderId
)

export const getNewNoteTitle = (notes, folderId, untitled) => getUniqueTitle(
    notes.filter((note) => note.folderId === folderId).map((note) => note.title),
    untitled
)
