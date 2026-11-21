import { findBacklinks } from '../wiki-links'
import { findUnlinkedMentions } from '@/features/editor/native/utils/unlinked-mentions'
import { searchNotes } from '../search-filter'
import { parseSearchQuery } from '../search-parser'
import { buildNotes, measure, report } from '../../../../jest/perf-fixtures'

const SIZES = [1000, 5000]
const TARGET_INDEX = 7

const timeOnce = (fn) => {
    const start = performance.now()
    fn()

    return performance.now() - start
}

describe('vault operations', () => {
    const results = []

    test.each(SIZES)('runs link and search operations on %i notes', (count) => {
        const notes = buildNotes(count)
        const target = notes[TARGET_INDEX]
        const context = { pinned: new Set(), notePaths: new Map() }
        const ast = parseSearchQuery('topic 12 -tag3')

        const coldNotes = buildNotes(count)
        const cold = timeOnce(() => findBacklinks(target.path, coldNotes))

        const mentions = measure(() => findUnlinkedMentions(target, notes))
        const search = measure(() => searchNotes(notes, ast, context, null))

        results.push(
            `${String(count).padStart(5)} notes  backlinks scan ${cold.toFixed(1)} ms` +
            `  mentions scan ${mentions.toFixed(1)} ms  search ${search.toFixed(1)} ms`
        )
    })

    afterAll(() => report('Vault operations (median)', results))
})
