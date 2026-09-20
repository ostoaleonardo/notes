import { act, renderHook } from '@testing-library/react-native'

import { useWikiLinkRenameConfirm } from '../use-wiki-link-rename-confirm'

const mockUpdateNote = jest.fn()
const mockPropagateWikiLinkRename = jest.fn()
let mockNotes = []
let mockStoredValue = null

jest.mock('../use-notes', () => ({
    useNotes: () => ({
        notes: mockNotes,
        updateNote: mockUpdateNote,
        propagateWikiLinkRename: mockPropagateWikiLinkRename
    })
}))

jest.mock('../use-repositories', () => ({
    useRepositories: () => ({ repositories: [] })
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
        result.current.saveNote({ id: 'a', title: 'Same' }, 'Same')
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({ id: 'a', title: 'Same' })
    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.dialogVisible).toBe(false)
})

test('saves the note without asking when the title changes but nothing links to the old title', async () => {
    mockNotes = [
        { id: 'a', title: 'Old', note: '' },
        { id: 'b', title: 'Other', note: 'no links here' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        result.current.saveNote({ id: 'a', title: 'New' }, 'Old')
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({ id: 'a', title: 'New' })
    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.dialogVisible).toBe(false)
})

test('rewrites the note\'s own self-referencing wiki-links when its title changes', async () => {
    mockNotes = [{ id: 'a', title: 'Old', note: 'See also [[Old]] for context' }]
    const { result } = await renderConfirmHook()
    let savedNote

    await act(async () => {
        savedNote = result.current.saveNote({ id: 'a', title: 'New', note: 'See also [[Old]] for context' }, 'Old')
    })

    const expectedNote = { id: 'a', title: 'New', note: 'See also [[New]] for context' }

    expect(mockUpdateNote).toHaveBeenCalledWith(expectedNote)
    expect(savedNote).toEqual(expectedNote)
})

test('does not touch the note body when the title is unchanged, even if it self-links', async () => {
    mockNotes = [{ id: 'a', title: 'Same', note: 'See also [[Same]]' }]
    const { result } = await renderConfirmHook()

    await act(async () => {
        result.current.saveNote({ id: 'a', title: 'Same', note: 'See also [[Same]]' }, 'Same')
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({ id: 'a', title: 'Same', note: 'See also [[Same]]' })
})

test('opens the confirm dialog when other notes link to the renamed title', async () => {
    mockNotes = [
        { id: 'a', title: 'Old', note: '' },
        { id: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        result.current.saveNote({ id: 'a', title: 'New' }, 'Old')
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({ id: 'a', title: 'New' })
    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.dialogVisible).toBe(true)
    expect(result.current.linksCount).toBe(1)
})

test('onConfirmOnce propagates the rename without persisting a preference', async () => {
    mockNotes = [
        { id: 'a', title: 'Old', note: '' },
        { id: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        result.current.saveNote({ id: 'a', title: 'New' }, 'Old')
    })

    await act(async () => {
        result.current.onConfirmOnce()
    })

    expect(mockPropagateWikiLinkRename).toHaveBeenCalledWith('a', 'New', mockNotes, expect.any(Map))
    expect(result.current.dialogVisible).toBe(false)
    expect(mockStoredValue).toBe(null)
})

test('onConfirmAlways propagates the rename and persists the preference for future saves', async () => {
    mockNotes = [
        { id: 'a', title: 'Old', note: '' },
        { id: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        result.current.saveNote({ id: 'a', title: 'New' }, 'Old')
    })

    await act(async () => {
        await result.current.onConfirmAlways()
    })

    expect(mockPropagateWikiLinkRename).toHaveBeenCalledWith('a', 'New', mockNotes, expect.any(Map))
    expect(mockStoredValue).toBe('true')
    expect(result.current.dialogVisible).toBe(false)

    mockPropagateWikiLinkRename.mockClear()

    await act(async () => {
        result.current.saveNote({ id: 'a', title: 'Another title' }, 'Old')
    })

    expect(mockPropagateWikiLinkRename).toHaveBeenCalledWith('a', 'Another title', mockNotes, expect.any(Map))
    expect(result.current.dialogVisible).toBe(false)
})

test('onDismiss discards the pending rename without propagating it', async () => {
    mockNotes = [
        { id: 'a', title: 'Old', note: '' },
        { id: 'b', title: 'Linker', note: 'See [[Old]] for details' }
    ]
    const { result } = await renderConfirmHook()

    await act(async () => {
        result.current.saveNote({ id: 'a', title: 'New' }, 'Old')
    })

    await act(async () => {
        result.current.onDismiss()
    })

    expect(mockPropagateWikiLinkRename).not.toHaveBeenCalled()
    expect(result.current.dialogVisible).toBe(false)
})
