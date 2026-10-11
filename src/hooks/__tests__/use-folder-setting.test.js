import { act, renderHook, waitFor } from '@testing-library/react-native'

import { useFolderSetting } from '../use-folder-setting'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { MENU } from '@/constants/components'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
}

const ACTIVE = { id: 'root', alias: 'Root' }
const DESCENDANTS = [
    { id: 'a', alias: 'Alpha', depth: 0 },
    { id: 'b', alias: 'Beta', depth: 1 }
]

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: ACTIVE,
        getDescendants: () => DESCENDANTS
    })
}))

const KEY = `${STORAGE_KEYS.DEFAULT_NOTE_FOLDER}:root`

describe('folder setting', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStorage.getItem.mockResolvedValue(null)
    })

    test('offers the root and every subfolder indented by depth', async () => {
        const { result } = await renderHook(() => useFolderSetting(STORAGE_KEYS.DEFAULT_NOTE_FOLDER, 'Root label'))

        expect(result.current.items).toEqual([
            { value: '', title: 'Root label' },
            { value: 'a', title: 'Alpha', contentStyle: { paddingLeft: 0 } },
            { value: 'b', title: 'Beta', contentStyle: { paddingLeft: MENU.itemIndent } }
        ])
    })

    test('describes the root when nothing is stored', async () => {
        const { result } = await renderHook(() => useFolderSetting(STORAGE_KEYS.DEFAULT_NOTE_FOLDER, 'Root label'))

        expect(result.current.selectedValue).toBe('')
        expect(result.current.description).toBe('Root label')
    })

    test('loads the folder stored for the active repository', async () => {
        mockStorage.getItem.mockImplementation(async (key) => (key === KEY ? 'b' : null))

        const { result } = await renderHook(() => useFolderSetting(STORAGE_KEYS.DEFAULT_NOTE_FOLDER, 'Root label'))

        await waitFor(() => expect(result.current.selectedValue).toBe('b'))
        expect(result.current.description).toBe('Beta')
    })

    test('stores the selected folder under the active repository key', async () => {
        const { result } = await renderHook(() => useFolderSetting(STORAGE_KEYS.DEFAULT_NOTE_FOLDER, 'Root label'))

        await act(async () => result.current.onSelect('a'))

        expect(mockStorage.setItem).toHaveBeenCalledWith(KEY, 'a')
        expect(result.current.selectedValue).toBe('a')
    })
})
