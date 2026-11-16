import { findBacklinks } from '../wiki-links'
import { findUnlinkedMentions } from '../../features/editor/native/utils/unlinked-mentions'
import { searchNotes } from '../search-filter'
import { parseSearchQuery } from '../search-parser'
import { buildNotes, measure, report } from '../../../jest/perf-fixtures'

const SIZES = [1000, 5000]
const TARGET_INDEX = 7
const CHANGED_INDEX = 3

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

        findBacklinks(target.path, notes)

        let edits = 0
        const afterSave = measure(() => {
            edits += 1
            const next = notes.map((note, index) => (
                index === CHANGED_INDEX ? { ...note, note: `${note.note}\nedit ${edits}` } : note
            ))

            findBacklinks(target.path, next)
        })

        const warm = measure(() => findBacklinks(target.path, notes))
        const mentions = measure(() => findUnlinkedMentions(target, notes))
        const search = measure(() => searchNotes(notes, ast, context, null))

        results.push(
            `${String(count).padStart(5)} notes  backlinks cold ${cold.toFixed(1)} ms` +
            `  after save ${afterSave.toFixed(1)} ms  warm ${warm.toFixed(2)} ms` +
            `  mentions ${mentions.toFixed(1)} ms  search ${search.toFixed(1)} ms`
        )
    })

    afterAll(() => report('Vault operations (median)', results))
})
