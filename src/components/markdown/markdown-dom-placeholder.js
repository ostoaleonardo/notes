import { Decoration, WidgetType } from '@codemirror/view'

import { buildDocDecorationsPlugin } from './markdown-dom-doc-decorations'

import { PLACEHOLDER_CLASS, PLACEHOLDER_POINTER_EVENTS } from '@/constants/editor-placeholder'
import { NON_WHITESPACE_PATTERN } from '@/constants/markdown-patterns'

class PlaceholderWidget extends WidgetType {
    constructor(text) {
        super()
        this.text = text
    }

    eq(other) {
        return other.text === this.text
    }

    toDOM() {
        const element = document.createElement('span')
        element.className = PLACEHOLDER_CLASS
        element.style.pointerEvents = PLACEHOLDER_POINTER_EVENTS
        element.setAttribute('aria-hidden', 'true')
        element.textContent = this.text
        return element
    }

    ignoreEvent() {
        return false
    }
}

export const isBlankDoc = (doc) => {
    for (const chunk of doc.iter()) {
        if (NON_WHITESPACE_PATTERN.test(chunk)) return false
    }
    return true
}

const buildPlaceholderDecorations = (view, text) => (
    isBlankDoc(view.state.doc)
        ? Decoration.set([Decoration.widget({ widget: new PlaceholderWidget(text), side: 1 }).range(0)])
        : Decoration.none
)

export const buildBlankPlaceholder = (text) => (
    text
        ? buildDocDecorationsPlugin((view) => buildPlaceholderDecorations(view, text))
        : []
)
