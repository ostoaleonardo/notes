import { DEFAULT_NOTE_SORT, NOTE_SORTS } from '@/constants/note-sort'

const compareByName = (a, b) => a.title.localeCompare(b.title)
const modifiedAt = (note) => note.updatedAt || note.createdAt || 0
const createdAt = (note) => note.createdAt || 0

const NOTE_COMPARATORS = {
    [NOTE_SORTS.NAME_ASC]: compareByName,
    [NOTE_SORTS.NAME_DESC]: (a, b) => compareByName(b, a),
    [NOTE_SORTS.MODIFIED_DESC]: (a, b) => modifiedAt(b) - modifiedAt(a) || compareByName(a, b),
    [NOTE_SORTS.MODIFIED_ASC]: (a, b) => modifiedAt(a) - modifiedAt(b) || compareByName(a, b),
    [NOTE_SORTS.CREATED_DESC]: (a, b) => createdAt(b) - createdAt(a) || compareByName(a, b),
    [NOTE_SORTS.CREATED_ASC]: (a, b) => createdAt(a) - createdAt(b) || compareByName(a, b)
}

export const sortNotes = (notes, sort = DEFAULT_NOTE_SORT) => (
    notes.slice().sort(NOTE_COMPARATORS[sort] || compareByName)
)
