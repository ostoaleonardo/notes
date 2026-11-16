import { getSearchSummary } from '../search-summary'

const base = { showLoader: false, searching: false, partial: false, count: 13 }

describe('search summary', () => {
    test('shows the number and no loader once the search is idle', () => {
        expect(getSearchSummary(base)).toEqual({ loader: false, key: 'search.results' })
    })

    test('shows the partial number when more results may come and nothing is loading', () => {
        expect(getSearchSummary({ ...base, partial: true })).toEqual({ loader: false, key: 'search.results_partial' })
    })

    test('replaces the number with the loader while the indicator is visible', () => {
        expect(getSearchSummary({ ...base, showLoader: true })).toEqual({ loader: true, key: 'search.results_label' })
    })

    test('replaces the partial number with the loader while more results load', () => {
        const summary = getSearchSummary({ ...base, showLoader: true, partial: true })

        expect(summary).toEqual({ loader: true, key: 'search.results_label' })
    })

    test('shows the loader instead of a zero count while waiting for the first results', () => {
        const summary = getSearchSummary({ ...base, searching: true, count: 0 })

        expect(summary).toEqual({ loader: true, key: 'search.results_label' })
    })

    test('keeps the number when a new search already has results', () => {
        expect(getSearchSummary({ ...base, searching: true, count: 5 }).loader).toBe(false)
    })

    test('never asks for the loader and a number label at the same time', () => {
        const flags = [true, false]

        flags.forEach((showLoader) => flags.forEach((searching) => flags.forEach((partial) => [0, 5].forEach((count) => {
            const { loader, key } = getSearchSummary({ showLoader, searching, partial, count })

            expect(loader).toBe(key === 'search.results_label')
        }))))
    })
})
