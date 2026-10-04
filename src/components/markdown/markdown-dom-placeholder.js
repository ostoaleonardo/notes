import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view'

import { PLACEHOLDER_CLASS, PLACEHOLDER_POINTER_EVENTS } from '@/constants/editor-placeholder'

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
        if (/\S/.test(chunk)) return false
    }
    return true
}

const buildDecorations = (view, text) => (
    isBlankDoc(view.state.doc)
        ? Decoration.set([Decoration.widget({ widget: new PlaceholderWidget(text), side: 1 }).range(0)])
        : Decoration.none
)

export const buildBlankPlaceholder = (text) => (
    text
        ? ViewPlugin.fromClass(class {
            constructor(view) {
                this.decorations = buildDecorations(view, text)
            }

            update(update) {
                if (update.docChanged) this.decorations = buildDecorations(update.view, text)
            }
        }, { decorations: (plugin) => plugin.decorations })
        : []
)
