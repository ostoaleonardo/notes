import { EditorView } from '@codemirror/view'

import {
    FRONTMATTER_FENCE,
    FRONTMATTER_FENCE_CHAR,
    FRONTMATTER_FENCE_TYPING
} from '@/constants/frontmatter'

const typesOnFirstLine = (view, from, to, text) => (
    text === FRONTMATTER_FENCE_CHAR && from === to && view.state.doc.lineAt(from).number === 1
)

export const isFrontmatterFenceCompletion = (doc, from, to, text) => {
    if (text !== FRONTMATTER_FENCE_CHAR || from !== to) return false

    const lineBreak = doc.indexOf('\n')
    const firstLineEnd = lineBreak === -1 ? doc.length : lineBreak

    return from === firstLineEnd && doc.slice(0, firstLineEnd) === FRONTMATTER_FENCE_TYPING
}

export const getFrontmatterAutoClose = (doc, from, to, text) => {
    if (!isFrontmatterFenceCompletion(doc, from, to, text)) return null

    const hasClosingFence = doc
        .slice(from + 1)
        .split('\n')
        .some((line) => line.trimEnd() === FRONTMATTER_FENCE)
    if (hasClosingFence) return null

    return {
        changes: { from, insert: `${FRONTMATTER_FENCE_CHAR}\n\n${FRONTMATTER_FENCE}` },
        selection: { anchor: from + FRONTMATTER_FENCE_CHAR.length + 1 }
    }
}

export const frontmatterAutoClose = EditorView.inputHandler.of((view, from, to, text) => {
    if (!typesOnFirstLine(view, from, to, text)) return false

    const result = getFrontmatterAutoClose(view.state.doc.toString(), from, to, text)
    if (!result) return false

    view.dispatch({ ...result, userEvent: 'input.type' })
    return true
})

export const buildPropertiesTrigger = (onTriggerRef) => EditorView.inputHandler.of((view, from, to, text) => {
    if (!typesOnFirstLine(view, from, to, text)) return false
    if (!isFrontmatterFenceCompletion(view.state.doc.toString(), from, to, text)) return false

    view.dispatch({ changes: { from: 0, to: from }, userEvent: 'input.type' })
    onTriggerRef.current?.()
    return true
})
