import { act, renderHook } from '@testing-library/react-native'

import { useCodeMode } from '../use-code-mode'

const setup = async (overrides = {}) => {
    const props = {
        note: 'Body',
        tags: ['one'],
        properties: {},
        invalidFrontmatter: null,
        setNote: jest.fn(),
        setTags: jest.fn(),
        setProperties: jest.fn(),
        setInvalidFrontmatter: jest.fn(),
        setRawFrontmatter: jest.fn(),
        ...overrides
    }

    const rendered = await renderHook(() => useCodeMode(props))

    return { props, ...rendered }
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('enter code mode', () => {
    test('composes the buffer from tags and body', async () => {
        const { result } = await setup()

        await act(async () => result.current.enter())

        expect(result.current.codeBuffer).toBe('---\ntags:\n  - one\n---\n\nBody')
    })

    test('writes the extra properties into the buffer', async () => {
        const { result } = await setup({ properties: { aliases: ['Alias'] } })

        await act(async () => result.current.enter())

        expect(result.current.codeBuffer).toBe(
            '---\naliases:\n  - Alias\ntags:\n  - one\n---\n\nBody'
        )
    })

    test('keeps the yaml comments of the raw block in the buffer', async () => {
        const { result } = await setup({ rawFrontmatter: 'tags:\n  - one # keep' })

        await act(async () => result.current.enter())

        expect(result.current.codeBuffer).toBe('---\ntags:\n  - one # keep\n---\n\nBody')
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
        expect(props.setRawFrontmatter).toHaveBeenCalledWith('tags: [two]')
        expect(result.current.codeBuffer).toBe('---\ntags: [two]\n---\n\nEdited')
    })

    test('propagates the extra properties to the note state', async () => {
        const { result, props } = await setup()

        await act(async () =>
            result.current.onChange('---\naliases: [Alias]\ntags: [two]\n---\n\nEdited')
        )

        expect(props.setProperties).toHaveBeenCalledWith({ aliases: ['Alias'] })
    })

    test('keeps the tags and stores the raw block when the yaml is invalid', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onChange('---\ntags: [two\n---\n\nEdited'))

        expect(props.setTags).not.toHaveBeenCalled()
        expect(props.setProperties).not.toHaveBeenCalled()
        expect(props.setInvalidFrontmatter).toHaveBeenCalledWith('tags: [two')
        expect(props.setNote).toHaveBeenCalledWith('Edited')
    })
})
