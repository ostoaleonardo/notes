import { act, renderHook } from '@testing-library/react-native'

import { useWikiLinkRenameConfirm } from '../use-wiki-link-rename-confirm'

const mockUpdateNote = jest.fn(async (note) => ({ path: note.path }))
const mockPropagateWikiLinkRename = jest.fn()
let mockNotes = []
let mockStoredValue = null

jest.mock('../use-notes', () => ({
    useNotes: () => ({
        notes: mockNotes,
        notePaths: new Map(mockNotes.map((note) => [note.path, ''])),
        updateNote: mockUpdateNote,
        propagateWikiLinkRename: mockPropagateWikiLinkRename
    })
}))

jest.mock('../use-storage', () => ({
    useStorage: () => ({
        getItem: jest.fn(async () => mockStoredValue),
        setItem: jest.fn(async (_key, value) => { mockStoredValue = value })
    })
}))

beforeEach(() => {
    jest.clearAllMocks()
    mockNotes = []
    mockStoredValue = null
})

const renderConfirmHook = async () => {
    let rendered

    await act(async () => {
        rendered = renderHook(() => useWikiLinkRenameConfirm())
    })

    return rendered
}

test('always saves the note through updateNote, even without a title change', async () => {
    const { result } = await renderConfirmHook()

    await act(async () => {
        await result.current.saveWithLinkCheck({ path: 'a', title: 'Same' }, 'Same')
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({ path: 'a', title: 'Same' })
    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.visible).toBe(false)
})

test('saves without asking when the title changes and nothing links to the old one', async () => {
    mockNotes = [
        { path: 'a', title: 'Old', note: '' },
        { path: 'b', title: 'Other', note: 'no links here' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        await result.current.saveWithLinkCheck({ path: 'a', title: 'New' }, 'Old')
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({ path: 'a', title: 'New' })
    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.visible).toBe(false)
})

test('rewrites the note\'s own self-referencing wiki-links when its title changes', async () => {
    mockNotes = [{ path: 'a', title: 'Old', note: 'See also [[Old]] for context' }]
    const { result } = await renderConfirmHook()
    let outcome

    await act(async () => {
        outcome = await result.current.saveWithLinkCheck(
            { path: 'a', title: 'New', note: 'See also [[Old]] for context' },
            'Old'
        )
    })

    const expectedNote = { path: 'a', title: 'New', note: 'See also [[New]] for context' }

    expect(mockUpdateNote).toHaveBeenCalledWith(expectedNote)
    expect(outcome.savedNote).toEqual(expectedNote)
})

test('keeps the note body when the title is unchanged, even if it self-links', async () => {
    mockNotes = [{ path: 'a', title: 'Same', note: 'See also [[Same]]' }]
    const { result } = await renderConfirmHook()

    await act(async () => {
        await result.current.saveWithLinkCheck(
            { path: 'a', title: 'Same', note: 'See also [[Same]]' },
            'Same'
        )
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({
        path: 'a',
        title: 'Same',
        note: 'See also [[Same]]'
    })
})

test('opens the confirm dialog when other notes link to the renamed title', async () => {
    mockNotes = [
        { path: 'a', title: 'Old', note: '' },
        { path: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        await result.current.saveWithLinkCheck({ path: 'a', title: 'New' }, 'Old')
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({ path: 'a', title: 'New' })
    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.visible).toBe(true)
    expect(result.current.linksCount).toBe(1)
})

test('onConfirmOnce propagates the rename without persisting a preference', async () => {
    mockNotes = [
        { path: 'a', title: 'Old', note: '' },
        { path: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        await result.current.saveWithLinkCheck({ path: 'a', title: 'New' }, 'Old')
    })

    await act(async () => {
        result.current.onConfirmOnce()
    })

    expect(mockPropagateWikiLinkRename).toHaveBeenCalledWith('a', 'New', mockNotes, expect.any(Map))
    expect(result.current.visible).toBe(false)
    expect(mockStoredValue).toBe(null)
})

test('confirming always propagates the rename and persists the preference', async () => {
    mockNotes = [
        { path: 'a', title: 'Old', note: '' },
        { path: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        await result.current.saveWithLinkCheck({ path: 'a', title: 'New' }, 'Old')
    })

    await act(async () => {
        await result.current.onConfirmAlways()
    })

    expect(mockPropagateWikiLinkRename).toHaveBeenCalledWith('a', 'New', mockNotes, expect.any(Map))
    expect(mockStoredValue).toBe('true')
    expect(result.current.visible).toBe(false)

    mockPropagateWikiLinkRename.mockClear()

    await act(async () => {
        await result.current.saveWithLinkCheck({ path: 'a', title: 'Another title' }, 'Old')
    })

    expect(mockPropagateWikiLinkRename).toHaveBeenCalledWith(
        'a',
        'Another title',
        mockNotes,
        expect.any(Map)
    )
    expect(result.current.visible).toBe(false)
})

test('onDismiss discards the pending rename without propagating it', async () => {
    mockNotes = [
        { path: 'a', title: 'Old', note: '' },
        { path: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        await result.current.saveWithLinkCheck({ path: 'a', title: 'New' }, 'Old')
    })

    await act(async () => {
        result.current.onDismiss()
    })

    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.visible).toBe(false)
})
