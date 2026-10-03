import { buildDrawerTagRows } from '../drawer-tags'

const notes = [
    { path: 'a', title: 'A', tags: ['Work', 'home'] },
    { path: 'b', title: 'B', tags: ['work'] },
    { path: 'c', title: 'C' }
]

describe('drawer tag rows', () => {
    test('counts notes per tag ignoring case', () => {
        const rows = buildDrawerTagRows(['Work', 'home', 'empty'], notes, null)

        expect(rows.map((row) => [row.name, row.count])).toEqual([
            ['Work', 2],
            ['home', 1],
            ['empty', 0]
        ])
    })

    test('lists only collapsed tags when none is expanded', () => {
        const rows = buildDrawerTagRows(['Work'], notes, null)

        expect(rows.every((row) => row.type === 'tag' && !row.expanded)).toBe(true)
    })

    test('lists the notes of the expanded tag right after it', () => {
        const rows = buildDrawerTagRows(['Work', 'home'], notes, 'WORK')

        expect(rows.map((row) => row.type)).toEqual(['tag', 'note', 'note', 'tag'])
        expect(rows[0].expanded).toBe(true)
        expect(rows.slice(1, 3).map((row) => row.note.path)).toEqual(['a', 'b'])
    })

    test('gives every row a unique id', () => {
        const rows = buildDrawerTagRows(['Work', 'home'], notes, 'work')

        expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    })
})
