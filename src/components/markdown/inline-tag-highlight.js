import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'

import { buildDocDecorationsPlugin } from './markdown-dom-doc-decorations'
import { findInlineTags } from '@/utils/inline-tags'

import { INLINE_TAG_CLASS } from '@/constants/tags'

const tagMark = Decoration.mark({ class: INLINE_TAG_CLASS })

const buildInlineTagDecorations = (state) => {
    const builder = new RangeSetBuilder()
    findInlineTags(state.doc.toString()).forEach(({ from, to }) => builder.add(from, to, tagMark))
    return builder.finish()
}

const inlineTagHighlight = buildDocDecorationsPlugin((view) => buildInlineTagDecorations(view.state))

const buildInlineTagPress = (onPressRef) => EditorView.domEventHandlers({
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
