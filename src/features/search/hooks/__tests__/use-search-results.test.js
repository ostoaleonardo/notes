import { act, renderHook } from '@testing-library/react-native'

import { useSearchResults } from '../use-search-results'
import { logError } from '@/shared/utils/log-error'
import { nativeSearch } from '@/shared/utils/native-search'
import { parseSearchQuery } from '@/shared/utils/search-parser'
import { MOCK_NOTE_PATHS, MOCK_SEARCH_NOTES } from '@/shared/utils/__fixtures__/search-query'

import { NOTE_SORTS } from '@/shared/constants/note-sort'

jest.mock('@/shared/utils/log-error', () => ({ logError: jest.fn() }))
jest.mock('@/shared/utils/native-search', () => ({
    nativeSearch: { open: jest.fn() }
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

const createCursor = (batches) => {
    const next = jest.fn()

    batches.forEach((batch) => next.mockImplementationOnce(async (target, onProgress) => {
        if (batch.found.length) onProgress?.(batch.found)

        return batch
    }))

    return { next, close: jest.fn() }
}

describe('search results', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        logError.mockClear()
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
        expect(nativeSearch.open).not.toHaveBeenCalled()
    })

    test('shows what the native search finds', async () => {
        nativeSearch.open.mockResolvedValue(
            createCursor([{ found: [MOCK_SEARCH_NOTES[2]], done: true }])
        )

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(paths(result)).toEqual(['note-3'])
        expect(result.current.done).toBe(true)
        expect(result.current.scanning).toBe(false)
    })

    test('loads one more page each time it is asked', async () => {
        const cursor = createCursor([
            { found: [MOCK_SEARCH_NOTES[0]], done: false },
            { found: [MOCK_SEARCH_NOTES[1]], done: true }
        ])
        nativeSearch.open.mockResolvedValue(cursor)

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(paths(result)).toEqual([MOCK_SEARCH_NOTES[0].path])
        expect(result.current.done).toBe(false)

        await act(async () => {
            result.current.loadMore()
            await jest.runAllTimersAsync()
        })

        expect(paths(result)).toEqual([MOCK_SEARCH_NOTES[0].path, MOCK_SEARCH_NOTES[1].path])
        expect(result.current.done).toBe(true)
    })

    test('does not ask for more once everything was found', async () => {
        const cursor = createCursor([{ found: [MOCK_SEARCH_NOTES[2]], done: true }])
        nativeSearch.open.mockResolvedValue(cursor)

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()
        await act(async () => {
            result.current.loadMore()
            await jest.runAllTimersAsync()
        })

        expect(cursor.next).toHaveBeenCalledTimes(1)
    })

    test('finishes with no results when the core cannot evaluate the query', async () => {
        nativeSearch.open.mockResolvedValue(null)

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(result.current.results).toEqual([])
        expect(result.current.done).toBe(true)
        expect(result.current.loading).toBe(false)
        expect(logError).not.toHaveBeenCalled()
    })

    test('finishes and logs when the native search fails to open', async () => {
        nativeSearch.open.mockRejectedValue(new Error('no engine'))

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(result.current.results).toEqual([])
        expect(result.current.done).toBe(true)
        expect(logError).toHaveBeenCalled()
    })

    test('finishes and logs when a native step fails', async () => {
        const cursor = createCursor([])
        cursor.next.mockRejectedValue(new Error('read failed'))
        nativeSearch.open.mockResolvedValue(cursor)

        const props = buildProps('happy')
        const { result } = await renderHook(() => useSearchResults(props))

        await flush()

        expect(result.current.done).toBe(true)
        expect(result.current.scanning).toBe(false)
        expect(logError).toHaveBeenCalled()
    })

    test('hides the previous results until the new search settles', async () => {
        nativeSearch.open.mockResolvedValue(
            createCursor([{ found: [MOCK_SEARCH_NOTES[2]], done: true }])
        )

        const { result, rerender } = await renderHook(
            (props) => useSearchResults(props),
            { initialProps: buildProps('happy') }
        )

        await flush()
        expect(paths(result)).toEqual(['note-3'])

        nativeSearch.open.mockReturnValue(new Promise(() => {}))
        await rerender(buildProps('agenda'))

        expect(result.current.results).toEqual([])
        expect(result.current.loading).toBe(true)
    })

    test('clears the results when the search is disabled', async () => {
        nativeSearch.open.mockResolvedValue(
            createCursor([{ found: [MOCK_SEARCH_NOTES[2]], done: true }])
        )

        const { result, rerender } = await renderHook(
            (props) => useSearchResults(props),
            { initialProps: buildProps('happy') }
        )

        await flush()
        await rerender(buildProps('happy', { enabled: false }))
        await flush()

        expect(result.current.results).toEqual([])
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
