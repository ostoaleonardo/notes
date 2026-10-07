import { renderHook } from '@testing-library/react-native'

import { useRepositorySync } from '../use-repository-sync'

const repo = (id, uri, parentId = null) => ({ id, uri, alias: id, parentId })

const root = repo('root', 'file:///root')
const kept = repo('kept', 'file:///root/kept', 'root')
const removed = repo('removed', 'file:///root/removed', 'root')

const setup = async ({
    repositories,
    activeRepositoryId = '',
    busy = false,
    existingUris = null,
    diskSubdirectories = {}
}) => {
    const props = {
        repositories,
        activeRepositoryId,
        busyRef: { current: busy },
        directoryExists: jest.fn((uri) => !existingUris || existingUris.includes(uri)),
        listSubdirectories: jest.fn((uri) => {
            const entry = diskSubdirectories[uri]
            if (entry instanceof Error) throw entry
            return entry || []
        }),
        buildRepository: jest.fn((directory, parentId) => ({
            id: `new-${directory.name}`,
            uri: directory.uri,
            alias: directory.name,
            parentId
        })),
        discoverSubfolders: jest.fn(() => []),
        persistRepositories: jest.fn(() => Promise.resolve()),
        persistActiveRepository: jest.fn(() => Promise.resolve())
    }

    const hook = await renderHook(() => useRepositorySync(props))

    return { props, ...hook }
}

describe('repository sync', () => {
    test('does nothing while another operation is busy', async () => {
        const { props, result } = await setup({ repositories: [root], busy: true })

        await result.current.reconcileRepositories()

        expect(props.persistRepositories).not.toHaveBeenCalled()
    })

    test('keeps tracked repositories that still exist on disk', async () => {
        const { props, result } = await setup({
            repositories: [root, kept],
            diskSubdirectories: { 'file:///root': [{ name: 'kept', uri: kept.uri }] }
        })

        await result.current.reconcileRepositories()

        expect(props.persistRepositories).toHaveBeenCalledWith([root, kept])
    })

    test('drops tracked subfolders that disappeared from disk', async () => {
        const { props, result } = await setup({
            repositories: [root, kept, removed],
            diskSubdirectories: { 'file:///root': [{ name: 'kept', uri: kept.uri }] }
        })

        await result.current.reconcileRepositories()

        expect(props.persistRepositories).toHaveBeenCalledWith([root, kept])
    })

    test('adds folders created on disk and their descendants', async () => {
        const { props, result } = await setup({
            repositories: [root],
            diskSubdirectories: { 'file:///root': [{ name: 'fresh', uri: 'file:///root/fresh' }] }
        })
        props.discoverSubfolders.mockReturnValue([
            repo('deep', 'file:///root/fresh/deep', 'new-fresh')
        ])

        await result.current.reconcileRepositories()

        const [persisted] = props.persistRepositories.mock.calls[0]
        expect(persisted.map((entry) => entry.id)).toEqual(['root', 'new-fresh', 'deep'])
    })

    test('drops a root whose directory no longer exists', async () => {
        const { props, result } = await setup({
            repositories: [root, kept],
            existingUris: []
        })

        await result.current.reconcileRepositories()

        expect(props.persistRepositories).toHaveBeenCalledWith([])
    })

    test('treats an unreadable folder as having no subfolders', async () => {
        const { props, result } = await setup({
            repositories: [root, kept],
            diskSubdirectories: { 'file:///root': new Error('denied') }
        })

        await result.current.reconcileRepositories()

        expect(props.persistRepositories).toHaveBeenCalledWith([root])
    })

    test('moves the active repository to the first remaining root when it vanishes', async () => {
        const other = repo('other', 'file:///other')
        const { props, result } = await setup({
            repositories: [root, other],
            activeRepositoryId: 'root',
            existingUris: ['file:///other']
        })

        await result.current.reconcileRepositories()

        expect(props.persistActiveRepository).toHaveBeenCalledWith('other')
    })

    test('clears the active repository when no roots remain', async () => {
        const { props, result } = await setup({
            repositories: [root],
            activeRepositoryId: 'root',
            existingUris: []
        })

        await result.current.reconcileRepositories()

        expect(props.persistActiveRepository).toHaveBeenCalledWith('')
    })

    test('keeps the active repository when it still exists', async () => {
        const { props, result } = await setup({
            repositories: [root],
            activeRepositoryId: 'root'
        })

        await result.current.reconcileRepositories()

        expect(props.persistActiveRepository).not.toHaveBeenCalled()
    })
})
