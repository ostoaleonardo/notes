import { EditorState, StateEffect } from '@codemirror/state'
import { ensureSyntaxTree } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { liveFormatting } from '../live-formatting/live-formatting'
import { buildDocument, measure, report } from '../../../../../../jest/perf-fixtures'

const SIZES = [1500, 7000, 30000, 120000]

const createState = (doc) => {
    const parsed = EditorState.create({
        doc,
        selection: { anchor: 0 },
        extensions: [markdown({ extensions: GFM })]
    })

    ensureSyntaxTree(parsed, doc.length, 60000)

    return parsed.update({ effects: StateEffect.appendConfig.of(liveFormatting) }).state
}

describe('live formatting decorations', () => {
    const results = []

    test.each(SIZES)('moves the cursor in a %i character note', (size) => {
        const doc = buildDocument(size)
        const state = createState(doc)
        const middle = Math.floor(doc.length / 2)
        let toggle = 0

        const cursorMove = measure(() => {
            toggle = toggle ? 0 : 1
            state.update({ selection: { anchor: middle + toggle } }).state
        })

        const typing = measure(() => {
            state.update({ changes: { from: middle, insert: 'x' } }).state
        })

        results.push(`${String(size).padStart(7)} chars  cursor ${cursorMove.toFixed(1)} ms  typing ${typing.toFixed(1)} ms`)
    })

    afterAll(() => report('Live formatting (median)', results))
})
