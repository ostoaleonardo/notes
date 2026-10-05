import { EditorSelection, Prec } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { EditorView, keymap } from '@codemirror/view'

import { getPairAction, isEmptyPair } from '@/utils/auto-pair'

import { AUTO_PAIR_ACTIONS, AUTO_PAIR_CHARS } from '@/constants/markdown-patterns'
import { CODE_RANGE_NODE_NAMES } from '@/constants/markdown-live-formatting'

const isInsideCode = (state, pos) => {
    for (let node = syntaxTree(state).resolveInner(pos, -1); node; node = node.parent) {
        if (CODE_RANGE_NODE_NAMES.includes(node.name)) return true
    }

    return false
}

const getContext = (state, from, to) => {
    const line = state.doc.lineAt(from)

    return {
        before: state.sliceDoc(line.from, from),
        after: state.sliceDoc(to, line.to),
        selected: state.sliceDoc(from, to)
    }
}

const applyAction = (view, action, char, from, to) => {
    switch (action) {
        case AUTO_PAIR_ACTIONS.WRAP:
            view.dispatch({
                changes: [{ from, insert: char }, { from: to, insert: char }],
                selection: EditorSelection.range(from + char.length, to + char.length),
                userEvent: 'input.type'
            })
            break
        case AUTO_PAIR_ACTIONS.EXPAND:
            view.dispatch({
                changes: { from, insert: char + char },
                selection: EditorSelection.cursor(from + char.length),
                userEvent: 'input.type'
            })
            break
        case AUTO_PAIR_ACTIONS.SKIP:
            view.dispatch({ selection: EditorSelection.cursor(from + char.length), userEvent: 'select' })
            break
        default:
            view.dispatch({
                changes: { from, insert: char + char },
                selection: EditorSelection.cursor(from + char.length),
                userEvent: 'input.type'
            })
    }
}

const handleInput = (view, from, to, text) => {
    if (!AUTO_PAIR_CHARS.includes(text) || isInsideCode(view.state, from)) return false

    const context = getContext(view.state, from, to)
    const action = getPairAction({ char: text, ...context })
    if (!action) return false

    applyAction(view, action, text, from, to)
    return true
}

const deleteEmptyPair = (view) => {
    const { from, to } = view.state.selection.main
    if (from !== to) return false

    const { before, after } = getContext(view.state, from, to)
    const char = before.slice(-1)
    if (!AUTO_PAIR_CHARS.includes(char) || !isEmptyPair({ char, before, after })) return false

    view.dispatch({
        changes: { from: from - 1, to: from + 1, insert: '' },
        selection: EditorSelection.cursor(from - 1),
        userEvent: 'delete.backward'
    })
    return true
}

export const markdownAutoPair = [
    EditorView.inputHandler.of(handleInput),
    Prec.high(keymap.of([{ key: 'Backspace', run: deleteEmptyPair }]))
]
