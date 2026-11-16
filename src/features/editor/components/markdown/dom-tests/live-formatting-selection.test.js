import { EditorState, StateEffect } from '@codemirror/state'
import { ensureSyntaxTree } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { liveFormatting } from '../live-formatting/live-formatting'
import { buildDocument } from '../../../../../../jest/perf-fixtures'

const STEP = 7
const DOC_SIZE = 4000

const createState = (doc, selection) => {
    const parsed = EditorState.create({
        doc,
        selection,
        extensions: [markdown({ extensions: GFM })]
    })

    ensureSyntaxTree(parsed, doc.length, 5000)

    return parsed.update({ effects: StateEffect.appendConfig.of(liveFormatting) }).state
}

const snapshot = (state) => {
    const found = []

    state.field(liveFormatting).between(0, state.doc.length, (from, to, value) => {
        found.push([
            from,
            to,
            value.spec.class || '',
            value.spec.widget?.constructor.name || '',
            value.startSide
        ].join('|'))
    })

    return found
}

describe('live formatting selection updates', () => {
    test('matches a full rebuild after every cursor move', () => {
        const doc = buildDocument(DOC_SIZE)
        let state = createState(doc, { anchor: 0 })

        for (let anchor = 0; anchor <= doc.length; anchor += STEP) {
            state = state.update({ selection: { anchor } }).state
            const fresh = createState(doc, { anchor })

            expect(snapshot(state)).toEqual(snapshot(fresh))
        }
    })

    test('matches a full rebuild after jumping between distant positions', () => {
        const doc = buildDocument(DOC_SIZE)
        let state = createState(doc, { anchor: 0 })

        for (const anchor of [3900, 10, 2000, 3999, 0, 1234]) {
            state = state.update({ selection: { anchor } }).state

            expect(snapshot(state)).toEqual(snapshot(createState(doc, { anchor })))
        }
    })

    test('matches a full rebuild for range selections', () => {
        const doc = buildDocument(DOC_SIZE)
        let state = createState(doc, { anchor: 0 })

        for (const [anchor, head] of [[100, 900], [50, 3500], [1500, 1510]]) {
            state = state.update({ selection: { anchor, head } }).state

            expect(snapshot(state)).toEqual(snapshot(createState(doc, { anchor, head })))
        }
    })
})
