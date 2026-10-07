import { act, renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'

import { useMissingNote } from '../use-missing-note'

const mockSaveNote = jest.fn()

const mockRepositories = [
    { id: 'root', alias: 'Root', parentId: null },
    { id: 'work', alias: 'Work', parentId: 'root' }
]

jest.mock('expo-router', () => ({
    router: { push: jest.fn() }
}))
jest.mock('../use-notes', () => ({
    useNotes: () => ({ saveNote: mockSaveNote })
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({ repositories: mockRepositories })
}))

beforeEach(() => {
    jest.clearAllMocks()
    mockSaveNote.mockResolvedValue({ path: 'work::Ideas.md' })
})

describe('missing note', () => {
    test('starts with nothing missing', async () => {
        const { result } = await renderHook(() => useMissingNote())

        expect(result.current.missing).toBeNull()
    })

    test('dismisses the pending missing note', async () => {
        const { result } = await renderHook(() => useMissingNote())

        await act(async () => result.current.setMissing({ path: '', title: 'Ideas' }))
        await act(async () => result.current.dismiss())

        expect(result.current.missing).toBeNull()
    })

    test('creates the note in the repository matching the link folder and opens it', async () => {
        const { result } = await renderHook(() => useMissingNote())

        await act(async () => result.current.setMissing({ path: 'Work', title: 'Ideas' }))
        await act(async () => result.current.create())

        expect(mockSaveNote).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Ideas', note: '', tags: [] }),
            'work'
        )
        expect(router.push).toHaveBeenCalledTimes(1)
    })

    test('creates the note in the default repository when the folder is unknown', async () => {
        const { result } = await renderHook(() => useMissingNote())

        await act(async () => result.current.setMissing({ path: 'Nowhere', title: 'Ideas' }))
        await act(async () => result.current.create())

        expect(mockSaveNote).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Ideas' }),
            undefined
        )
    })
})
