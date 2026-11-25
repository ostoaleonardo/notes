import { renderHook } from '@testing-library/react-native'

import { useSubfolders } from '../use-subfolders'
import { makeProps, persistedIds, root, child, grand } from '../__fixtures__/repository-props'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'

const setup = async (overrides) => {
    const props = makeProps(overrides)
    const { result } = await renderHook(() => useSubfolders(props))
    return { props, api: result.current }
}

describe('subfolders', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    describe('add subfolder', () => {
        test('creates a sanitized subfolder under the parent', async () => {
            const { props, api } = await setup({ pro: true })

            const result = await api.addSubfolder('root', 'a/b')

            expect(props.fileStorage.createSubdirectory)
                .toHaveBeenCalledWith('file:///root', 'a b')
            expect(result.parentId).toBe('root')
            expect(persistedIds(props)).toContain('built')
        })

        test('requires pro past the free subfolder limit', async () => {
            const { props, api } = await setup()

            const result = await api.addSubfolder('root', 'Second')

            expect(result).toBe(REPOSITORY_RESULTS.PRO_REQUIRED)
            expect(props.fileStorage.createSubdirectory).not.toHaveBeenCalled()
        })

        test('allows a free subfolder when the parent has none', async () => {
            const { api } = await setup({ folders: [root] })

            const result = await api.addSubfolder('root', 'First')

            expect(result.parentId).toBe('root')
        })

        test('requires pro for nested subfolders', async () => {
            const { api } = await setup()

            expect(await api.addSubfolder('child', 'Nested')).toBe(REPOSITORY_RESULTS.PRO_REQUIRED)
        })

        test('returns null when the parent does not exist for pro users', async () => {
            const { api } = await setup({ pro: true })

            expect(await api.addSubfolder('missing', 'Name')).toBeNull()
        })
    })

    describe('rename repository', () => {
        test('returns null for an unknown repository', async () => {
            const { api } = await setup()

            expect(await api.renameFolder('missing', 'Name')).toBeNull()
        })

        test('only changes the alias of a root repository', async () => {
            const { props, api } = await setup()

            await api.renameFolder('root', 'Renamed')

            const persisted = props.persistFolders.mock.calls[0][0]
            expect(persisted.find((r) => r.id === 'root').alias).toBe('Renamed')
            expect(props.fileStorage.renameFolder).not.toHaveBeenCalled()
        })

        test('renames the folder and relinks descendants for a subfolder', async () => {
            const { props, api } = await setup()
            props.relinkUris.mockReturnValue([{ ...grand, uri: 'file:///root/New/grand' }])

            const result = await api.renameFolder('child', 'New')

            expect(props.fileStorage.renameFolder).toHaveBeenCalledWith({
                rootUri: 'file:///root',
                path: 'child',
                newName: 'New',
                folderIds: ['child', 'grand'],
                parentUri: 'file:///root'
            })
            expect(result).toMatchObject({ alias: 'New', uri: 'file:///root/New' })
            const persisted = props.persistFolders.mock.calls[0][0]
            expect(persisted.find((r) => r.id === 'grand').uri).toBe('file:///root/New/grand')
        })

        test('returns error when the folder rename fails', async () => {
            const { props, api } = await setup()
            props.fileStorage.renameFolder.mockRejectedValue(new Error('exists'))

            const result = await api.renameFolder('child', 'New')

            expect(result).toBe(REPOSITORY_RESULTS.ERROR)
            expect(props.persistFolders).not.toHaveBeenCalled()
            expect(props.busyRef.current).toBe(false)
        })

        test('returns error when the parent folder is missing', async () => {
            const { api } = await setup({ folders: [child] })

            expect(await api.renameFolder('child', 'New')).toBe(REPOSITORY_RESULTS.ERROR)
        })
    })
})
