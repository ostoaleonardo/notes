import { getUniqueTitle } from '@/utils/note-filename'

const sameList = (a, b) => a.length === b.length && a.every((item, index) => item === b[index])

export const toDraft = (stored, untitled) => {
    const {
        title = '',
        note = '',
        tags = [],
        properties = {},
        repositoryId = '',
        filename = '',
        invalidFrontmatter = null,
        rawFrontmatter = null
    } = stored

    return {
        title: title || untitled,
        note,
        tags,
        properties,
        repositoryId,
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

export const resolveNewNoteRepositoryId = ({ targetRepositoryId, defaultFolderId, activeRepositoryId }) => (
    targetRepositoryId || defaultFolderId || activeRepositoryId
)

export const getNewNoteTitle = (notes, repositoryId, untitled) => getUniqueTitle(
    notes.filter((note) => note.repositoryId === repositoryId).map((note) => note.title),
    untitled
)
