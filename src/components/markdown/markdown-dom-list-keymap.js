import { EditorSelection } from '@codemirror/state'

const LIST_LINE_PATTERN = /^(\s*)([-*+]|\d+\.)(\s+)(\[[ xX]\]\s+)?/

const continueList = (view) => {
    const { state } = view
    const { from, to } = state.selection.main
    if (from !== to) return false

    const line = state.doc.lineAt(from)
    if (from !== line.to) return false

    const match = line.text.match(LIST_LINE_PATTERN)
    if (!match) return false

    const [full, indent, marker, spacing, checkbox] = match
    const content = line.text.slice(full.length)

    if (content.trim() === '') {
        view.dispatch({
            changes: { from: line.from, to: line.to, insert: indent },
            selection: EditorSelection.cursor(line.from + indent.length)
        })
        return true
    }

    const nextMarker = /^\d+\.$/.test(marker) ? `${parseInt(marker, 10) + 1}.` : marker
    const insert = `\n${indent}${nextMarker}${spacing}${checkbox ? '[ ] ' : ''}`

    view.dispatch({
        changes: { from, insert },
        selection: EditorSelection.cursor(from + insert.length)
    })
    return true
}

export const listKeymap = [{ key: 'Enter', run: continueList }]
