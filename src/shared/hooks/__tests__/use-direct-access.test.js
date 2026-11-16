import { act, renderHook } from '@testing-library/react-native'

import { useDirectAccess } from '../use-direct-access'

const mockHasDirectAccess = jest.fn()
const mockRequestDirectAccess = jest.fn()

let mockForegroundCallback = null

jest.mock('../use-on-foreground', () => ({
    useOnForeground: (callback) => { mockForegroundCallback = callback }
}))
jest.mock('../../utils/direct-access', () => ({
    hasDirectAccess: () => mockHasDirectAccess(),
    requestDirectAccess: () => mockRequestDirectAccess()
}))

beforeEach(() => {
    jest.clearAllMocks()
    mockHasDirectAccess.mockReturnValue(false)
})

describe('direct access', () => {
    test('starts with the current permission state', async () => {
        mockHasDirectAccess.mockReturnValue(true)

        const { result } = await renderHook(() => useDirectAccess())

        expect(result.current.granted).toBe(true)
    })

    test('checks the permission again when the app returns to the foreground', async () => {
        const { result } = await renderHook(() => useDirectAccess())
        expect(result.current.granted).toBe(false)

        mockHasDirectAccess.mockReturnValue(true)
        await act(async () => mockForegroundCallback())

        expect(result.current.granted).toBe(true)
    })

    test('opens the system screen to change it', async () => {
        const { result } = await renderHook(() => useDirectAccess())

        result.current.request()

        expect(mockRequestDirectAccess).toHaveBeenCalledTimes(1)
    })
})
