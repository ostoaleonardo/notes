import { renderHook } from '@testing-library/react-native'

import { useMentionLinker } from '../use-mention-linker'

const mockGetNote = jest.fn()
const mockUpdateNote = jest.fn()
const mockLinkMentions = jest.fn()

jest.mock('../use-notes', () => ({
    useNotes: () => ({ getNote: mockGetNote, updateNote: mockUpdateNote })
}))

jest.mock('@/utils/unlinked-mentions', () => ({
    linkMentions: (...args) => mockLinkMentions(...args)
}))

const target = { path: 'target', title: 'Target' }
const source = { path: 'source', note: 'mention Target' }

const setup = async () => {
    mockGetNote.mockImplementation((path) => (
        { target, source }[path] || {}
    ))

    return renderHook(() => useMentionLinker('target'))
}

describe('mention linker', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('rewrites the source note with the linked text', async () => {
        mockLinkMentions.mockReturnValue('mention [[Target]]')
        const { result } = await setup()

        await result.current('source')

        expect(mockLinkMentions).toHaveBeenCalledWith('mention Target', target)
        expect(mockUpdateNote).toHaveBeenCalledWith({
            ...source,
            note: 'mention [[Target]]'
        })
    })

    test('does not update when nothing changed', async () => {
        mockLinkMentions.mockReturnValue('mention Target')
        const { result } = await setup()

        await result.current('source')

        expect(mockUpdateNote).not.toHaveBeenCalled()
    })

    test('does nothing when the source note does not exist', async () => {
        const { result } = await setup()

        await result.current('missing')

        expect(mockLinkMentions).not.toHaveBeenCalled()
        expect(mockUpdateNote).not.toHaveBeenCalled()
    })
})
