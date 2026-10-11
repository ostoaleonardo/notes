import { act, renderHook } from '@testing-library/react-native'

import { useNoteDraft } from '../use-note-draft'

const pathRef = { current: { repositoryId: 'r1', filename: 'a.md' } }

describe('note draft', () => {
    test('starts empty', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef))

        expect(result.current.title).toBe('')
        expect(result.current.note).toBe('')
        expect(result.current.tags).toEqual([])
        expect(result.current.properties).toEqual({})
        expect(result.current.invalidFrontmatter).toBeNull()
    })

    test('builds a trimmed payload from the current draft', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef))

        await act(async () => {
            result.current.setNote('  body  ')
            result.current.setTags(['x'])
            result.current.setRepositoryId('r1')
        })

        expect(result.current.buildPayload('  Title  ')).toEqual({
            path: pathRef.current,
            title: 'Title',
            note: 'body',
            tags: ['x'],
            properties: {},
            repositoryId: 'r1',
            invalidFrontmatter: null,
            rawFrontmatter: null
        })
    })

    test('lets the payload override the note body', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef))

        await act(async () => result.current.setNote('old'))

        expect(result.current.buildPayload('T', 'new').note).toBe('new')
    })

    test('keeps the same payload builder while the draft is unchanged', async () => {
        const { result, rerender } = await renderHook(() => useNoteDraft(pathRef))
        const first = result.current.buildPayload

        await rerender()

        expect(result.current.buildPayload).toBe(first)
    })

    test('creates a new payload builder when the draft changes', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef))
        const first = result.current.buildPayload

        await act(async () => result.current.setTags(['y']))

        expect(result.current.buildPayload).not.toBe(first)
    })

    test('exposes the editor props without the repository setters', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef))

        expect(result.current.editorProps).toHaveProperty('setTitle')
        expect(result.current.editorProps).not.toHaveProperty('setRepositoryId')
        expect(result.current.editorProps).not.toHaveProperty('setFilename')
    })
})
