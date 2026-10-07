import { sortNotes } from '../note-sort'
import { NOTE_SORTS } from '@/constants/note-sort'

const MOCK_NOTES = [
    { title: 'Banana', createdAt: 300, updatedAt: 500 },
    { title: 'Apple', createdAt: 100, updatedAt: '' },
    { title: 'Cherry', createdAt: 200, updatedAt: 900 }
]

const titles = (notes) => notes.map((note) => note.title)

describe('sort notes', () => {
    test('orders by name ascending by default', () => {
        expect(titles(sortNotes(MOCK_NOTES))).toEqual(['Apple', 'Banana', 'Cherry'])
    })

    test('orders by name descending', () => {
        expect(titles(sortNotes(MOCK_NOTES, NOTE_SORTS.NAME_DESC))).toEqual(
            ['Cherry', 'Banana', 'Apple']
        )
    })

    test('orders by most recently modified first', () => {
        expect(titles(sortNotes(MOCK_NOTES, NOTE_SORTS.MODIFIED_DESC))).toEqual(
            ['Cherry', 'Banana', 'Apple']
        )
    })

    test('falls back to the creation date for never modified notes', () => {
        expect(titles(sortNotes(MOCK_NOTES, NOTE_SORTS.MODIFIED_ASC))).toEqual(
            ['Apple', 'Banana', 'Cherry']
        )
    })

    test('orders by newest created first', () => {
        expect(titles(sortNotes(MOCK_NOTES, NOTE_SORTS.CREATED_DESC))).toEqual(
            ['Banana', 'Cherry', 'Apple']
        )
    })

    test('orders by oldest created first', () => {
        expect(titles(sortNotes(MOCK_NOTES, NOTE_SORTS.CREATED_ASC))).toEqual(
            ['Apple', 'Cherry', 'Banana']
        )
    })

    test('breaks ties by name', () => {
        const tied = [
            { title: 'Zed', createdAt: 1, updatedAt: 5 },
            { title: 'Alpha', createdAt: 1, updatedAt: 5 }
        ]

        expect(titles(sortNotes(tied, NOTE_SORTS.MODIFIED_DESC))).toEqual(['Alpha', 'Zed'])
    })

    test('does not mutate the input list', () => {
        const input = MOCK_NOTES.slice()

        sortNotes(input, NOTE_SORTS.NAME_DESC)

        expect(input).toEqual(MOCK_NOTES)
    })

    test('falls back to name order for an unknown sort', () => {
        expect(titles(sortNotes(MOCK_NOTES, 'unknown'))).toEqual(['Apple', 'Banana', 'Cherry'])
    })
})
