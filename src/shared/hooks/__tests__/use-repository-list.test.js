import { renderHook } from '@testing-library/react-native'
import { Directory } from 'expo-file-system'

import { useRepositoryList } from '../use-repository-list'
import { makeProps, persistedIds, root, grand } from '../__fixtures__/repository-props'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'
import { PICKER_ERROR_CODES } from '@/shared/constants/picker-errors'

jest.mock('expo-file-system', () => ({
    Directory: { pickDirectoryAsync: jest.fn() }
}))

const setup = async (overrides) => {
    const props = makeProps(overrides)
    const { result } = await renderHook(() => useRepositoryList(props))
    return { props, api: result.current }
}

describe('repository list', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    describe('add repository', () => {
        const picked = { uri: 'file:///picked', name: 'picked' }

        test('persists the folder with its discovered subfolders', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ folders: [] })
            props.discoverSubfolders.mockReturnValue([{ id: 'sub' }])

            const result = await api.addRepository()

            expect(persistedIds(props)).toEqual(['built', 'sub'])
            expect(result.id).toBe('built')
        })

        test('activates the folder when none is active', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ folders: [] })

            await api.addRepository()

            expect(props.persistActiveFolder).toHaveBeenCalledWith('built')
        })

        test('keeps the current active repository', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ activeFolderId: 'root' })

            await api.addRepository()

            expect(props.persistActiveFolder).not.toHaveBeenCalled()
        })

        test('returns duplicate when the folder is already tracked', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue({ uri: root.uri, name: 'root' })
            const { props, api } = await setup()

            const result = await api.addRepository()

            expect(result).toBe(REPOSITORY_RESULTS.DUPLICATE)
            expect(props.persistFolders).not.toHaveBeenCalled()
        })

        test('tells the caller once a folder was picked', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { api } = await setup({ folders: [] })
            const onPicked = jest.fn()

            await api.addRepository(onPicked)

            expect(onPicked).toHaveBeenCalledTimes(1)
        })

        test('does not tell the caller when the picker is cancelled', async () => {
            Directory.pickDirectoryAsync.mockRejectedValue({ code: PICKER_ERROR_CODES.CANCELLED })
            const { api } = await setup()
            const onPicked = jest.fn()

            await api.addRepository(onPicked)

            expect(onPicked).not.toHaveBeenCalled()
        })

        test('returns null when the picker is cancelled', async () => {
            Directory.pickDirectoryAsync.mockRejectedValue({ code: PICKER_ERROR_CODES.CANCELLED })
            const { api } = await setup()

            expect(await api.addRepository()).toBeNull()
        })

        test('returns error when picking fails', async () => {
            Directory.pickDirectoryAsync.mockRejectedValue(new Error('boom'))
            const { api } = await setup()

            expect(await api.addRepository()).toBe(REPOSITORY_RESULTS.ERROR)
        })

        test('marks the welcome note as pending when one is seeded', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ folders: [] })
            props.seedWelcomeNote.mockResolvedValue('built::Welcome.md')

            const result = await api.addRepository()

            expect(props.setPendingWelcomeNoteId).toHaveBeenCalledWith('built::Welcome.md')
            expect(result.welcomeNotePath).toBe('built::Welcome.md')
        })

        test('releases the busy flag when it finishes', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ folders: [] })

            await api.addRepository()

            expect(props.busyRef.current).toBe(false)
        })
    })

    describe('pending welcome note', () => {
        test('clears the pending welcome note id', async () => {
            const { props, api } = await setup()

            api.clearPendingWelcomeNote()

            expect(props.setPendingWelcomeNoteId).toHaveBeenCalledWith(null)
        })
    })

    describe('forget repository', () => {
        test('removes the folder and its descendants from the list only', async () => {
            const { props, api } = await setup()

            await api.forgetRepository('root')

            expect(persistedIds(props)).toEqual(['other'])
            expect(props.fileStorage.deleteDirectory).not.toHaveBeenCalled()
        })

        test('moves the active folder to the first remaining one', async () => {
            const { props, api } = await setup({ activeFolderId: 'root' })

            await api.forgetRepository('root')

            expect(props.persistActiveFolder).toHaveBeenCalledWith('other')
        })

        test('ignores an unknown repository', async () => {
            const { props, api } = await setup()

            await api.forgetRepository('missing')

            expect(props.persistFolders).not.toHaveBeenCalled()
        })
    })

    describe('remove repository', () => {
        test('refuses to remove an ancestor of the active repository', async () => {
            const { props, api } = await setup({
                activeFolder: grand,
                isAncestorOf: jest.fn(() => true)
            })

            const result = await api.removeRepository('root')

            expect(result).toBe(REPOSITORY_RESULTS.ACTIVE)
            expect(props.fileStorage.deleteDirectory).not.toHaveBeenCalled()
        })

        test('deletes a root folder from the device', async () => {
            const { props, api } = await setup()

            const result = await api.removeRepository('other')

            expect(props.fileStorage.deleteDirectory).toHaveBeenCalledWith('file:///other')
            expect(props.fileStorage.removeFolder).not.toHaveBeenCalled()
            expect(result.id).toBe('other')
        })

        test('deletes a subfolder together with its versions', async () => {
            const { props, api } = await setup()

            await api.removeRepository('child')

            expect(persistedIds(props)).toEqual(['root', 'other'])
            expect(props.fileStorage.removeFolder).toHaveBeenCalledWith({
                rootUri: 'file:///root',
                path: 'child',
                folderIds: ['child', 'grand'],
                dropVersions: true
            })
            expect(props.fileStorage.deleteDirectory).not.toHaveBeenCalled()
        })

        test('returns null for an unknown repository', async () => {
            const { api } = await setup()

            expect(await api.removeRepository('missing')).toBeNull()
        })
    })

    describe('set active repository', () => {
        test('persists the chosen folder id', async () => {
            const { props, api } = await setup()

            api.setActiveFolder('other')

            expect(props.persistActiveFolder).toHaveBeenCalledWith('other')
        })
    })
})
