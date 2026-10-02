import { act, renderHook } from '@testing-library/react-native'

import { useCodeMode } from '../use-code-mode'

const mockAddTag = jest.fn()
let mockAllTags = []

jest.mock('../use-tags', () => ({
    useTags: () => ({ tags: mockAllTags, addTag: mockAddTag })
}))

const setup = async (overrides = {}) => {
    const props = {
        note: 'Body',
        tags: ['one'],
        invalidFrontmatter: null,
        setNote: jest.fn(),
        setTags: jest.fn(),
        setInvalidFrontmatter: jest.fn(),
        ...overrides
    }

    const rendered = await renderHook(() => useCodeMode(props))

    return { props, ...rendered }
}

beforeEach(() => {
    jest.clearAllMocks()
    mockAllTags = []
})

describe('enter code mode', () => {
    test('composes the buffer from tags and body', async () => {
        const { result } = await setup()

        await act(async () => result.current.enter())

        expect(result.current.codeBuffer).toBe('---\ntags:\n  - one\n---\n\nBody')
    })

    test('composes the buffer from the invalid frontmatter when present', async () => {
        const { result } = await setup({ invalidFrontmatter: 'a: [' })

        await act(async () => result.current.enter())

        expect(result.current.codeBuffer).toBe('---\na: [\n---\n\nBody')
    })
})

describe('edit in code mode', () => {
    test('propagates body and tags to the note state on every change', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onChange('---\ntags: [two]\n---\n\nEdited'))

        expect(props.setNote).toHaveBeenCalledWith('Edited')
        expect(props.setTags).toHaveBeenCalledWith(['two'])
        expect(props.setInvalidFrontmatter).toHaveBeenCalledWith(null)
        expect(result.current.codeBuffer).toBe('---\ntags: [two]\n---\n\nEdited')
    })

    test('keeps the tags and stores the raw block when the yaml is invalid', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onChange('---\ntags: [two\n---\n\nEdited'))

        expect(props.setTags).not.toHaveBeenCalled()
        expect(props.setInvalidFrontmatter).toHaveBeenCalledWith('tags: [two')
        expect(props.setNote).toHaveBeenCalledWith('Edited')
    })
})

describe('leave code mode', () => {
    test('registers only the tags missing from the global list', async () => {
        mockAllTags = ['one']
        const { result } = await setup({ tags: ['one', 'two'] })

        await act(async () => result.current.leave())

        expect(mockAddTag).toHaveBeenCalledTimes(1)
        expect(mockAddTag).toHaveBeenCalledWith('two')
    })
})
