import { renderHook } from '@testing-library/react-native'

import { useRepositorySync } from '../use-repository-sync'

const repo = (id, uri, parentId = null) => ({ id, uri, alias: id, parentId })

const root = repo('root', 'file:///root')
const kept = repo('kept', 'file:///root/kept', 'root')
const removed = repo('removed', 'file:///root/removed', 'root')

const setup = async ({
    folders,
    activeFolderId = '',
    busy = false,
    existingUris = null,
    diskSubdirectories = {}
}) => {
    const props = {
        folders,
        activeFolderId,
        busyRef: { current: busy },
        directoryExists: jest.fn((uri) => !existingUris || existingUris.includes(uri)),
        scanSubdirectories: jest.fn(async (uri) => {
            const entry = diskSubdirectories[uri]
            if (entry instanceof Error) throw entry
            return entry || []
        }),
        buildFolder: jest.fn((directory, parentId) => ({
            id: `new-${directory.name}`,
            uri: directory.uri,
            alias: directory.name,
            parentId
        })),
        discoverSubfolders: jest.fn(() => []),
        deleteFolderIndex: jest.fn(),
        persistFolders: jest.fn(() => Promise.resolve()),
        persistActiveFolder: jest.fn(() => Promise.resolve())
    }

    const hook = await renderHook(() => useRepositorySync(props))

    return { props, ...hook }
}

describe('repository sync', () => {
    test('does nothing while another operation is busy', async () => {
        const { props, result } = await setup({ folders: [root], busy: true })

        await result.current.reconcileFolders()

        expect(props.persistFolders).not.toHaveBeenCalled()
    })

    test('discards the scan when another operation started meanwhile', async () => {
        const { props, result } = await setup({ folders: [root] })
        props.scanSubdirectories.mockImplementation(async () => {
            props.busyRef.current = true
            return []
        })

        await result.current.reconcileFolders()

        expect(props.persistFolders).not.toHaveBeenCalled()
    })

    test('does not persist when every tracked folder still exists on disk', async () => {
        const { props, result } = await setup({
            folders: [root, kept],
            diskSubdirectories: { 'file:///root': [{ name: 'kept', uri: kept.uri }] }
        })

        await result.current.reconcileFolders()

        expect(props.persistFolders).not.toHaveBeenCalled()
    })

    test('drops tracked subfolders that disappeared from disk', async () => {
        const { props, result } = await setup({
            folders: [root, kept, removed],
            diskSubdirectories: { 'file:///root': [{ name: 'kept', uri: kept.uri }] }
        })

        await result.current.reconcileFolders()

        expect(props.persistFolders).toHaveBeenCalledWith([root, kept])
    })

    test('deletes the index of a root that disappeared from disk', async () => {
        const other = repo('other', 'file:///other')
        const { props, result } = await setup({
            folders: [root, other],
            existingUris: ['file:///other']
        })

        await result.current.reconcileFolders()

        expect(props.deleteFolderIndex).toHaveBeenCalledTimes(1)
        expect(props.deleteFolderIndex).toHaveBeenCalledWith('root')
    })

    test('adds folders created on disk and their descendants', async () => {
        const { props, result } = await setup({
            folders: [root],
            diskSubdirectories: { 'file:///root': [{ name: 'fresh', uri: 'file:///root/fresh' }] }
        })
        props.discoverSubfolders.mockReturnValue([
            repo('deep', 'file:///root/fresh/deep', 'new-fresh')
        ])

        await result.current.reconcileFolders()

        const [persisted] = props.persistFolders.mock.calls[0]
        expect(persisted.map((entry) => entry.id)).toEqual(['root', 'new-fresh', 'deep'])
    })

    test('drops a root whose directory no longer exists', async () => {
        const { props, result } = await setup({
            folders: [root, kept],
            existingUris: []
        })

        await result.current.reconcileFolders()

        expect(props.persistFolders).toHaveBeenCalledWith([])
    })

    test('treats an unreadable folder as having no subfolders', async () => {
        const { props, result } = await setup({
            folders: [root, kept],
            diskSubdirectories: { 'file:///root': new Error('denied') }
        })

        await result.current.reconcileFolders()

        expect(props.persistFolders).toHaveBeenCalledWith([root])
    })

    test('moves the active folder to the first remaining root when it vanishes', async () => {
        const other = repo('other', 'file:///other')
        const { props, result } = await setup({
            folders: [root, other],
            activeFolderId: 'root',
            existingUris: ['file:///other']
        })

        await result.current.reconcileFolders()

        expect(props.persistActiveFolder).toHaveBeenCalledWith('other')
    })

    test('clears the active folder when no roots remain', async () => {
        const { props, result } = await setup({
            folders: [root],
            activeFolderId: 'root',
            existingUris: []
        })

        await result.current.reconcileFolders()

        expect(props.persistActiveFolder).toHaveBeenCalledWith('')
    })

    test('keeps the active folder when it still exists', async () => {
        const { props, result } = await setup({
            folders: [root],
            activeFolderId: 'root'
        })

        await result.current.reconcileFolders()

        expect(props.persistActiveFolder).not.toHaveBeenCalled()
    })
})
