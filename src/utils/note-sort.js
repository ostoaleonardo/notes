import { DEFAULT_NOTE_SORT, NOTE_SORTS } from '@/constants/note-sort'
import { compareText } from '@/utils/compare-text'

const compareNotesByTitle = (a, b) => compareText(a.title, b.title)
const modifiedAt = (note) => note.updatedAt || note.createdAt || 0
const createdAt = (note) => note.createdAt || 0

const NOTE_COMPARATORS = {
    [NOTE_SORTS.NAME_ASC]: compareNotesByTitle,
    [NOTE_SORTS.NAME_DESC]: (a, b) => compareNotesByTitle(b, a),
    [NOTE_SORTS.MODIFIED_DESC]: (a, b) => modifiedAt(b) - modifiedAt(a) || compareNotesByTitle(a, b),
    [NOTE_SORTS.MODIFIED_ASC]: (a, b) => modifiedAt(a) - modifiedAt(b) || compareNotesByTitle(a, b),
    [NOTE_SORTS.CREATED_DESC]: (a, b) => createdAt(b) - createdAt(a) || compareNotesByTitle(a, b),
    [NOTE_SORTS.CREATED_ASC]: (a, b) => createdAt(a) - createdAt(b) || compareNotesByTitle(a, b)
}

export const getNoteComparator = (sort = DEFAULT_NOTE_SORT) => NOTE_COMPARATORS[sort] || compareNotesByTitle

export const sortNotes = (notes, sort = DEFAULT_NOTE_SORT) => notes.slice().sort(getNoteComparator(sort))
