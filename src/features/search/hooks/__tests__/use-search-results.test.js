import { act, renderHook } from '@testing-library/react-native'

import { useSearchResults } from '../use-search-results'
import { logError } from '@/shared/utils/log-error'
import { SourceOverflowError, searchIndex } from '@/shared/utils/search-index'
import { nativeSearch } from '@/shared/utils/native-search'
import { parseSearchQuery } from '@/shared/utils/search-parser'
import { MOCK_NOTE_PATHS, MOCK_SEARCH_NOTES } from '@/shared/utils/__fixtures__/search-query'

import { NOTE_SORTS } from '@/shared/constants/note-sort'

jest.mock('@/shared/constants/search-scan', () => ({
    SEARCH_SCAN_CHUNK_SIZE: 10,
    SEARCH_SORT_CHUNK_SIZE: 2000
}))
jest.mock('@/shared/utils/log-error', () => ({ logError: jest.fn() }))
jest.mock('@/shared/utils/native-search', () => ({
    nativeSearch: { isEligible: jest.fn(), open: jest.fn() }
}))
jest.mock('@/shared/utils/search-index', () => ({
    SourceOverflowError: class SourceOverflowError extends Error {},
    searchIndex: { createSource: jest.fn() }
}))

const PINNED = new Set()

const buildProps = (query, overrides = {}) => ({
    enabled: true,
    ast: parseSearchQuery(query),
    notes: MOCK_SEARCH_NOTES,
    notePaths: MOCK_NOTE_PATHS,
    pinned: PINNED,
    matchCase: false,
    sort: NOTE_SORTS.NAME_ASC,
    ...overrides
})

const paths = (result) => result.current.results.map((note) => note.path)

const flush = () => act(async () => {
    await jest.runAllTimersAsync()
})

describe('search results', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        logError.mockClear()
        searchIndex.createSource.mockReset()
        searchIndex.createSource.mockReturnValue(null)
        nativeSearch.isEligible.mockReset()
        nativeSearch.isEligible.mockReturnValue(false)
        nativeSearch.open.mockReset()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('is empty and finished while the search is disabled', async () => {
        const props = buildProps('agenda', { enabled: false })
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(result.current.results).toEqual([])
        expect(result.current.done).toBe(true)
        expect(searchIndex.createSource).not.toHaveBeenCalled()
    })

    test('finds the matching notes when the index is not available', async () => {
        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(paths(result)).toEqual(['note-3'])
        expect(result.current.done).toBe(true)
        expect(result.current.scanning).toBe(false)
    })

    test('uses the source that the index provides', async () => {
        const nextBatch = jest.fn()
            .mockResolvedValueOnce([MOCK_SEARCH_NOTES[2]])
            .mockResolvedValueOnce(null)
        searchIndex.createSource.mockReturnValue({ nextBatch })

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(paths(result)).toEqual(['note-3'])
    })

    test('lists the matches in the chosen order', async () => {
        const props = buildProps('e', { sort: NOTE_SORTS.NAME_DESC })
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(paths(result)).toEqual(['note-1', 'note-3', 'note-2'])
    })

    test('loads one more page each time it is asked', async () => {
        const notes = Array.from({ length: 120 }, (_, index) => ({
            path: `repo::n${String(index).padStart(3, '0')}.md`,
            filename: `n${String(index).padStart(3, '0')}.md`,
            title: `n${String(index).padStart(3, '0')}`,
            note: 'match',
            updatedAt: 1
        }))

        const props = buildProps('match', { notes, notePaths: new Map() })
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()
        expect(result.current.results).toHaveLength(50)
        expect(result.current.done).toBe(false)

        await act(async () => result.current.loadMore())
        await flush()
        expect(result.current.results).toHaveLength(100)

        await act(async () => result.current.loadMore())
        await flush()
        expect(result.current.results).toHaveLength(120)
        expect(result.current.done).toBe(true)
    })

    test('does not scan again once everything was found', async () => {
        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()
        await act(async () => result.current.loadMore())
        await flush()

        expect(paths(result)).toEqual(['note-3'])
        expect(result.current.done).toBe(true)
    })

    test('hides the previous results until the new search finds something', async () => {
        let release
        const pending = () => new Promise((resolve) => { release = resolve })

        searchIndex.createSource
            .mockReturnValueOnce(null)
            .mockReturnValueOnce({ nextBatch: jest.fn().mockImplementationOnce(pending).mockResolvedValue(null) })

        const props = buildProps('happy')
        const { result, rerender } = await renderHook((current) => useSearchResults(current), {
            initialProps: props
        })

        await flush()
        await rerender(buildProps('grocery'))

        expect(paths(result)).toEqual([])
        expect(result.current.scanning).toBe(true)

        await act(async () => release([MOCK_SEARCH_NOTES[1]]))
        await flush()

        expect(paths(result)).toEqual(['note-2'])
    })

    test('falls back to scanning the notes in memory when the index fails', async () => {
        const failure = new Error('locked')
        searchIndex.createSource.mockReturnValue({ nextBatch: jest.fn().mockRejectedValue(failure) })

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(logError).toHaveBeenCalledWith(expect.any(String), failure)
        expect(paths(result)).toEqual(['note-3'])
        expect(result.current.done).toBe(true)
    })

    test('falls back to memory without logging when the index has too many candidates', async () => {
        searchIndex.createSource.mockReturnValue({
            nextBatch: jest.fn().mockRejectedValue(new SourceOverflowError())
        })

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(logError).not.toHaveBeenCalled()
        expect(paths(result)).toEqual(['note-3'])
    })

    test('reports loading from the moment the search changes until its first results', async () => {
        let release
        const pending = () => new Promise((resolve) => { release = resolve })

        searchIndex.createSource
            .mockReturnValueOnce(null)
            .mockReturnValueOnce({ nextBatch: jest.fn().mockImplementationOnce(pending).mockResolvedValue(null) })

        const { result, rerender } = await renderHook((current) => useSearchResults(current), {
            initialProps: buildProps('happy')
        })

        await flush()
        expect(result.current.loading).toBe(false)

        await rerender(buildProps('grocery'))
        expect(result.current.loading).toBe(true)

        await act(async () => release([MOCK_SEARCH_NOTES[1]]))
        await flush()

        expect(result.current.loading).toBe(false)
    })

    test('is not loading while the search is disabled', async () => {
        const props = buildProps('happy', { enabled: false })
        const { result } = await renderHook(() => useSearchResults(props))

        expect(result.current.loading).toBe(false)
    })

    test('stays loading until the first match when the early notes do not match', async () => {
        let release
        const pending = () => new Promise((resolve) => { release = resolve })

        searchIndex.createSource.mockReturnValue({
            nextBatch: jest.fn().mockImplementationOnce(pending).mockResolvedValue(null)
        })

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        expect(result.current.loading).toBe(true)

        await act(async () => release([MOCK_SEARCH_NOTES[0]]))
        await flush()

        expect(result.current.results).toEqual([])
        expect(result.current.loading).toBe(false)
    })

    test('clears the results when the search is disabled', async () => {
        const props = buildProps('happy')
        const { result, rerender } = await renderHook((current) => useSearchResults(current), {
            initialProps: props
        })

        await flush()
        await rerender(buildProps('happy', { enabled: false }))

        expect(result.current.results).toEqual([])
    })

    describe('with the native search', () => {
        const createCursor = (batches) => {
            const next = jest.fn()

            batches.forEach((batch) => next.mockImplementationOnce(async (target, onProgress) => {
                if (batch.found.length) onProgress?.(batch.found)

                return batch
            }))

            return { next, close: jest.fn() }
        }

        beforeEach(() => {
            nativeSearch.isEligible.mockReturnValue(true)
        })

        test('shows what the native search finds', async () => {
            const cursor = createCursor([{ found: [MOCK_SEARCH_NOTES[2]], done: true }])
            nativeSearch.open.mockResolvedValue(cursor)

            const props = buildProps('happy')
            const { result } = await renderHook(() => useSearchResults(props))

            await flush()

            expect(paths(result)).toEqual(['note-3'])
            expect(result.current.done).toBe(true)
            expect(searchIndex.createSource).not.toHaveBeenCalled()
        })

        test('falls back to the other sources when the core cannot evaluate the query', async () => {
            nativeSearch.open.mockResolvedValue(null)

            const props = buildProps('happy')
            const { result } = await renderHook(() => useSearchResults(props))

            await flush()

            expect(paths(result)).toEqual(['note-3'])
            expect(searchIndex.createSource).toHaveBeenCalled()
        })

        test('falls back when the native search fails to open', async () => {
            nativeSearch.open.mockRejectedValue(new Error('no engine'))

            const props = buildProps('happy')
            const { result } = await renderHook(() => useSearchResults(props))

            await flush()

            expect(paths(result)).toEqual(['note-3'])
            expect(logError).toHaveBeenCalled()
        })

        test('falls back to scanning the notes when a native step fails', async () => {
            const cursor = createCursor([])
            cursor.next.mockRejectedValue(new Error('read failed'))
            nativeSearch.open.mockResolvedValue(cursor)

            const props = buildProps('happy')
            const { result } = await renderHook(() => useSearchResults(props))

            await flush()

            expect(cursor.close).toHaveBeenCalled()
            expect(paths(result)).toEqual(['note-3'])
            expect(result.current.done).toBe(true)
        })

        test('closes the native search when the search changes or ends', async () => {
            const cursor = createCursor([{ found: [], done: false }])
            nativeSearch.open.mockResolvedValue(cursor)

            const props = buildProps('happy')
            const { unmount } = await renderHook(() => useSearchResults(props))

            await flush()
            await unmount()

            expect(cursor.close).toHaveBeenCalled()
        })

        test('closes a native search that opens after the search was cancelled', async () => {
            const cursor = createCursor([])
            let release
            nativeSearch.open.mockReturnValue(new Promise((resolve) => { release = resolve }))

            const props = buildProps('happy')
            const { unmount } = await renderHook(() => useSearchResults(props))

            await unmount()
            await act(async () => release(cursor))

            expect(cursor.close).toHaveBeenCalled()
            expect(cursor.next).not.toHaveBeenCalled()
        })
    })
})
