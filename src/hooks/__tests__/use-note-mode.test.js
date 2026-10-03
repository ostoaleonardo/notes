import { act, renderHook } from '@testing-library/react-native'

import { useNoteMode } from '../use-note-mode'
import { EDITOR_MODES } from '@/constants/editor-modes'

const mockCodeMode = {
    enter: jest.fn(),
    onChange: jest.fn(),
    codeBuffer: 'buffer'
}

jest.mock('../use-code-mode', () => ({
    useCodeMode: () => mockCodeMode
}))

const setup = async (overrides = {}) => {
    const props = {
        initialMode: EDITOR_MODES.READ,
        note: 'body',
        setNote: jest.fn(),
        ...overrides
    }

    const rendered = await renderHook(() => useNoteMode(props))

    return { props, ...rendered }
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('note mode', () => {
    test('starts in the initial mode showing the note body', async () => {
        const { result } = await setup()

        expect(result.current.mode).toBe(EDITOR_MODES.READ)
        expect(result.current.editorValue).toBe('body')
    })

    test('routes edits straight to the note outside code mode', async () => {
        const { result, props } = await setup()

        expect(result.current.onEditorChange).toBe(props.setNote)
    })

    test('enters code mode and shows its buffer', async () => {
        const { result } = await setup()

        await act(async () => result.current.onSetMode(EDITOR_MODES.CODE))

        expect(mockCodeMode.enter).toHaveBeenCalledTimes(1)
        expect(result.current.mode).toBe(EDITOR_MODES.CODE)
        expect(result.current.editorValue).toBe('buffer')
        expect(result.current.onEditorChange).toBe(mockCodeMode.onChange)
    })

    test('ignores switching to the current mode', async () => {
        const { result } = await setup({ initialMode: EDITOR_MODES.CODE })

        await act(async () => result.current.onSetMode(EDITOR_MODES.CODE))

        expect(mockCodeMode.enter).not.toHaveBeenCalled()
    })

    test('leaves code mode without re-entering it', async () => {
        const { result } = await setup({ initialMode: EDITOR_MODES.CODE })

        await act(async () => result.current.onSetMode(EDITOR_MODES.READ))

        expect(mockCodeMode.enter).not.toHaveBeenCalled()
        expect(result.current.mode).toBe(EDITOR_MODES.READ)
        expect(result.current.editorValue).toBe('body')
    })
})
