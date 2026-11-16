import { act, renderHook } from '@testing-library/react-native'

import { useCodeMode } from '../use-code-mode'

const setup = async (overrides = {}) => {
    const props = {
        content: {
            note: 'Body',
            tags: ['one'],
            properties: {},
            invalidFrontmatter: null,
            rawFrontmatter: null,
            ...overrides
        },
        update: jest.fn()
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
    test('propagates body and tags to the note state in a single update', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onChange('---\ntags: [two]\n---\n\nEdited'))

        expect(props.update).toHaveBeenCalledTimes(1)
        expect(props.update).toHaveBeenCalledWith({
            note: 'Edited',
            tags: ['two'],
            properties: {},
            invalidFrontmatter: null,
            rawFrontmatter: 'tags: [two]'
        })
        expect(result.current.codeBuffer).toBe('---\ntags: [two]\n---\n\nEdited')
    })

    test('propagates the extra properties to the note state', async () => {
        const { result, props } = await setup()

        await act(async () =>
            result.current.onChange('---\naliases: [Alias]\ntags: [two]\n---\n\nEdited')
        )

        expect(props.update.mock.calls[0][0].properties).toEqual({ aliases: ['Alias'] })
    })

    test('keeps the tags and stores the raw block when the yaml is invalid', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onChange('---\ntags: [two\n---\n\nEdited'))

        const changes = props.update.mock.calls[0][0]

        expect(changes).not.toHaveProperty('tags')
        expect(changes).not.toHaveProperty('properties')
        expect(changes.invalidFrontmatter).toBe('tags: [two')
        expect(changes.note).toBe('Edited')
    })
})
