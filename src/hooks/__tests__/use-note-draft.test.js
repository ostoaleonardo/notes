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

    test('starts from the initial note when one is given', async () => {
        const initial = {
            title: 'Saved',
            note: 'body',
            tags: ['x'],
            properties: { status: 'done' },
            repositoryId: 'r1',
            filename: 'a.md'
        }

        const { result } = await renderHook(() => useNoteDraft(pathRef, initial))

        expect(result.current.title).toBe('Saved')
        expect(result.current.note).toBe('body')
        expect(result.current.tags).toEqual(['x'])
        expect(result.current.properties).toEqual({ status: 'done' })
        expect(result.current.filename).toBe('a.md')
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

    test('applies several changes in a single update', async () => {
        let renders = 0
        const { result } = await renderHook(() => {
            renders++
            return useNoteDraft(pathRef)
        })
        const before = renders

        await act(async () => {
            result.current.update({ title: 'T', note: 'body', tags: ['x'] })
        })

        expect(result.current.title).toBe('T')
        expect(result.current.note).toBe('body')
        expect(result.current.tags).toEqual(['x'])
        expect(renders - before).toBe(1)
    })

    test('ignores unknown fields in an update', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef))

        await act(async () => result.current.update({ unknown: 1 }))

        expect(result.current.editorProps).not.toHaveProperty('unknown')
    })

    test('keeps the draft untouched when an update changes nothing', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef, { tags: ['x'] }))
        const tags = result.current.tags

        await act(async () => result.current.update({ tags }))
        await act(async () => result.current.setNote(''))

        expect(result.current.tags).toBe(tags)
    })

    test('lets a setter derive the next value from the current one', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef, { tags: ['a'] }))

        await act(async () => {
            result.current.setTags((previous) => [...previous, 'b'])
            result.current.setTags((previous) => [...previous, 'c'])
        })

        expect(result.current.tags).toEqual(['a', 'b', 'c'])
    })

    test('keeps the setters stable between renders', async () => {
        const { result, rerender } = await renderHook(() => useNoteDraft(pathRef))
        const { setNote, setTags, update } = result.current

        await act(async () => result.current.setNote('changed'))
        await rerender()

        expect(result.current.setNote).toBe(setNote)
        expect(result.current.setTags).toBe(setTags)
        expect(result.current.update).toBe(update)
    })

    test('keeps untouched fields referentially stable when another field changes', async () => {
        const { result } = await renderHook(() => useNoteDraft(pathRef, { properties: { a: 1 } }))
        const properties = result.current.properties

        await act(async () => result.current.setNote('changed'))

        expect(result.current.properties).toBe(properties)
    })
})
