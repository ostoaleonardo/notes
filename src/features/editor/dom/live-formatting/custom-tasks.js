import { Decoration, WidgetType } from '@codemirror/view'

import { isRangeSelected, overlapsAny } from './utils'

import {
    CUSTOM_TASK_BOX_MARGIN,
    CUSTOM_TASK_BOX_RADIUS,
    CUSTOM_TASK_BOX_SIZE,
    CUSTOM_TASK_GLYPH_SIZE,
    CUSTOM_TASK_LIVE_CLASS,
    CUSTOM_TASK_MARKER_LENGTH,
    TASK_UNCHECKED_MARK
} from '@/shared/constants/tasks'
import {
    CUSTOM_TASK_STATUS_OFFSET,
    NOTE_NODES
} from '@/shared/constants/note-syntax'

class CustomTaskWidget extends WidgetType {
    constructor(status, from, to) {
        super()
        this.status = status
        this.from = from
        this.to = to
    }

    eq(other) {
        return other.status === this.status && other.from === this.from && other.to === this.to
    }

    toDOM(view) {
        const box = document.createElement('span')
        box.className = CUSTOM_TASK_LIVE_CLASS
        box.textContent = this.status

        box.addEventListener('mousedown', (event) => event.preventDefault())
        box.addEventListener('click', () => {
            view.dispatch({
                changes: { from: this.from, to: this.to, insert: `[${TASK_UNCHECKED_MARK}]` }
            })
        })

        return box
    }
}

export const findCustomTaskRanges = (tree, text, from = 0, to = text.length) => {
    const ranges = []

    tree.iterate({
        from,
        to,
        enter: (node) => {
            if (node.name !== NOTE_NODES.CUSTOM_TASK_MARKER) return
            if (node.from < from || node.to > to) return false

            const start = node.from - from
            ranges.push({
                from: start,
                to: start + CUSTOM_TASK_MARKER_LENGTH,
                status: text[start + CUSTOM_TASK_STATUS_OFFSET]
            })
            return false
        }
    })

    return ranges
}

export const decorateCustomTasks = ({ customTaskRanges, selection, ranges, codeRanges }) => {
    for (const { from, to, status } of customTaskRanges) {
        if (isRangeSelected(selection, from, to) || overlapsAny(from, to, codeRanges)) continue

        ranges.push(Decoration.replace({ widget: new CustomTaskWidget(status, from, to) }).range(from, to))
    }
}

export const customTasksTheme = ({ colors }) => ({
    [`.${CUSTOM_TASK_LIVE_CLASS}`]: {
        display: 'inline-block',
        boxSizing: 'border-box',
        width: CUSTOM_TASK_BOX_SIZE,
        height: CUSTOM_TASK_BOX_SIZE,
        lineHeight: CUSTOM_TASK_BOX_SIZE,
        textAlign: 'center',
        verticalAlign: 'middle',
        margin: CUSTOM_TASK_BOX_MARGIN,
        borderRadius: CUSTOM_TASK_BOX_RADIUS,
        backgroundColor: colors.tertiary,
        fontSize: CUSTOM_TASK_GLYPH_SIZE,
        fontWeight: 'bold',
        color: colors.background,
        cursor: 'pointer'
    }
})
