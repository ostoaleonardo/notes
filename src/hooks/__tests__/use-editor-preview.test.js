import { renderHook } from '@testing-library/react-native'

import { useEditorPreview } from '../use-editor-preview'
import { EDITOR_MODES } from '@/constants/editor-modes'

const mockPreviewMarkdown = jest.fn((value) => ({ value: `preview:${value}`, mediaMap: [['img', 'i']] }))
const mockBacklinks = jest.fn(() => 'backlinks')
const mockEmbedMediaMap = jest.fn(() => [['embed', 'e']])

jest.mock('../use-pdf-embed', () => ({
    usePdfEmbed: () => false
}))
jest.mock('../use-backlinks-html', () => ({
    useBacklinksHtml: (...args) => mockBacklinks(...args)
}))
jest.mock('../use-resolved-preview-markdown', () => ({
    useResolvedPreviewMarkdown: (...args) => mockPreviewMarkdown(...args)
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
    test('resolves the preview and the backlinks while reading', async () => {
        const { result } = await setup(EDITOR_MODES.READ)

        expect(result.current.previewValue).toBe('preview:text')
        expect(result.current.backlinksHtml).toBe('backlinks')
        expect(mockBacklinks).toHaveBeenCalledWith('a', true)
    })

    test('does not resolve the note text outside reading', async () => {
        await setup(EDITOR_MODES.LIVE)

        expect(mockPreviewMarkdown).toHaveBeenCalledWith('')
        expect(mockBacklinks).toHaveBeenCalledWith('a', false)
    })

    test('resolves the embedded media only in live mode', async () => {
        await setup(EDITOR_MODES.LIVE)
        await setup(EDITOR_MODES.READ)

        expect(mockEmbedMediaMap).toHaveBeenNthCalledWith(1, 'text', true, false)
        expect(mockEmbedMediaMap).toHaveBeenNthCalledWith(2, 'text', false, false)
    })

    test('joins the preview media with the embedded media', async () => {
        const { result } = await setup(EDITOR_MODES.LIVE)

        expect(result.current.mediaMapEntries).toEqual([['img', 'i'], ['embed', 'e']])
    })
})
