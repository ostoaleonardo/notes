import { EditorView } from '@codemirror/view'

const URL_PATTERN = /^https?:\/\/\S+$/

export const pasteUrlOverSelection = EditorView.domEventHandlers({
    paste: (event, view) => {
        const { from, to } = view.state.selection.main
        if (from === to) return false

        const text = event.clipboardData?.getData('text/plain')
        if (!text || !URL_PATTERN.test(text.trim())) return false

        const label = view.state.sliceDoc(from, to)
        const insert = `[${label}](${text.trim()})`

        view.dispatch({
            changes: { from, to, insert },
            selection: { anchor: from + insert.length }
        })

        event.preventDefault()
        return true
    }
})
