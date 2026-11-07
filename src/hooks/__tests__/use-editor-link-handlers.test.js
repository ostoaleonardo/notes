import { Linking } from 'react-native'
import { act, renderHook } from '@testing-library/react-native'

import { useEditorLinkHandlers } from '../use-editor-link-handlers'
import { pushOnce } from '@/utils/navigation'
import { LINK_TYPES } from '@/constants/link-types'
import { ROUTES } from '@/constants/routes'

const mockSetMissing = jest.fn()
const mockLinkMention = jest.fn()
const mockOpenFile = jest.fn()
const mockResolveLinkPress = jest.fn()
const mockListFiles = jest.fn(() => [])
const mockMissingNote = { setMissing: mockSetMissing }

jest.mock('../use-missing-note', () => ({
    useMissingNote: () => mockMissingNote
}))
jest.mock('../use-mention-linker', () => ({
    useMentionLinker: () => mockLinkMention
}))
jest.mock('../use-attachment-files', () => ({
    useAttachmentFiles: () => mockListFiles
}))
jest.mock('../use-open-file', () => ({
    useOpenFile: () => mockOpenFile
}))
jest.mock('@/utils/link-press', () => ({
    resolveLinkPress: (...args) => mockResolveLinkPress(...args)
}))
jest.mock('@/utils/navigation', () => ({
    pushOnce: jest.fn()
}))

const setup = async () => {
    const props = { id: 'self', onTagPress: jest.fn(), onJumpToAnchor: jest.fn() }
    const rendered = await renderHook(() => useEditorLinkHandlers(props))

    return { props, ...rendered }
}

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined)
})

describe('link press', () => {
    test('ignores a link that cannot be resolved', async () => {
        mockResolveLinkPress.mockReturnValue(null)
        const { result } = await setup()

        await act(async () => result.current.onLinkPress('x'))

        expect(pushOnce).not.toHaveBeenCalled()
        expect(Linking.openURL).not.toHaveBeenCalled()
    })

    test('opens a tag search', async () => {
        mockResolveLinkPress.mockReturnValue({ type: LINK_TYPES.TAG, tag: 'work' })
        const { result, props } = await setup()

        await act(async () => result.current.onLinkPress('tag://work'))

        expect(props.onTagPress).toHaveBeenCalledWith('work')
    })

    test('asks to create a missing note', async () => {
        mockResolveLinkPress.mockReturnValue({ type: LINK_TYPES.MISSING_NOTE, missing: 'Ghost' })
        const { result } = await setup()

        await act(async () => result.current.onLinkPress('x'))

        expect(mockSetMissing).toHaveBeenCalledWith('Ghost')
    })

    test('jumps inside the current note when the anchor targets it', async () => {
        mockResolveLinkPress.mockReturnValue({ type: LINK_TYPES.NOTE, id: 'self', anchor: 'intro' })
        const { result, props } = await setup()

        await act(async () => result.current.onLinkPress('x'))

        expect(props.onJumpToAnchor).toHaveBeenCalledWith('intro')
        expect(pushOnce).not.toHaveBeenCalled()
    })

    test('navigates to another note', async () => {
        mockResolveLinkPress.mockReturnValue({ type: LINK_TYPES.NOTE, id: 'other', anchor: null })
        const { result } = await setup()

        await act(async () => result.current.onLinkPress('x'))

        expect(pushOnce).toHaveBeenCalledTimes(1)
    })

    test('links a mention', async () => {
        mockResolveLinkPress.mockReturnValue({ type: LINK_TYPES.LINK_MENTION, path: 'p' })
        const { result } = await setup()

        await act(async () => result.current.onLinkPress('x'))

        expect(mockLinkMention).toHaveBeenCalledWith('p')
    })

    test('opens an external url by default', async () => {
        mockResolveLinkPress.mockReturnValue({ type: 'web', url: 'https://example.com' })
        const { result } = await setup()

        await act(async () => result.current.onLinkPress('x'))

        expect(Linking.openURL).toHaveBeenCalledWith('https://example.com')
    })
})

describe('image press', () => {
    test('opens the image viewer with the encoded url', async () => {
        const { result } = await setup()

        await act(async () => result.current.onImagePress('a b'))

        expect(pushOnce).toHaveBeenCalledWith({
            pathname: ROUTES.IMAGE_VIEWER,
            params: { url: encodeURIComponent('a b') }
        })
    })
})

describe('missing note', () => {
    test('exposes the missing note state', async () => {
        const { result } = await setup()

        expect(result.current.missingNote).toBe(mockMissingNote)
    })
})
