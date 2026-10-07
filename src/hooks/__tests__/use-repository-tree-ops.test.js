import { renderHook } from '@testing-library/react-native'

import { useRepositoryTreeOps } from '../use-repository-tree-ops'
import { DEFAULT_TEMPLATE_FILES } from '@/constants/default-templates'

let mockUuidCount = 0

jest.mock('expo-crypto', () => ({
    randomUUID: () => `uuid-${++mockUuidCount}`
}))

const dir = (name, uri = `file:///${name}`) => ({ name, uri })

const makeFileStorage = ({ existing = [], subdirectories = {} } = {}) => ({
    listMarkdownFiles: jest.fn(() => existing.map((name) => ({ name }))),
    listSubdirectories: jest.fn((uri) => {
        const entry = subdirectories[uri]
        if (entry instanceof Error) throw entry
        return entry || []
    }),
    writeNoteFile: jest.fn(),
    getOrCreateTemplatesFolder: jest.fn((uri) => ({ uri: `${uri}/templates` }))
})

const setup = async ({ repositories = [], ...storageOptions } = {}) => {
    const fileStorage = makeFileStorage(storageOptions)
    const hook = await renderHook(() => useRepositoryTreeOps({ repositories, fileStorage }))
    return { fileStorage, ...hook }
}

describe('repository tree ops', () => {
    beforeEach(() => {
        mockUuidCount = 0
    })

    describe('seed templates', () => {
        test('writes every default template to an empty folder', async () => {
            const { result, fileStorage } = await setup()

            result.current.seedTemplates('file:///repo/templates')

            const written = fileStorage.writeNoteFile.mock.calls.map((call) => call[1])
            expect(written.sort()).toEqual(Object.values(DEFAULT_TEMPLATE_FILES).sort())
        })

        test('skips templates that already exist', async () => {
            const { result, fileStorage } = await setup({
                existing: [DEFAULT_TEMPLATE_FILES.JOURNAL]
            })

            result.current.seedTemplates('file:///repo/templates')

            const written = fileStorage.writeNoteFile.mock.calls.map((call) => call[1])
            expect(written).not.toContain(DEFAULT_TEMPLATE_FILES.JOURNAL)
            expect(written).toHaveLength(Object.values(DEFAULT_TEMPLATE_FILES).length - 1)
        })
    })

    describe('build repository', () => {
        test('creates a repository entry with a seeded templates folder', async () => {
            const { result, fileStorage } = await setup()

            const repository = result.current.buildRepository(dir('notes'))

            expect(repository).toMatchObject({
                id: 'uuid-1',
                uri: 'file:///notes',
                alias: 'notes',
                templatesUri: 'file:///notes/templates',
                parentId: null
            })
            expect(fileStorage.writeNoteFile).toHaveBeenCalled()
        })

        test('skips the templates folder when seeding is disabled', async () => {
            const { result, fileStorage } = await setup()

            const repository = result.current.buildRepository(dir('sub'), 'parent', false)

            expect(repository.templatesUri).toBeNull()
            expect(repository.parentId).toBe('parent')
            expect(fileStorage.getOrCreateTemplatesFolder).not.toHaveBeenCalled()
        })
    })

    describe('discover subfolders', () => {
        test('flattens nested subdirectories with their parent ids', async () => {
            const { result } = await setup({
                subdirectories: {
                    'file:///root': [dir('a')],
                    'file:///a': [dir('b')]
                }
            })

            const entries = result.current.discoverSubfolders(dir('root'), 'root-id')

            expect(entries.map(({ alias, parentId }) => [alias, parentId])).toEqual([
                ['a', 'root-id'],
                ['b', 'uuid-1']
            ])
        })

        test('returns nothing for a folder without subdirectories', async () => {
            const { result } = await setup()

            expect(result.current.discoverSubfolders(dir('root'), 'root-id')).toEqual([])
        })
    })

    describe('relink uris', () => {
        const root = { id: 'root', uri: 'file:///root', alias: 'root', parentId: null }
        const child = { id: 'child', uri: 'file:///old/a', alias: 'a', parentId: 'root' }
        const grand = { id: 'grand', uri: 'file:///old/b', alias: 'b', parentId: 'child' }

        test('updates tracked children uris from the matching folders on disk', async () => {
            const { result } = await setup({
                repositories: [root, child, grand],
                subdirectories: {
                    'file:///root': [dir('a', 'file:///root/a')],
                    'file:///root/a': [dir('b', 'file:///root/a/b')]
                }
            })

            const relinked = result.current.relinkUris(root)

            expect(relinked.map(({ id, uri }) => [id, uri])).toEqual([
                ['child', 'file:///root/a'],
                ['grand', 'file:///root/a/b']
            ])
        })

        test('drops tracked children that no longer exist on disk', async () => {
            const { result } = await setup({
                repositories: [root, child],
                subdirectories: { 'file:///root': [] }
            })

            expect(result.current.relinkUris(root)).toEqual([])
        })

        test('treats an unreadable folder as having no children', async () => {
            const { result } = await setup({
                repositories: [root, child],
                subdirectories: { 'file:///root': new Error('denied') }
            })

            expect(result.current.relinkUris(root)).toEqual([])
        })
    })
})
