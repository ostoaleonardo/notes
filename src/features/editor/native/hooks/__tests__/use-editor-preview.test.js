import { renderHook } from '@testing-library/react-native'

import { useEditorPreview } from '../use-editor-preview'
import { EDITOR_MODES } from '@/shared/constants/editor-modes'

const mockBacklinks = jest.fn(() => 'backlinks')
const mockEmbedMediaMap = jest.fn(() => new Map([['embed', 'e']]))

jest.mock('../use-pdf-embed', () => ({
    usePdfEmbed: () => false
}))
jest.mock('../use-backlinks-html', () => ({
    useBacklinksHtml: (...args) => mockBacklinks(...args)
}))
jest.mock('../use-embed-media-map', () => ({
    useEmbedMediaMap: (...args) => mockEmbedMediaMap(...args)
}))

const setup = (mode) => renderHook(() => useEditorPreview({
    id: 'a',
    mode,
    value: 'text',
    showBacklinks: true
}))

beforeEach(() => jest.clearAllMocks())

describe('editor preview', () => {
    test('hands the note text and the backlinks to the reader while reading', async () => {
        const { result } = await setup(EDITOR_MODES.READ)

        expect(result.current.readValue).toBe('text')
        expect(result.current.backlinksHtml).toBe('backlinks')
        expect(mockBacklinks).toHaveBeenCalledWith('a', true)
    })

    test('hands over no note text outside reading', async () => {
        const { result } = await setup(EDITOR_MODES.LIVE)

        expect(result.current.readValue).toBe('')
        expect(mockBacklinks).toHaveBeenCalledWith('a', false)
    })

    test('resolves the embedded media only in live mode', async () => {
        await setup(EDITOR_MODES.LIVE)
        await setup(EDITOR_MODES.READ)

        expect(mockEmbedMediaMap).toHaveBeenNthCalledWith(1, 'text', true, false)
        expect(mockEmbedMediaMap).toHaveBeenNthCalledWith(2, 'text', false, false)
    })

    test('exposes the embedded media as serializable entries', async () => {
        const { result } = await setup(EDITOR_MODES.LIVE)

        expect(result.current.mediaMapEntries).toEqual([['embed', 'e']])
    })
})
