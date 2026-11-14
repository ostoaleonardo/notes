import { EditorState } from '@codemirror/state'
import { ensureSyntaxTree } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { liveFormatting } from '../live-formatting/live-formatting'

const DOC = 'intro\n\n```js\nconst a = 1\n```\n\noutro'
const OPEN_FENCE = { from: 7, to: 12 }
const CLOSE_FENCE = { from: 25, to: 28 }

const collect = (cursor, doc = DOC) => {
    const state = EditorState.create({
        doc,
        selection: { anchor: cursor },
        extensions: [markdown({ extensions: GFM }), liveFormatting]
    })
    ensureSyntaxTree(state, doc.length, 5000)

    const refreshed = state.update({ selection: { anchor: cursor } }).state
    const found = []
    refreshed.field(liveFormatting).between(0, doc.length, (from, to, value) => {
        found.push({ from, to, replace: value.spec.class === 'cm-live-codeblock-hidden' })
    })

    return found
}

const replacedRanges = (found) => found.filter((item) => item.replace)

describe('code block fences in live mode', () => {
    test('hides both fences behind a label when the cursor is outside', () => {
        const replaced = replacedRanges(collect(0))

        expect(replaced).toContainEqual(expect.objectContaining(OPEN_FENCE))
        expect(replaced).toContainEqual(expect.objectContaining(CLOSE_FENCE))
    })

    test('shows the raw fences when the cursor is inside the block', () => {
        const found = collect(18)

        expect(replacedRanges(found)).toHaveLength(0)
        expect(found.some((item) => item.from === 7 && item.to === 10)).toBe(true)
    })

    test('does not touch an unclosed block closing line', () => {
        const doc = 'x\n\n```js\ncode'
        const replaced = replacedRanges(collect(0, doc))

        expect(replaced).toHaveLength(1)
        expect(replaced[0]).toMatchObject({ from: 3, to: 8 })
    })
})
