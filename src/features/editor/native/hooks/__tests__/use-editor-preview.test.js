import { renderHook } from '@testing-library/react-native'

import { useEditorPreview } from '../use-editor-preview'
import { EDITOR_MODES } from '@/shared/constants/editor-modes'

const mockBacklinks = jest.fn(() => 'backlinks')

jest.mock('../use-backlinks-html', () => ({
    useBacklinksHtml: (...args) => mockBacklinks(...args)
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
})
