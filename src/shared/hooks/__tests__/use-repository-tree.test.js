import { renderHook } from '@testing-library/react-native'

import { useRepositoryTree } from '../use-repository-tree'

const root = { id: 'root', parentId: null }
const child = { id: 'child', parentId: 'root' }
const grandchild = { id: 'grand', parentId: 'child' }
const sibling = { id: 'sibling', parentId: 'root' }
const other = { id: 'other', parentId: null }

const repositories = [root, child, grandchild, sibling, other]

const setup = (activeRepository = null) => renderHook(() => (
    useRepositoryTree({ repositories, activeRepository })
))

describe('repository tree', () => {
    test('finds the root of a nested repository', async () => {
        const { result } = await setup()

        expect(result.current.getRootRepository(grandchild)).toBe(root)
    })

    test('returns a root repository as its own root', async () => {
        const { result } = await setup()

        expect(result.current.getRootRepository(other)).toBe(other)
    })

    test('stops at the topmost known parent when an ancestor is missing', async () => {
        const orphan = { id: 'orphan', parentId: 'missing' }
        const { result } = await setup()

        expect(result.current.getRootRepository(orphan)).toBe(orphan)
    })

    test('lists descendants depth first with their depth', async () => {
        const { result } = await setup()

        const descendants = result.current.getDescendants('root')

        expect(descendants.map(({ id, depth }) => [id, depth])).toEqual([
            ['child', 0],
            ['grand', 1],
            ['sibling', 0]
        ])
    })

    test('lists no descendants for a leaf', async () => {
        const { result } = await setup()

        expect(result.current.getDescendants('sibling')).toEqual([])
    })

    test('detects an ancestor of a repository', async () => {
        const { result } = await setup()

        expect(result.current.isAncestorOf('root', grandchild)).toBe(true)
    })

    test('treats a repository as its own ancestor', async () => {
        const { result } = await setup()

        expect(result.current.isAncestorOf('child', child)).toBe(true)
    })

    test('rejects an unrelated repository as ancestor', async () => {
        const { result } = await setup()

        expect(result.current.isAncestorOf('sibling', grandchild)).toBe(false)
    })

    test('has an empty active tree without an active repository', async () => {
        const { result } = await setup()

        expect(result.current.activeRepositoryTree).toEqual([])
    })

    test('builds the active tree from the root of the active repository', async () => {
        const { result } = await setup(grandchild)

        const tree = result.current.activeRepositoryTree

        expect(tree.map(({ id, depth }) => [id, depth])).toEqual([
            ['root', 0],
            ['child', 1],
            ['grand', 2],
            ['sibling', 1]
        ])
    })
})
