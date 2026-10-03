import { EditorView } from '@codemirror/view'

import {
    FRONTMATTER_FENCE,
    FRONTMATTER_FENCE_CHAR,
    FRONTMATTER_FENCE_TYPING
} from '@/constants/frontmatter'

export const getFrontmatterAutoClose = (doc, from, to, text) => {
    if (text !== FRONTMATTER_FENCE_CHAR || from !== to) return null

    const firstLineEnd = doc.indexOf('\n') === -1 ? doc.length : doc.indexOf('\n')
    if (from !== firstLineEnd || doc.slice(0, firstLineEnd) !== FRONTMATTER_FENCE_TYPING) return null

    const hasClosingFence = doc
        .slice(firstLineEnd + 1)
        .split('\n')
        .some((line) => line.trimEnd() === FRONTMATTER_FENCE)
    if (hasClosingFence) return null

    return {
        changes: { from, insert: `${FRONTMATTER_FENCE_CHAR}\n\n${FRONTMATTER_FENCE}` },
        selection: { anchor: from + 2 }
    }
}

export const frontmatterAutoClose = EditorView.inputHandler.of((view, from, to, text) => {
    const result = getFrontmatterAutoClose(view.state.doc.toString(), from, to, text)
    if (!result) return false

    view.dispatch({ ...result, userEvent: 'input.type' })
    return true
})
