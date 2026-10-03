import { buildTagTree, collectTagKeys, flattenTagTree } from '../drawer-tags'

import { TAG_SORTS } from '@/constants/tags'

const notes = [
    { path: 'a', title: 'A', tags: ['Work', 'home'] },
    { path: 'b', title: 'B', tags: ['work/projects'] },
    { path: 'c', title: 'C', note: 'plain #work/projects/x' },
    { path: 'd', title: 'D' }
]

const rowsFor = (expanded = [], sort) => (
    flattenTagTree(buildTagTree(notes), new Set(expanded), sort)
)

describe('drawer tag rows', () => {
    test('lists root tags sorted, counting notes in their descendants too', () => {
        const rows = rowsFor()

        expect(rows.map((row) => [row.name, row.count, row.depth])).toEqual([
            ['home', 1, 0],
            ['Work', 3, 0]
        ])
    })

    test('counts each tag use under its ancestors like Obsidian does', () => {
        const tree = buildTagTree([{ path: 'a', tags: ['one', 'one/two', 'three', 'two'] }])
        const rows = flattenTagTree(tree, new Set(['one']))

        expect(rows.map((row) => [row.name, row.count])).toEqual([
            ['one', 2],
            ['two', 1],
            ['three', 1],
            ['two', 1]
        ])
    })

    test('sorts root tags by name in reverse order', () => {
        const rows = rowsFor([], TAG_SORTS.NAME_DESC)

        expect(rows.map((row) => row.name)).toEqual(['Work', 'home'])
    })

    test('sorts root tags by number of notes from high to low', () => {
        const rows = rowsFor([], TAG_SORTS.COUNT_DESC)

        expect(rows.map((row) => row.name)).toEqual(['Work', 'home'])
    })

    test('sorts root tags by number of notes from low to high', () => {
        const rows = rowsFor([], TAG_SORTS.COUNT_ASC)

        expect(rows.map((row) => row.name)).toEqual(['home', 'Work'])
    })

    test('breaks count ties by name in both directions', () => {
        const tied = [
            { path: 'a', tags: ['b'] },
            { path: 'b', tags: ['a'] }
        ]
        const tree = buildTagTree(tied)
        const names = (sort) => (
            flattenTagTree(tree, new Set(), sort).map((row) => row.name)
        )

        expect(names(TAG_SORTS.COUNT_DESC)).toEqual(['a', 'b'])
        expect(names(TAG_SORTS.COUNT_ASC)).toEqual(['a', 'b'])
    })

    test('flags tags that have child tags', () => {
        const rows = rowsFor(['work'])
        const flags = rows
            .map((row) => [row.key, row.hasChildren])

        expect(flags).toEqual([
            ['home', false],
            ['work', true],
            ['work/projects', true]
        ])
    })

    test('lists only collapsed tags when none is expanded', () => {
        expect(rowsFor().every((row) => !row.expanded)).toBe(true)
    })

    test('shows only child tags under an expanded tag', () => {
        const rows = rowsFor(['work'])
        const work = rows.findIndex((row) => row.key === 'work')

        expect(rows[work].expanded).toBe(true)
        expect(rows.slice(work + 1).map((row) => [row.key, row.depth])).toEqual([
            ['work/projects', 1]
        ])
    })

    test('nests deeper levels only when their parent is expanded', () => {
        const rows = rowsFor(['work', 'work/projects'])
        const names = rows.map((row) => row.key)

        expect(names).toEqual(['home', 'work', 'work/projects', 'work/projects/x'])
    })

    test('gives every row a unique id', () => {
        const rows = rowsFor(['work', 'work/projects', 'home'])

        expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    })

    test('collects the key of every tag at any depth', () => {
        expect(collectTagKeys(buildTagTree(notes)).sort()).toEqual([
            'home',
            'work',
            'work/projects',
            'work/projects/x'
        ])
    })
})
