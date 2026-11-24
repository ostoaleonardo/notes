import { findUnlinkedMentions } from '@/features/editor/native/utils/unlinked-mentions'
import { buildNotes, measure, report } from '../../../../jest/perf-fixtures'

const SIZES = [1000, 5000]
const TARGET_INDEX = 7

describe('repository operations', () => {
    const results = []

    test.each(SIZES)('runs link and search operations on %i notes', (count) => {
        const notes = buildNotes(count)
        const target = notes[TARGET_INDEX]

        const mentions = measure(() => findUnlinkedMentions(target, notes))

        results.push(
            `${String(count).padStart(5)} notes  mentions scan ${mentions.toFixed(1)} ms`
        )
    })

    afterAll(() => report('Repository operations (median)', results))
})
