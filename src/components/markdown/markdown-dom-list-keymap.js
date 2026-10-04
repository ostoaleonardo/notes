import { EditorSelection } from '@codemirror/state'

import { getListBackspaceEdit, getListEnterEdit } from '@/utils/list-edit'

const applyEdit = (getEdit) => (view) => {
    const { state } = view
    const { from, to } = state.selection.main
    if (from !== to) return false

    const line = state.doc.lineAt(from)
    const edit = getEdit(line.text, from - line.from)
    if (!edit) return false

    view.dispatch({
        changes: { from: line.from + edit.from, to: line.from + edit.to, insert: edit.insert },
        selection: EditorSelection.cursor(line.from + edit.cursor)
    })
    return true
}

export const listKeymap = [
    { key: 'Enter', run: applyEdit(getListEnterEdit) },
    { key: 'Backspace', run: applyEdit(getListBackspaceEdit) }
]
