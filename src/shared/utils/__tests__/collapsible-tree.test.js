import { getVisibleTree, markChildren } from '../collapsible-tree'

const FOLDERS = [
    { id: 'root', depth: 0 },
    { id: 'a', depth: 1 },
    { id: 'a1', depth: 2 },
    { id: 'b', depth: 1 }
]

const getId = (item) => item.id

describe('mark children', () => {
    test('flags the items followed by a deeper item', () => {
        const marked = markChildren(FOLDERS)

        expect(marked.map((item) => item.hasChildren)).toEqual([true, true, false, false])
    })

    test('returns an empty list for an empty tree', () => {
        expect(markChildren([])).toEqual([])
    })
})

describe('get visible tree', () => {
    test('keeps every item when nothing is collapsed', () => {
        expect(getVisibleTree(FOLDERS, new Set(), getId)).toHaveLength(4)
    })

    test('hides the descendants of a collapsed item', () => {
        const visible = getVisibleTree(FOLDERS, new Set(['a']), getId)

        expect(visible.map(getId)).toEqual(['root', 'a', 'b'])
    })

    test('hides the whole branch when the root is collapsed', () => {
        const visible = getVisibleTree(FOLDERS, new Set(['root']), getId)

        expect(visible.map(getId)).toEqual(['root'])
    })
})
