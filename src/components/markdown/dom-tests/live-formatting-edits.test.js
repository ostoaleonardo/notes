import { EditorState, StateEffect } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { liveFormatting } from '../live-formatting/live-formatting'
import { buildDocument } from '../../../../jest/perf-fixtures'

const DOC_SIZE = 3000
const EDIT_COUNT = 150
const SEEDS = [20260514, 1, 2, 3, 4, 5, 6, 8]
const INSERTIONS = [
    'a',
    ' ',
    '\n',
    '\n\n',
    '`',
    '```\n',
    '$',
    '$$',
    '*',
    '**',
    '#',
    '|',
    '>',
    '- ',
    '==',
    '~~',
    '[^9]: note\n'
]

const createRandom = (seed) => {
    let value = seed

    return () => {
        value = (value * 1664525 + 1013904223) % 4294967296

        return value / 4294967296
    }
}

const EXTENSIONS = [markdown({ extensions: GFM }), liveFormatting]

const createState = (doc) => EditorState.create({ doc, selection: { anchor: 0 }, extensions: EXTENSIONS })

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

describe('live formatting document edits', () => {
    test.each(SEEDS)('matches a full rebuild after random edits with seed %i', (seed) => {
        const random = createRandom(seed)
        const doc = buildDocument(DOC_SIZE)
        let state = createState(doc)
        let reference = createState(doc)

        for (let edit = 0; edit < EDIT_COUNT; edit++) {
            const length = state.doc.length
            const from = Math.floor(random() * length)
            const remove = random() < 0.3 ? Math.min(Math.floor(random() * 20), length - from) : 0
            const insert = random() < 0.2 ? '' : INSERTIONS[Math.floor(random() * INSERTIONS.length)]
            const spec = {
                changes: { from, to: from + remove, insert },
                selection: { anchor: from + insert.length }
            }

            state = state.update(spec).state
            reference = reference.update({
                ...spec,
                effects: StateEffect.reconfigure.of(EXTENSIONS)
            }).state

            expect(snapshot(state)).toEqual(snapshot(reference))
        }
    })
})
