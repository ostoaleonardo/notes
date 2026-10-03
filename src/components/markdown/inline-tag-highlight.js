import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'

import { findInlineTags } from '../../utils/inline-tags'

import { INLINE_TAG_CLASS } from '../../constants/tags'

const tagMark = Decoration.mark({ class: INLINE_TAG_CLASS })

const buildDecorations = (state) => {
    const builder = new RangeSetBuilder()
    findInlineTags(state.doc.toString()).forEach(({ from, to }) => builder.add(from, to, tagMark))
    return builder.finish()
}

const inlineTagHighlight = ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = buildDecorations(view.state)
    }

    update(update) {
        if (update.docChanged) this.decorations = buildDecorations(update.state)
    }
}, {
    decorations: (instance) => instance.decorations
})

export const buildInlineTagPress = (onPressRef) => EditorView.domEventHandlers({
    mousedown: (event, view) => {
        if (view.hasFocus || !event.target.closest?.(`.${INLINE_TAG_CLASS}`)) return false

        const position = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (position === null) return false

        const tag = findInlineTags(view.state.doc.toString())
            .find(({ from, to }) => position >= from && position <= to)
        if (!tag) return false

        event.preventDefault()
        onPressRef.current?.(tag.name)
        return true
    }
})

export const inlineTagExtensions = (onPressRef) => [inlineTagHighlight, buildInlineTagPress(onPressRef)]
