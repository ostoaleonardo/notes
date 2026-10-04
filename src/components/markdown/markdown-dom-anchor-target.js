import { EditorView } from '@codemirror/view'

import { findBlocks } from '@/utils/block-refs'
import { findHeadings, normalizeHeading } from '@/utils/headings'

import {
    BLOCK_ANCHOR_PREFIX,
    BLOCK_HIGHLIGHT_CLASS,
    BLOCK_HIGHLIGHT_DURATION,
    BLOCK_ID_ATTRIBUTE
} from '@/constants/block-refs'
import { HEADING_SELECTOR } from '@/constants/headings'

const isBlockAnchor = (anchor) => anchor?.startsWith(BLOCK_ANCHOR_PREFIX)

const highlight = (element) => {
    element.scrollIntoView({ block: 'center' })
    element.classList.add(BLOCK_HIGHLIGHT_CLASS)
    setTimeout(() => element.classList.remove(BLOCK_HIGHLIGHT_CLASS), BLOCK_HIGHLIGHT_DURATION)
}

const findPreviewElement = (container, { anchor, headingIndex }) => {
    const headings = [...container.querySelectorAll(HEADING_SELECTOR)]

    if (headingIndex != null) return headings[headingIndex]

    if (isBlockAnchor(anchor)) {
        const id = anchor.slice(BLOCK_ANCHOR_PREFIX.length)
        return container.querySelector(`[${BLOCK_ID_ATTRIBUTE}="${CSS.escape(id)}"]`)
    }

    const name = normalizeHeading(anchor)
    return headings.find((heading) => normalizeHeading(heading.textContent) === name)
}

const findEditorPosition = (doc, { anchor, headingIndex }) => {
    const headings = findHeadings(doc)

    if (headingIndex != null) return headings[headingIndex]?.from

    if (isBlockAnchor(anchor)) {
        const id = anchor.slice(BLOCK_ANCHOR_PREFIX.length)
        return findBlocks(doc).find((block) => block.id === id)?.idFrom
    }

    const name = normalizeHeading(anchor)
    return headings.find((heading) => normalizeHeading(heading.text) === name)?.from
}

export const scrollToPreviewTarget = (container, target) => {
    const element = findPreviewElement(container, target)
    if (!element) return false

    highlight(element)
    return true
}

export const scrollToEditorTarget = (view, target) => {
    const position = findEditorPosition(view.state.doc.toString(), target)
    if (position == null) return false

    view.dispatch({
        selection: { anchor: position },
        effects: EditorView.scrollIntoView(position, { y: 'center' })
    })

    return true
}
