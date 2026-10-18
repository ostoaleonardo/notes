import { buildConnectionModel } from '../connection-model'
import { buildPathTree } from '../connection-tree'
import {
    MOCK_CONNECTION_FILES,
    MOCK_CONNECTION_NOTES,
    MOCK_CONNECTION_NOTE_PATHS
} from '../__fixtures__/connections'
import { CONNECTION_NODE_KINDS } from '@/constants/connections'

const model = buildConnectionModel({
    notes: MOCK_CONNECTION_NOTES,
    notePaths: MOCK_CONNECTION_NOTE_PATHS,
    files: MOCK_CONNECTION_FILES,
    rootName: 'Vault'
})

const ids = (nodes) => nodes.map((node) => node.id)

const find = (node, id) => {
    if (node.id === id) return node

    for (const child of node.children) {
        const found = find(child, id)
        if (found) return found
    }

    return null
}

describe('build path tree', () => {
    const tree = buildPathTree(model)

    test('places folders before notes and sorts each group by title', () => {
        expect(ids(tree.children)).toEqual([
            'folder:attachments',
            'folder:Projects',
            'note:r::Alpha.md',
            'note:r::Index.md',
            'note:r::Lonely.md'
        ])
    })

    test('nests subfolders under their parent folder', () => {
        const projects = find(tree, 'folder:Projects')

        expect(ids(projects.children)).toEqual([
            'folder:Projects/Deep',
            'note:p::Beta.md',
            'file:file:spec'
        ])
    })

    test('puts files in the folder where they are stored', () => {
        expect(ids(find(tree, 'folder:attachments').children)).toEqual(['file:file:photo'])
    })

    test('counts the leaves under every folder', () => {
        expect(find(tree, 'folder:Projects').leaves).toBe(3)
        expect(find(tree, 'folder:Projects/Deep').leaves).toBe(1)
        expect(tree.leaves).toBe(7)
    })

    test('keeps the root node kind', () => {
        expect(tree.kind).toBe(CONNECTION_NODE_KINDS.ROOT)
    })
})
