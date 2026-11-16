import { syntaxTree } from '@codemirror/language'
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'

import { buildDocDecorationsPlugin } from './markdown-dom-doc-decorations'

import { INLINE_TAG_CLASS } from '@/constants/tags'
import { NOTE_NODES } from '@/constants/note-syntax'

const tagMark = Decoration.mark({ class: INLINE_TAG_CLASS })

const findTagRanges = (state) => {
    const ranges = []

    syntaxTree(state).iterate({
        enter: (node) => {
            if (node.name !== NOTE_NODES.TAG) return
            ranges.push({ from: node.from, to: node.to })
        }
    })

    return ranges
}

const buildInlineTagDecorations = (state) => {
    const builder = new RangeSetBuilder()
    findTagRanges(state).forEach(({ from, to }) => builder.add(from, to, tagMark))
    return builder.finish()
}

const inlineTagHighlight = buildDocDecorationsPlugin(
    (view) => buildInlineTagDecorations(view.state),
    { followSyntaxTree: true }
)

const buildInlineTagPress = (onPressRef) => EditorView.domEventHandlers({
    mousedown: (event, view) => {
        if (view.hasFocus || !event.target.closest?.(`.${INLINE_TAG_CLASS}`)) return false

        const position = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (position === null) return false

        const tag = findTagRanges(view.state).find(({ from, to }) => position >= from && position <= to)
        if (!tag) return false

        event.preventDefault()
        onPressRef.current?.(view.state.doc.sliceString(tag.from + 1, tag.to))
        return true
    }
})

export const inlineTagExtensions = (onPressRef) => [inlineTagHighlight, buildInlineTagPress(onPressRef)]
