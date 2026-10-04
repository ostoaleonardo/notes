import { EditorView } from '@codemirror/view'

import { findBlocks } from '@/utils/block-refs'

import {
    BLOCK_HIGHLIGHT_CLASS,
    BLOCK_HIGHLIGHT_DURATION,
    BLOCK_ID_ATTRIBUTE
} from '@/constants/block-refs'

export const scrollToPreviewBlock = (container, id) => {
    const element = container.querySelector(`[${BLOCK_ID_ATTRIBUTE}="${CSS.escape(id)}"]`)
    if (!element) return false

    element.scrollIntoView({ block: 'center' })
    element.classList.add(BLOCK_HIGHLIGHT_CLASS)
    setTimeout(() => element.classList.remove(BLOCK_HIGHLIGHT_CLASS), BLOCK_HIGHLIGHT_DURATION)

    return true
}

export const scrollToEditorBlock = (view, id) => {
    const block = findBlocks(view.state.doc.toString()).find((item) => item.id === id)
    if (!block) return false

    view.dispatch({
        selection: { anchor: block.idFrom },
        effects: EditorView.scrollIntoView(block.idFrom, { y: 'center' })
    })

    return true
}
