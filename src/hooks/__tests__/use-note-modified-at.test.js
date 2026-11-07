import { renderHook } from '@testing-library/react-native'

import { useNoteModifiedAt } from '../use-note-modified-at'
import { NoteContext } from '@/context/note-context'

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))

const buildWrapper = (notes) => {
    const value = { notesByPath: new Map(notes.map((note) => [note.path, note])) }

    return ({ children }) => <NoteContext.Provider value={value}>{children}</NoteContext.Provider>
}

describe('note modified date', () => {
    test('returns the update date stored from the file metadata', async () => {
        const wrapper = buildWrapper([{ path: 'a', createdAt: 10, updatedAt: 20 }])

        const { result } = await renderHook(() => useNoteModifiedAt('a'), { wrapper })

        expect(result.current).toBe(20)
    })

    test('falls back to the creation date', async () => {
        const wrapper = buildWrapper([{ path: 'a', createdAt: 10 }])

        const { result } = await renderHook(() => useNoteModifiedAt('a'), { wrapper })

        expect(result.current).toBe(10)
    })

    test('is empty when the note does not exist yet', async () => {
        const wrapper = buildWrapper([])

        const { result } = await renderHook(() => useNoteModifiedAt('missing'), { wrapper })

        expect(result.current).toBe('')
    })

    test('is empty without a path', async () => {
        const wrapper = buildWrapper([{ path: 'a', updatedAt: 20 }])

        const { result } = await renderHook(() => useNoteModifiedAt(''), { wrapper })

        expect(result.current).toBe('')
    })
})
