import { act, renderHook, waitFor } from '@testing-library/react-native'

import { useDirectAccessPrompt } from '../use-direct-access-prompt'

import { DIRECT_ACCESS_MIN_NOTES } from '@/shared/constants/direct-access'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

const mockSetItem = jest.fn()
const mockGetItem = jest.fn()
const mockHasDirectAccess = jest.fn()

let mockNotes = []
let mockForegroundCallback = null

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('../use-notes', () => ({
    useNotes: () => ({ notes: mockNotes })
}))
jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: mockGetItem, setItem: mockSetItem })
}))
jest.mock('../use-on-foreground', () => ({
    useOnForeground: (callback) => { mockForegroundCallback = callback }
}))
jest.mock('../../utils/direct-access', () => ({
    ...jest.requireActual('../../utils/direct-access'),
    hasDirectAccess: () => mockHasDirectAccess(),
    requestDirectAccess: jest.fn()
}))

beforeEach(() => {
    jest.clearAllMocks()
    mockNotes = new Array(DIRECT_ACCESS_MIN_NOTES).fill({})
    mockGetItem.mockResolvedValue(null)
    mockHasDirectAccess.mockReturnValue(false)
})

describe('direct access prompt hook', () => {
    test('shows for a large repository without the permission', async () => {
        const { result } = await renderHook(() => useDirectAccessPrompt())

        await waitFor(() => expect(result.current.visible).toBe(true))
    })

    test('hides once the user comes back from settings with the permission', async () => {
        const { result } = await renderHook(() => useDirectAccessPrompt())
        await waitFor(() => expect(result.current.visible).toBe(true))

        mockHasDirectAccess.mockReturnValue(true)
        await act(async () => mockForegroundCallback())

        expect(result.current.visible).toBe(false)
    })

    test('hides and remembers the choice when dismissed', async () => {
        const { result } = await renderHook(() => useDirectAccessPrompt())
        await waitFor(() => expect(result.current.visible).toBe(true))

        await act(async () => result.current.onDismiss())

        expect(result.current.visible).toBe(false)
        expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.DIRECT_ACCESS_DISMISSED, 'true')
    })

    test('stays hidden when it was dismissed before', async () => {
        mockGetItem.mockResolvedValue('true')

        const { result } = await renderHook(() => useDirectAccessPrompt())

        await waitFor(() => expect(mockGetItem).toHaveBeenCalled())
        expect(result.current.visible).toBe(false)
    })
})
