import { StateField } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { Decoration, EditorView } from '@codemirror/view'

import { decorateMath } from './math'
import { collectCodeRanges, isRangeSelected } from './utils'

import { MATH_DELIMITER } from '@/features/editor/constants/markdown-live-formatting'

const hasMathDelimiter = (doc) => {
    const cursor = doc.iter()

    while (!cursor.next().done) {
        if (cursor.value.includes(MATH_DELIMITER)) return true
    }

    return false
}

const buildMath = (state) => {
    const tree = syntaxTree(state)
    if (!hasMathDelimiter(state.doc)) return { decorations: Decoration.none, matches: [], tree }

    const ranges = []
    const matches = decorateMath({
        text: state.doc.toString(),
        selection: state.selection.main,
        ranges,
        codeRanges: collectCodeRanges(state)
    })

    return { decorations: Decoration.set(ranges, true), matches, tree }
}

const selectionTouchesMath = (tr, matches) => [tr.startState.selection.main, tr.state.selection.main].some(
    (selection) => matches.some((match) => isRangeSelected(selection, match.from, match.to))
)

export const liveMath = StateField.define({
    create: buildMath,
    update: (value, tr) => {
        if (tr.docChanged || tr.reconfigured || syntaxTree(tr.state) !== value.tree) return buildMath(tr.state)
        if (tr.selection && selectionTouchesMath(tr, value.matches)) return buildMath(tr.state)

        return value
    },
    provide: (field) => EditorView.decorations.from(field, (value) => value.decorations)
})
